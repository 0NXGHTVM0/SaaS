import { FileText, UploadCloud, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

export default function UploadPage() {
  return (
    <main className="min-w-0 space-y-4 p-3 md:p-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Upload Documents
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Add one supplier invoice and a PO, quote, contract, or delivery note
          for comparison.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card className="border-white/10 bg-white/[0.035] text-slate-100 shadow-none">
          <CardHeader>
            <CardTitle>New pre-payment review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <UploadBox
                title="Invoice PDF"
                description="Supplier invoice to check before payment."
              />
              <UploadBox
                title="Supporting document"
                description="PO, quote, contract, or delivery note."
              />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Supplier</label>
                <Input
                  className="border-white/10 bg-white/[0.03]"
                  placeholder="Global Office Supplies Ltd."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Default currency</label>
                <Input
                  className="border-white/10 bg-white/[0.03]"
                  placeholder="EUR"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Document type</label>
                <Input
                  className="border-white/10 bg-white/[0.03]"
                  placeholder="PO / quote / contract"
                />
              </div>
            </div>
            <Button className="bg-cyan-400 text-slate-950 hover:bg-cyan-300">
              <Zap className="h-4 w-4" />
              Start exception check
            </Button>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/[0.035] text-slate-100 shadow-none">
          <CardHeader>
            <CardTitle>Processing pipeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 text-sm">
            {[
              ["Upload received", 100],
              ["PDF text extraction", 86],
              ["Invoice field extraction", 64],
              ["Reference comparison", 42],
              ["Dispute draft", 22],
            ].map(([label, value]) => (
              <div key={label as string}>
                <div className="mb-2 flex justify-between text-slate-400">
                  <span>{label}</span>
                  <span>{value}%</span>
                </div>
                <Progress value={value as number} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function UploadBox({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="grid min-h-56 place-items-center rounded border border-dashed border-white/20 bg-white/[0.03] p-6 text-center">
      <div>
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-cyan-400/15 text-cyan-300">
          {title.includes("Invoice") ? (
            <FileText className="h-5 w-5" />
          ) : (
            <UploadCloud className="h-5 w-5" />
          )}
        </div>
        <h2 className="mt-4 font-semibold">{title}</h2>
        <p className="mx-auto mt-2 max-w-xs text-sm text-slate-400">
          {description}
        </p>
        <Button
          variant="outline"
          className="mt-4 border-white/10 bg-transparent"
        >
          Choose PDF
        </Button>
      </div>
    </div>
  );
}
