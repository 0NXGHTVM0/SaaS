import {
  AlertTriangle,
  Bot,
  CalendarDays,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { InvoiceDetailPanel } from "@/components/invoice-detail-panel";
import { InvoiceTable } from "@/components/invoice-table";
import { MetricCard } from "@/components/metric-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { demoInvoices } from "@/lib/demo-data";

export default function DashboardPage() {
  const totalExceptions = demoInvoices.reduce(
    (sum, invoice) => sum + invoice.exceptions.length,
    0,
  );

  return (
    <div className="grid min-w-0 grid-cols-1 xl:grid-cols-[1fr_360px]">
      <main className="min-w-0 space-y-4 p-3 md:p-5">
        <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={CalendarDays}
            title="Next Payment Run"
            value="€8,742,198.56"
            subtext="186 invoices · 41 suppliers"
            footer="Cut-off in 14h 32m"
          />
          <MetricCard
            icon={Bot}
            title="AI Extraction"
            value="1,238"
            subtext="Extracted 1,152 · Review 68 · Failed 18"
            footer="View pipeline"
          >
            <div className="h-2 rounded-full bg-white/10">
              <div className="h-2 w-[93%] rounded-full bg-emerald-400" />
            </div>
          </MetricCard>
          <MetricCard
            icon={AlertTriangle}
            title="Exceptions Detected"
            value={`${totalExceptions + 51}`}
            subtext="12.3% of batch value"
            footer="View exceptions"
          >
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              {[
                ["Critical", 18, "text-red-300"],
                ["High", 21, "text-orange-300"],
                ["Medium", 13, "text-amber-300"],
                ["Low", 5, "text-emerald-300"],
              ].map(([label, value, color]) => (
                <div key={label as string}>
                  <p className="text-slate-500">{label}</p>
                  <p className={color as string}>{value}</p>
                </div>
              ))}
            </div>
          </MetricCard>
          <MetricCard
            icon={ShieldCheck}
            title="Supplier Signals"
            value="186"
            subtext="High risk 23 · Medium risk 38 · Low risk 125"
            footer="View supplier risk"
          />
        </section>

        <Card className="border-white/10 bg-white/[0.035] text-slate-100 shadow-none">
          <CardHeader className="flex flex-col gap-3 border-b border-white/10 pb-3 md:flex-row md:items-center md:justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              Exception Queue
              <Badge className="bg-red-500/20 text-red-200">57</Badge>
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              <Input
                className="h-9 w-56 border-white/10 bg-white/[0.03]"
                placeholder="Search exceptions..."
              />
              <Select defaultValue="severity">
                <SelectTrigger className="h-9 w-36 border-white/10 bg-white/[0.03]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="severity">Severity</SelectItem>
                  <SelectItem value="supplier">Supplier</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                className="h-9 border-white/10 bg-white/[0.03]"
              >
                Columns
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <InvoiceTable invoices={demoInvoices} />
          </CardContent>
        </Card>

        <section className="grid grid-cols-1 gap-3 xl:grid-cols-3">
          <Card className="border-white/10 bg-white/[0.035] text-slate-100 shadow-none">
            <CardHeader>
              <CardTitle className="text-sm">Exceptions by Type</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-5">
              <div className="grid h-28 w-28 place-items-center rounded-full border-[18px] border-red-500 border-b-amber-400 border-l-cyan-400 border-r-orange-500">
                <div className="text-center">
                  <p className="text-xl font-semibold">57</p>
                  <p className="text-xs text-slate-500">Total</p>
                </div>
              </div>
              <div className="space-y-2 text-sm text-slate-400">
                {[
                  "Duplicate Invoice 18",
                  "Price Variance 13",
                  "PO Mismatch 9",
                  "VAT Mismatch 7",
                ].map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-white/[0.035] text-slate-100 shadow-none">
            <CardHeader>
              <CardTitle className="text-sm">Exceptions Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex h-32 items-end gap-3 border-b border-l border-white/10 px-3">
                {[24, 31, 38, 51, 58, 66].map((height, index) => (
                  <div
                    className="w-full rounded-t bg-red-400"
                    key={index}
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
              <Button variant="link" className="px-0 text-cyan-300">
                View trend analysis <ChevronRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-white/[0.035] text-slate-100 shadow-none">
            <CardHeader>
              <CardTitle className="text-sm">AI Extraction Pipeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              {[
                ["Invoices Received", "1,238", "w-full bg-cyan-300"],
                ["Extracted", "1,152 (93.1%)", "w-[93%] bg-emerald-400"],
                ["In Review", "68 (5.5%)", "w-[55%] bg-amber-400"],
                ["Failed", "18 (1.4%)", "w-[34%] bg-red-400"],
              ].map(([label, value, width]) => (
                <div key={label}>
                  <div className="mb-1 flex justify-between text-slate-400">
                    <span>{label}</span>
                    <span>{value}</span>
                  </div>
                  <div className="h-3 rounded bg-white/10">
                    <div className={`h-3 rounded ${width}`} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </main>
      <InvoiceDetailPanel invoiceId="inv-11567" />
    </div>
  );
}
