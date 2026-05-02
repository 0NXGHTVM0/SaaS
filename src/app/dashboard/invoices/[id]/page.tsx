import { notFound } from "next/navigation";
import { AlertTriangle, CheckCircle2, FileText, Mail, XCircle } from "lucide-react";
import { SeverityDot } from "@/components/severity";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { demoInvoices } from "@/lib/demo-data";
import { getReviewInvoiceById } from "@/lib/reviews/store";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const invoice = await getReviewInvoiceById(id);

  if (!invoice) {
    notFound();
  }

  const subject = `Question about ${invoice.invoiceNumber}`;
  const body = `Hello,\n\nWe are reviewing ${invoice.invoiceNumber} before payment and found the following items that do not match our supporting document:\n\n${invoice.exceptions
    .map((item) => `- ${item.title}: ${item.explanation}`)
    .join(
      "\n",
    )}\n\nCould you please confirm or issue a corrected invoice?\n\nThanks,\nFinance team`;

  return (
    <main className="min-w-0 space-y-4 p-3 md:p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Badge className="bg-red-500/20 text-red-200">
              {invoice.status.replace("_", " ")}
            </Badge>
            <Badge className="bg-cyan-400/15 text-cyan-200">
              {Math.round(invoice.exceptionScore * 100)}% confidence
            </Badge>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {invoice.invoiceNumber}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {invoice.supplierName} · €{invoice.totalAmount?.toLocaleString()} ·
            due {invoice.dueDate}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button className="bg-emerald-500 text-white hover:bg-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            Approve
          </Button>
          <Button variant="destructive">
            <XCircle className="h-4 w-4" />
            Reject
          </Button>
          <Button
            variant="outline"
            className="border-amber-400/50 bg-transparent text-amber-300"
          >
            <Mail className="h-4 w-4" />
            Mark disputed
          </Button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[420px_1fr_420px]">
        <Card className="border-white/10 bg-white/[0.035] text-slate-100 shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4 text-cyan-300" />
              PDF Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="min-h-[560px] rounded border border-white/10 bg-slate-100 p-6 text-slate-950">
              <p className="text-sm font-semibold">INVOICE</p>
              <h2 className="mt-4 text-2xl font-bold">{invoice.supplierName}</h2>
              <p className="mt-2 text-sm">{invoice.invoiceNumber}</p>
              <Separator className="my-6 bg-slate-300" />
              <div className="space-y-4 text-sm">
                {invoice.lineItems.map((item) => (
                  <div
                    className="rounded border border-amber-300 bg-amber-50 p-3"
                    key={item.description}
                  >
                    <div className="flex justify-between">
                      <span>{item.description}</span>
                      <span>€{item.lineTotal?.toLocaleString()}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      Qty {item.quantity} · Unit €{item.unitPrice}
                    </p>
                  </div>
                ))}
              </div>
              <p className="mt-8 text-right text-xl font-bold">
                Total €{invoice.totalAmount?.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-white/10 bg-white/[0.035] text-slate-100 shadow-none">
            <CardHeader>
              <CardTitle className="text-base">Extracted Fields</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {[
                ["Supplier", invoice.supplierName],
                ["Invoice number", invoice.invoiceNumber],
                ["Invoice date", invoice.invoiceDate],
                ["Due date", invoice.dueDate],
                ["Payment terms", invoice.paymentTerms],
                ["Bank account", invoice.bankAccount],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded border border-white/10 bg-white/[0.03] p-3"
                >
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="mt-1 text-sm">{value}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/[0.035] text-slate-100 shadow-none">
            <CardHeader>
              <CardTitle className="text-base">Reference Comparison</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {invoice.reference.expectedLineItems.map((item) => (
                <div
                  className="grid gap-2 rounded border border-white/10 bg-white/[0.03] p-3 text-sm md:grid-cols-4"
                  key={item.description}
                >
                  <p className="md:col-span-2">{item.description}</p>
                  <p className="text-slate-400">Expected qty {item.quantity}</p>
                  <p className="text-slate-400">Expected €{item.unitPrice}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="border-white/10 bg-white/[0.035] text-slate-100 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                Ranked Exceptions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {invoice.exceptions.map((exception) => (
                <div
                  className="rounded border border-white/10 bg-white/[0.03] p-3"
                  key={`${exception.type}-${exception.title}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">{exception.title}</p>
                    <SeverityDot severity={exception.severity} />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {exception.explanation}
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-400">
                    <span>Invoice: {exception.evidence.invoiceValue}</span>
                    <span>Expected: {exception.evidence.expectedValue}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/[0.035] text-slate-100 shadow-none">
            <CardHeader>
              <CardTitle className="text-base">Dispute Draft</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded border border-white/10 bg-white/[0.03] p-3 text-sm">
                <p className="text-xs text-slate-500">Subject</p>
                <p>{subject}</p>
              </div>
              <Textarea
                className="min-h-72 border-white/10 bg-white/[0.03] text-slate-100"
                defaultValue={body}
              />
              <Button className="w-full bg-cyan-400 text-slate-950 hover:bg-cyan-300">
                Copy dispute email
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

export function generateStaticParams() {
  return demoInvoices.map((invoice) => ({ id: invoice.id }));
}
