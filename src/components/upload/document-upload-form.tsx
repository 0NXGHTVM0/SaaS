"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, FileText, Loader2, UploadCloud, XCircle, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type UploadedDocument = {
  id: string;
  documentType: string;
  fileName: string;
  fileSize: number;
  extractionStatus: "pending" | "processing" | "completed" | "failed";
  extractionError: string | null;
  extractedTextPreview: string | null;
  extractedTextLength: number;
  uploadedAt: string;
};

type UploadState = "idle" | "uploading" | "completed" | "failed";

export function DocumentUploadForm() {
  const [supplierName, setSupplierName] = useState("");
  const [defaultCurrency, setDefaultCurrency] = useState("EUR");
  const [referenceType, setReferenceType] = useState("po");
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [state, setState] = useState<UploadState>("idle");
  const [error, setError] = useState<string | null>(null);

  const progress = useMemo(() => {
    if (state === "uploading") {
      return 46;
    }

    if (!documents.length) {
      return 0;
    }

    const completed = documents.filter(
      (document) => document.extractionStatus === "completed",
    ).length;
    const failed = documents.filter(
      (document) => document.extractionStatus === "failed",
    ).length;

    return Math.round(((completed + failed) / documents.length) * 100);
  }, [documents, state]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!invoiceFile) {
      setError("Choose an invoice PDF before starting the check.");
      return;
    }

    const formData = new FormData();
    formData.append("supplierName", supplierName);
    formData.append("defaultCurrency", defaultCurrency);
    formData.append("referenceType", referenceType);
    formData.append("invoice", invoiceFile);

    if (referenceFile) {
      formData.append("reference", referenceFile);
    }

    setState("uploading");

    try {
      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Upload failed.");
      }

      setDocuments(payload.documents);
      setState("completed");
    } catch (uploadError) {
      setState("failed");
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Upload failed.",
      );
    }
  }

  return (
    <form className="grid gap-4 lg:grid-cols-[1fr_360px]" onSubmit={onSubmit}>
      <div className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <UploadBox
            title="Invoice PDF"
            description="Supplier invoice to check before payment."
            file={invoiceFile}
            inputName="invoice"
            onFileChange={setInvoiceFile}
          />
          <UploadBox
            title="Supporting document"
            description="PO, quote, contract, or delivery note."
            file={referenceFile}
            inputName="reference"
            onFileChange={setReferenceFile}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">Supplier</label>
            <Input
              className="border-white/10 bg-white/[0.03]"
              onChange={(event) => setSupplierName(event.target.value)}
              placeholder="Global Office Supplies Ltd."
              value={supplierName}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Default currency</label>
            <Input
              className="border-white/10 bg-white/[0.03]"
              maxLength={3}
              onChange={(event) =>
                setDefaultCurrency(event.target.value.toUpperCase())
              }
              placeholder="EUR"
              value={defaultCurrency}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Reference type</label>
            <Select
              onValueChange={(value) => {
                if (value) {
                  setReferenceType(value);
                }
              }}
              value={referenceType}
            >
              <SelectTrigger className="border-white/10 bg-white/[0.03]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="po">Purchase order</SelectItem>
                <SelectItem value="quote">Quote</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="delivery_note">Delivery note</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {error ? (
          <div className="rounded border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}
        <Button
          className="bg-cyan-400 text-slate-950 hover:bg-cyan-300"
          disabled={state === "uploading"}
          type="submit"
        >
          {state === "uploading" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Zap className="h-4 w-4" />
          )}
          Start exception check
        </Button>
      </div>

      <div className="space-y-5 text-sm">
        <div>
          <div className="mb-2 flex justify-between text-slate-400">
            <span>Document upload</span>
            <span>{state === "idle" ? "Ready" : `${progress}%`}</span>
          </div>
          <Progress value={progress} />
        </div>
        <div className="space-y-3">
          {documents.length ? (
            documents.map((document) => (
              <DocumentStatus key={document.id} document={document} />
            ))
          ) : (
            <div className="rounded border border-white/10 bg-white/[0.03] p-4 text-slate-400">
              Uploaded files will appear here with extraction status, text
              length, and a short preview.
            </div>
          )}
        </div>
      </div>
    </form>
  );
}

function UploadBox({
  title,
  description,
  file,
  inputName,
  onFileChange,
}: {
  title: string;
  description: string;
  file: File | null;
  inputName: string;
  onFileChange: (file: File | null) => void;
}) {
  return (
    <label className="grid min-h-56 cursor-pointer place-items-center rounded border border-dashed border-white/20 bg-white/[0.03] p-6 text-center transition hover:border-cyan-300/50 hover:bg-cyan-300/5">
      <input
        accept="application/pdf,.pdf"
        className="sr-only"
        name={inputName}
        onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
        type="file"
      />
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
        <div className="mt-4 inline-flex h-8 items-center rounded-lg border border-white/10 px-3 text-sm">
          {file ? file.name : "Choose PDF"}
        </div>
      </div>
    </label>
  );
}

function DocumentStatus({ document }: { document: UploadedDocument }) {
  const completed = document.extractionStatus === "completed";

  return (
    <div className="rounded border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium">{document.fileName}</p>
          <p className="mt-1 text-xs text-slate-500">
            {document.documentType} · {formatBytes(document.fileSize)}
          </p>
        </div>
        <Badge
          className={
            completed
              ? "bg-emerald-400/15 text-emerald-300"
              : "bg-red-500/20 text-red-200"
          }
        >
          {completed ? (
            <CheckCircle2 className="h-3 w-3" />
          ) : (
            <XCircle className="h-3 w-3" />
          )}
          {document.extractionStatus}
        </Badge>
      </div>
      {completed ? (
        <div className="mt-3 rounded bg-black/20 p-3">
          <p className="text-xs text-slate-500">
            {document.extractedTextLength.toLocaleString()} characters extracted
          </p>
          <p className="mt-2 line-clamp-4 text-xs leading-5 text-slate-400">
            {document.extractedTextPreview}
          </p>
        </div>
      ) : (
        <p className="mt-3 text-xs leading-5 text-red-200">
          {document.extractionError}
        </p>
      )}
    </div>
  );
}

function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
