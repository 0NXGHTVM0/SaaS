import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { headers } from "next/headers";
import { getDb, hasDatabaseUrl } from "@/lib/db";
import * as schema from "@/lib/db/schema";

type AuthInstance = ReturnType<typeof betterAuth>;

let authInstance: AuthInstance | null = null;

export function getAuth() {
  if (!authInstance) {
    const authConfig = {
      secret:
        process.env.BETTER_AUTH_SECRET ??
        "dev-only-change-me-before-production-use",
      baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
      database: hasDatabaseUrl()
        ? drizzleAdapter(getDb(), {
            provider: "pg",
            schema: {
              user: schema.authUsers,
              session: schema.authSessions,
              account: schema.authAccounts,
              verification: schema.authVerifications,
            },
          })
        : undefined,
      emailAndPassword: {
        enabled: true,
      },
      plugins: [nextCookies()],
    };

    authInstance = betterAuth(authConfig) as AuthInstance;
  }

  return authInstance;
}

export async function getSession() {
  if (!hasDatabaseUrl()) {
    return null;
  }

  try {
    const auth = getAuth();
    return await auth.api.getSession({
      headers: await headers(),
    });
  } catch {
    return null;
  }
}

export async function getAuthUser() {
  const session = await getSession();
  return session?.user ?? null;
}
