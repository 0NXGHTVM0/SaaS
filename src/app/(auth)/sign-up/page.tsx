import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";

export default function SignUpPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-background p-6 text-foreground">
      <div className="w-full max-w-md space-y-4">
        <AuthForm mode="sign-up" />
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link className="font-medium text-primary" href="/sign-in">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
