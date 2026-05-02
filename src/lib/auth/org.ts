import { eq } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth/server";
import { getDb, hasDatabaseUrl } from "@/lib/db";
import { organizations, users } from "@/lib/db/schema";

export type RequestContext = {
  orgId: string;
  userId: string;
  email: string;
  isDemo: boolean;
};

export async function getRequestContext(): Promise<RequestContext> {
  const authUser = await getAuthUser();

  if (!hasDatabaseUrl() || !authUser) {
    return {
      orgId: "demo-org",
      userId: "demo-user",
      email: "demo@invoicecopilot.local",
      isDemo: true,
    };
  }

  const db = getDb();
  const existingUser = await db.query.users.findFirst({
    where: eq(users.authUserId, authUser.id),
  });

  if (existingUser) {
    return {
      orgId: existingUser.orgId,
      userId: existingUser.id,
      email: existingUser.email,
      isDemo: false,
    };
  }

  const [organization] = await db
    .insert(organizations)
    .values({
      name: `${authUser.name || authUser.email}'s workspace`,
    })
    .returning();
  const [appUser] = await db
    .insert(users)
    .values({
      orgId: organization.id,
      authUserId: authUser.id,
      email: authUser.email,
      name: authUser.name,
      role: "owner",
    })
    .returning();

  return {
    orgId: organization.id,
    userId: appUser.id,
    email: appUser.email,
    isDemo: false,
  };
}
