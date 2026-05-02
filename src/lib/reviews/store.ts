import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { extractInvoiceFields } from "@/lib/ai/extractInvoice";
import { extractReferenceFields } from "@/lib/ai/extractReference";
import { detectInvoiceExceptions } from "@/lib/detectors";
import type { DocumentType, StoredDocument } from "@/lib/documents/store";
import { demoInvoices } from "@/lib/demo-data";
import type { InvoiceException, ReviewCase } from "@/lib/types";

const dataDir = path.join(process.cwd(), ".data");
const reviewCasesPath = path.join(dataDir, "review-cases.json");

export async function ensureReviewStore() {
  await mkdir(dataDir, { recursive: true });
}

export async function readReviewCases(): Promise<ReviewCase[]> {
  await ensureReviewStore();

  try {
    const raw = await readFile(reviewCasesPath, "utf8");
    return JSON.parse(raw) as ReviewCase[];
  } catch {
    return [];
  }
}

export async function writeReviewCases(reviewCases: ReviewCase[]) {
  await ensureReviewStore();
  await writeFile(reviewCasesPath, JSON.stringify(reviewCases, null, 2));
}

export async function createReviewCase({
  invoiceDocument,
  referenceDocument,
}: {
  invoiceDocument: StoredDocument;
  referenceDocument: StoredDocument | null;
}) {
  const extractedInvoiceText = invoiceDocument.extractedText ?? "";
  const extractedReferenceText = referenceDocument?.extractedText ?? null;
  const invoice = await extractInvoiceFields(
    extractedInvoiceText,
    invoiceDocument.supplierName,
  );
  const reference = await extractReferenceFields(
    extractedReferenceText ?? "",
    toReferenceType(referenceDocument?.documentType),
    referenceDocument?.supplierName ?? invoice.supplierName,
  );

  const exceptions = [
    ...detectInvoiceExceptions({
      invoice,
      reference,
      history: {
        invoiceNumbers: [],
        bankAccounts: [],
      },
    }),
    ...missingReferenceExceptions(referenceDocument),
  ];
  const now = new Date();
  const reviewCase: ReviewCase = {
    ...invoice,
    id: `case-${crypto.randomUUID()}`,
    orgId: invoiceDocument.orgId,
    supplierId: invoiceDocument.supplierId ?? "supplier-demo",
    supplierRisk: exceptions.some((item) => item.severity === "critical")
      ? "high"
      : "normal",
    status: exceptions.length ? "review_required" : "approved",
    exceptionScore: scoreExceptions(exceptions),
    reference,
    exceptions,
    uploadedAt: invoiceDocument.uploadedAt,
    detectedAt: now.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    invoiceDocumentId: invoiceDocument.id,
    referenceDocumentId: referenceDocument?.id ?? null,
    extractedInvoiceText,
    extractedReferenceText,
  };

  const reviewCases = await readReviewCases();
  reviewCases.unshift(reviewCase);
  await writeReviewCases(reviewCases);

  return reviewCase;
}

export async function getAllInvoicesForReview() {
  const reviewCases = await readReviewCases();
  return [...reviewCases, ...demoInvoices];
}

export async function getReviewInvoiceById(id: string) {
  const reviewCases = await readReviewCases();
  return (
    reviewCases.find((reviewCase) => reviewCase.id === id) ??
    demoInvoices.find((invoice) => invoice.id === id) ??
    null
  );
}

function toReferenceType(documentType: DocumentType | undefined) {
  if (
    documentType === "quote" ||
    documentType === "contract" ||
    documentType === "delivery_note"
  ) {
    return documentType;
  }

  return "po";
}

function scoreExceptions(exceptions: InvoiceException[]) {
  if (!exceptions.length) {
    return 0.12;
  }

  const max = Math.max(
    ...exceptions.map((exception) => {
      if (exception.severity === "critical") return 0.98;
      if (exception.severity === "high") return 0.82;
      if (exception.severity === "medium") return 0.56;
      return 0.28;
    }),
  );

  return Math.min(0.99, max + Math.min(exceptions.length * 0.03, 0.12));
}

function missingReferenceExceptions(
  referenceDocument: StoredDocument | null,
): InvoiceException[] {
  if (referenceDocument) {
    return [];
  }

  return [
    {
      type: "missing_reference",
      severity: "medium",
      title: "No supporting document uploaded",
      explanation:
        "The invoice was uploaded without a PO, quote, contract, or delivery note, so only invoice-level checks could run.",
      evidence: {
        invoiceValue: "Invoice PDF",
        expectedValue: "Supporting document",
        source: "reference",
      },
      suggestedAction: "manual_review",
    },
  ];
}
