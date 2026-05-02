import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SeverityDot } from "@/components/severity";
import type { DemoInvoice } from "@/lib/types";

export function InvoiceTable({ invoices }: { invoices: DemoInvoice[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-white/10 hover:bg-transparent">
          <TableHead className="w-10 text-slate-400"> </TableHead>
          <TableHead className="text-slate-400">Invoice Number</TableHead>
          <TableHead className="text-slate-400">Supplier</TableHead>
          <TableHead className="text-slate-400">Exception Type</TableHead>
          <TableHead className="text-slate-400">Severity</TableHead>
          <TableHead className="text-slate-400">Amount</TableHead>
          <TableHead className="text-slate-400">Invoice Date</TableHead>
          <TableHead className="text-slate-400">Detected On</TableHead>
          <TableHead className="w-12 text-slate-400"> </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice, index) => {
          const topException = invoice.exceptions[0];

          return (
            <TableRow
              key={invoice.id}
              className="border-white/10 hover:bg-cyan-400/5 data-[selected=true]:bg-cyan-400/10"
              data-selected={index === 0}
            >
              <TableCell>
                <div className="h-4 w-4 rounded border border-slate-500 bg-cyan-400/20" />
              </TableCell>
              <TableCell>
                <Link
                  href={`/dashboard/invoices/${invoice.id}`}
                  className="font-medium text-cyan-300"
                >
                  {invoice.invoiceNumber}
                </Link>
              </TableCell>
              <TableCell className="text-slate-300">
                {invoice.supplierName}
              </TableCell>
              <TableCell className="text-slate-300">
                {topException?.title ?? "Ready for approval"}
              </TableCell>
              <TableCell className="text-slate-300">
                {topException ? (
                  <SeverityDot severity={topException.severity} />
                ) : (
                  <Badge className="bg-emerald-400/15 text-emerald-300">
                    low
                  </Badge>
                )}
              </TableCell>
              <TableCell className="font-mono text-slate-300">
                €{invoice.totalAmount?.toLocaleString()}
              </TableCell>
              <TableCell className="text-slate-300">
                {invoice.invoiceDate}
              </TableCell>
              <TableCell className="text-slate-300">
                {invoice.detectedAt}
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="icon" className="text-slate-400">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
