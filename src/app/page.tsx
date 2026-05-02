import Link from "next/link";
import { ArrowRight, CheckCircle2, FileSearch, ShieldAlert } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#061014] text-slate-100">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-center px-6 py-12">
        <div className="grid gap-10 lg:grid-cols-[1fr_520px] lg:items-center">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-sm text-cyan-200">
              <ShieldAlert className="h-4 w-4" />
              Pre-payment invoice control for small teams
            </div>
            <h1 className="max-w-4xl text-5xl font-semibold tracking-tight md:text-7xl">
              Stop overpaying supplier invoices.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
              Upload an invoice and its PO, quote, or contract. Invoice
              Exception Copilot checks prices, quantities, payment terms, tax,
              duplicate invoices, and bank details before you pay.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "bg-cyan-400 text-slate-950 hover:bg-cyan-300",
                )}
              >
                Check your first invoice
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/dashboard/upload"
                className={cn(
                  buttonVariants({ size: "lg", variant: "outline" }),
                  "border-white/10 bg-transparent",
                )}
              >
                Upload documents
              </Link>
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="text-sm text-slate-500">Current exception</p>
                <h2 className="text-xl font-semibold">INV-2025-11567</h2>
              </div>
              <div className="rounded-md bg-red-500/20 px-3 py-1 text-sm text-red-200">
                Critical
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {[
                "Duplicate invoice number from same supplier",
                "Unit price exceeds PO by €50 per chair",
                "Payment terms changed from Net 30 to Net 14",
                "Supplier bank account changed",
              ].map((item) => (
                <div
                  className="flex items-start gap-3 rounded border border-white/10 bg-black/20 p-3"
                  key={item}
                >
                  <FileSearch className="mt-0.5 h-4 w-4 text-cyan-300" />
                  <span className="text-sm text-slate-300">{item}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded border border-emerald-400/20 bg-emerald-400/10 p-4">
              <p className="flex items-center gap-2 text-sm font-medium text-emerald-200">
                <CheckCircle2 className="h-4 w-4" />
                Dispute draft ready
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Includes exact mismatches, invoice references, and requested
                correction from the supplier.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
