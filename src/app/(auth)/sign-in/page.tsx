import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";

export default function SignInPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-background p-6 text-foreground">
      <div className="w-full max-w-md space-y-4">
        <AuthForm mode="sign-in" />
        <p className="text-center text-sm text-muted-foreground">
          No account yet?{" "}
          <Link className="font-medium text-primary" href="/sign-up">
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}
