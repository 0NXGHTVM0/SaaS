import Link from "next/link";
import { FileUp, Filter, Search } from "lucide-react";
import { InvoiceTable } from "@/components/invoice-table";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAllInvoicesForReview } from "@/lib/reviews/store";
import { cn } from "@/lib/utils";

export default async function InvoicesPage() {
  const invoices = await getAllInvoicesForReview();

  return (
    <main className="min-w-0 space-y-4 p-3 md:p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Invoice Review
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Pre-payment checks for uploaded invoices and supporting documents.
          </p>
        </div>
        <Link
          href="/dashboard/upload"
          className={cn(
            buttonVariants(),
            "bg-cyan-400 text-slate-950 hover:bg-cyan-300",
          )}
        >
          <FileUp className="h-4 w-4" />
          Upload invoice
        </Link>
      </div>

      <Card className="border-white/10 bg-white/[0.035] text-slate-100 shadow-none">
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <CardTitle>Exception Inbox</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <Input
                  className="h-9 w-64 border-white/10 bg-white/[0.03] pl-9"
                  placeholder="Search supplier or invoice"
                />
              </div>
              <Button
                variant="outline"
                className="h-9 border-white/10 bg-transparent"
              >
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </div>
          </div>
          <Tabs defaultValue="review">
            <TabsList className="bg-white/[0.04]">
              <TabsTrigger value="review">Review Required</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="disputed">Disputed</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="p-0">
          <InvoiceTable invoices={invoices} />
        </CardContent>
      </Card>
    </main>
  );
}
