import { ShieldAlert, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { suppliers } from "@/lib/demo-data";

export default function SuppliersPage() {
  return (
    <main className="min-w-0 space-y-4 p-3 md:p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Supplier Rules
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Supplier-specific tolerances, historical patterns, and risk signals.
          </p>
        </div>
        <Button className="bg-cyan-400 text-slate-950 hover:bg-cyan-300">
          <SlidersHorizontal className="h-4 w-4" />
          Add rule
        </Button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_420px]">
        <Card className="border-white/10 bg-white/[0.035] text-slate-100 shadow-none">
          <CardHeader>
            <CardTitle>Supplier profiles</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead className="text-slate-400">Supplier</TableHead>
                  <TableHead className="text-slate-400">Risk</TableHead>
                  <TableHead className="text-slate-400">Open signals</TableHead>
                  <TableHead className="text-slate-400">Volume</TableHead>
                  <TableHead className="text-slate-400">Currency</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.map((supplier) => (
                  <TableRow
                    className="border-white/10 hover:bg-cyan-400/5"
                    key={supplier.id}
                  >
                    <TableCell className="font-medium">
                      {supplier.name}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          supplier.riskLevel === "high"
                            ? "bg-red-500/20 text-red-200"
                            : "bg-emerald-400/15 text-emerald-300"
                        }
                      >
                        {supplier.riskLevel}
                      </Badge>
                    </TableCell>
                    <TableCell>{supplier.exceptions}</TableCell>
                    <TableCell className="text-slate-400">
                      {supplier.invoiceVolume}
                    </TableCell>
                    <TableCell>{supplier.defaultCurrency}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/[0.035] text-slate-100 shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-red-300" />
              Active controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {[
              "Critical alert if bank account changes",
              "Flag duplicate invoice numbers per supplier",
              "Ask supplier when unit price exceeds agreed price by 2%",
              "Manual review when payment terms shorten",
              "VAT amount must match taxable line items",
            ].map((rule) => (
              <div
                className="rounded border border-white/10 bg-white/[0.03] p-3 text-slate-300"
                key={rule}
              >
                {rule}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
