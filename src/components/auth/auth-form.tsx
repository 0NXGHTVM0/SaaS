"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsPending(true);

    try {
      const client = authClient as typeof authClient & {
        signIn: { email: (input: unknown) => Promise<{ error?: { message?: string } | null }> };
        signUp: { email: (input: unknown) => Promise<{ error?: { message?: string } | null }> };
      };
      const response =
        mode === "sign-in"
          ? await client.signIn.email({ email, password })
          : await client.signUp.email({ name, email, password });

      if (response.error) {
        throw new Error(response.error.message ?? "Authentication failed.");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (authError) {
      setError(
        authError instanceof Error
          ? authError.message
          : "Authentication failed.",
      );
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Card className="w-full max-w-md border-border bg-card">
      <CardHeader>
        <CardTitle>
          {mode === "sign-in" ? "Sign in" : "Create your workspace"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit}>
          {mode === "sign-up" ? (
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                autoComplete="name"
                onChange={(event) => setName(event.target.value)}
                required
                value={name}
              />
            </div>
          ) : null}
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input
              autoComplete="email"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <Input
              autoComplete={
                mode === "sign-in" ? "current-password" : "new-password"
              }
              minLength={8}
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </div>
          {error ? (
            <div className="rounded border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-500">
              {error}
            </div>
          ) : null}
          <Button className="w-full" disabled={isPending} type="submit">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {mode === "sign-in" ? "Sign in" : "Create account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
