import { DocumentUploadForm } from "@/components/upload/document-upload-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

      <Card className="border-white/10 bg-white/[0.035] text-slate-100 shadow-none">
        <CardHeader>
          <CardTitle>New pre-payment review</CardTitle>
        </CardHeader>
        <CardContent>
          <DocumentUploadForm />
        </CardContent>
      </Card>
    </main>
  );
}
