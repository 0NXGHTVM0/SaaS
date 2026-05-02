import Link from "next/link";
import {
  AlertTriangle,
  BarChart3,
  Bell,
  Bot,
  CheckCircle2,
  ClipboardList,
  FileText,
  HelpCircle,
  Menu,
  PackageCheck,
  Search,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { label: "Command Center", href: "/dashboard", icon: ShieldCheck },
  { label: "Payment Runs", href: "/dashboard", icon: ClipboardList },
  { label: "Invoices", href: "/dashboard/invoices", icon: FileText },
  { label: "Exceptions", href: "/dashboard/invoices", icon: AlertTriangle },
  { label: "Suppliers", href: "/dashboard/suppliers", icon: Users },
  { label: "Purchase Orders", href: "/dashboard/upload", icon: PackageCheck },
  { label: "AI Extraction", href: "/dashboard/upload", icon: Bot },
  { label: "Approvals", href: "/dashboard/invoices", icon: CheckCircle2 },
  { label: "Reports", href: "/dashboard", icon: BarChart3 },
  { label: "Controls", href: "/dashboard/suppliers", icon: Settings },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#061014] text-slate-100">
      <header className="sticky top-0 z-30 flex h-16 items-center border-b border-white/10 bg-[#071015]/95 px-4 backdrop-blur">
        <Button variant="ghost" size="icon" className="mr-4 text-slate-200">
          <Menu className="h-5 w-5" />
        </Button>
        <Link href="/dashboard" className="mr-8 text-xl font-semibold">
          Payment Control
        </Link>
        <div className="relative hidden w-full max-w-3xl md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <Input
            className="h-10 border-white/10 bg-white/[0.03] pl-10 text-sm text-slate-100 placeholder:text-slate-500"
            placeholder="Search invoices, suppliers, PO, VAT ID..."
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-xs text-slate-400">
            ⌘ K
          </kbd>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative text-slate-300">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1 top-1 grid h-4 w-4 place-items-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              7
            </span>
          </Button>
          <Button variant="ghost" size="icon" className="text-slate-300">
            <HelpCircle className="h-5 w-5" />
          </Button>
          <Avatar className="h-9 w-9 border border-white/10">
            <AvatarFallback className="bg-slate-800 text-slate-200">
              AC
            </AvatarFallback>
          </Avatar>
        </div>
      </header>
      <div className="grid min-h-[calc(100vh-4rem)] grid-cols-1 lg:grid-cols-[216px_1fr]">
        <aside className="hidden border-r border-white/10 bg-[#071015] p-3 lg:block">
          <nav className="space-y-1">
            {navItems.map((item, index) => (
              <Link
                href={item.href}
                key={`${item.label}-${index}`}
                className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-slate-400 transition hover:bg-white/[0.06] hover:text-slate-100 first:bg-cyan-400/10 first:text-slate-100"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
          <Separator className="my-6 bg-white/10" />
          <div className="space-y-3 px-2 text-sm">
            <p className="font-medium text-slate-200">Filter Shortcuts</p>
            {[
              ["High Risk", "23", "bg-red-500"],
              ["On Hold", "17", "bg-amber-500"],
              ["Disputed", "9", "bg-rose-500"],
              ["VAT Mismatch", "14", "bg-teal-400"],
              ["Duplicate", "8", "bg-blue-400"],
            ].map(([label, count, color]) => (
              <div
                key={label}
                className="flex items-center justify-between text-slate-400"
              >
                <span className="flex items-center gap-2">
                  <span className={`h-1.5 w-1.5 rounded-full ${color}`} />
                  {label}
                </span>
                <Badge className="bg-white/10 text-slate-200">{count}</Badge>
              </div>
            ))}
          </div>
          <p className="absolute bottom-5 text-xs text-slate-500">
            Last updated: 2 min ago
          </p>
        </aside>
        {children}
      </div>
    </div>
  );
}

export function ShellMain({ children }: { children: React.ReactNode }) {
  return <main className="min-w-0 p-3 md:p-5">{children}</main>;
}
