import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { getSession } from "@/lib/auth/server";
import { hasDatabaseUrl } from "@/lib/db";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (hasDatabaseUrl()) {
    const session = await getSession();

    if (!session) {
      redirect("/sign-in");
    }
  }

  return <DashboardShell>{children}</DashboardShell>;
}
