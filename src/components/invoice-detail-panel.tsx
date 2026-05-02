import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { getInvoiceById } from "@/lib/demo-data";

export function InvoiceDetailPanel({ invoiceId }: { invoiceId: string }) {
  const invoice = getInvoiceById(invoiceId);
  const topException = invoice.exceptions[0];

  return (
    <aside className="hidden border-l border-white/10 bg-[#09141a] xl:block">
      <div className="flex h-full min-h-[calc(100vh-4rem)] w-[360px] flex-col">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <p className="text-sm font-semibold">Invoice Details</p>
          <div className="flex gap-2 text-slate-400">
            <ExternalLink className="h-4 w-4" />
            <X className="h-4 w-4" />
          </div>
        </div>
        <div className="space-y-5 p-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">{invoice.invoiceNumber}</h2>
              <Badge className="border border-red-400/50 bg-red-500/15 text-red-200">
                Critical
              </Badge>
            </div>
            <p className="text-sm text-slate-400">{invoice.supplierName}</p>
            <p className="text-sm text-slate-300">{topException?.title}</p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-xs text-slate-500">Invoice Date</p>
              <p>{invoice.invoiceDate}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Due Date</p>
              <p>{invoice.dueDate}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Amount</p>
              <p>€{invoice.totalAmount?.toLocaleString()}</p>
            </div>
          </div>

          <Separator className="bg-white/10" />
          <section className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              Exception Details
            </h3>
            <p className="text-sm leading-6 text-slate-400">
              {topException?.explanation ??
                "No open exception is currently attached to this invoice."}
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold">AI Confidence</h3>
            <div className="flex items-center gap-4">
              <div className="grid h-14 w-14 place-items-center rounded-full border-4 border-emerald-400 text-sm font-semibold">
                {Math.round(invoice.exceptionScore * 100)}%
              </div>
              <div className="flex-1">
                <Progress value={invoice.exceptionScore * 100} />
                <p className="mt-2 text-sm text-emerald-300">
                  High confidence
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold">Evidence</h3>
            {invoice.exceptions.slice(0, 4).map((exception) => (
              <p
                key={`${exception.type}-${exception.title}`}
                className="flex gap-2 text-sm text-slate-400"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                {exception.title}
              </p>
            ))}
          </section>

          <section className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-red-300">
              <ShieldAlert className="h-4 w-4" />
              Supplier Risk Signal
            </h3>
            <p className="text-sm text-slate-400">
              23 risk signals in last 90 days
            </p>
            <Link
              className="text-sm font-medium text-cyan-300"
              href="/dashboard/suppliers"
            >
              View supplier profile
            </Link>
          </section>
        </div>
        <div className="mt-auto space-y-3 border-t border-white/10 p-5">
          <p className="text-sm font-semibold">Recommended Action</p>
          <Button className="w-full bg-red-500 text-white hover:bg-red-400">
            Hold Payment
          </Button>
          <Button
            variant="outline"
            className="w-full border-emerald-500/70 bg-transparent text-emerald-300 hover:bg-emerald-500/10"
          >
            Approve
          </Button>
          <Button
            variant="outline"
            className="w-full border-amber-400/70 bg-transparent text-amber-300 hover:bg-amber-400/10"
          >
            Dispute
          </Button>
        </div>
      </div>
    </aside>
  );
}
