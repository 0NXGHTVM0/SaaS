import { NextResponse } from "next/server";
import { writeFile } from "node:fs/promises";
import { extractPdfText } from "@/lib/documents/pdf";
import {
  getUploadPath,
  getUploadUrl,
  ensureDocumentStore,
  insertDocuments,
  type DocumentType,
  type StoredDocument,
} from "@/lib/documents/store";
import { createReviewCase } from "@/lib/reviews/store";

export const runtime = "nodejs";

const supportedDocumentTypes: DocumentType[] = [
  "invoice",
  "po",
  "quote",
  "contract",
  "delivery_note",
];

export async function POST(request: Request) {
  const formData = await request.formData();
  const supplierName = getString(formData.get("supplierName"));
  const invoice = formData.get("invoice");
  const reference = formData.get("reference");
  const referenceType = normalizeDocumentType(
    getString(formData.get("referenceType")),
  );

  if (!(invoice instanceof File)) {
    return NextResponse.json(
      { error: "Invoice PDF is required." },
      { status: 400 },
    );
  }

  const files: { file: File; documentType: DocumentType }[] = [
    { file: invoice, documentType: "invoice" },
  ];

  if (reference instanceof File && reference.size > 0) {
    files.push({ file: reference, documentType: referenceType });
  }

  const documents = await Promise.all(
    files.map(async ({ file, documentType }) =>
      saveAndExtractDocument({ file, documentType, supplierName }),
    ),
  );

  await insertDocuments(documents);

  const invoiceDocument =
    documents.find((document) => document.documentType === "invoice") ?? null;
  const referenceDocument =
    documents.find(
      (document) =>
        document.documentType !== "invoice" &&
        document.extractionStatus === "completed",
    ) ?? null;
  const reviewCase =
    invoiceDocument?.extractionStatus === "completed"
      ? await createReviewCase({ invoiceDocument, referenceDocument })
      : null;

  return NextResponse.json(
    {
      documents: documents.map(toPublicDocument),
      reviewCase: reviewCase
        ? {
            id: reviewCase.id,
            invoiceNumber: reviewCase.invoiceNumber,
            supplierName: reviewCase.supplierName,
            exceptionScore: reviewCase.exceptionScore,
            exceptionsCount: reviewCase.exceptions.length,
            href: `/dashboard/invoices/${reviewCase.id}`,
          }
        : null,
      nextJob: "document/extract",
      summary: {
        uploaded: documents.length,
        completed: documents.filter(
          (document) => document.extractionStatus === "completed",
        ).length,
        failed: documents.filter(
          (document) => document.extractionStatus === "failed",
        ).length,
      },
    },
    { status: 201 },
  );
}

async function saveAndExtractDocument({
  file,
  documentType,
  supplierName,
}: {
  file: File;
  documentType: DocumentType;
  supplierName: string | null;
}): Promise<StoredDocument> {
  const id = crypto.randomUUID();
  const bytes = Buffer.from(await file.arrayBuffer());
  const storagePath = getUploadPath(id, file.name);

  await ensureDocumentStore();
  await writeFile(storagePath, bytes);

  const baseDocument = {
    id,
    orgId: "demo-org",
    supplierId: null,
    supplierName,
    documentType,
    fileUrl: getUploadUrl(id, file.name),
    storagePath,
    fileName: file.name,
    mimeType: file.type || "application/pdf",
    fileSize: file.size,
    uploadedBy: "demo-user",
    uploadedAt: new Date().toISOString(),
  };

  if (!isPdf(file)) {
    return {
      ...baseDocument,
      extractedText: null,
      extractionStatus: "failed",
      extractionError: "Only PDF files are supported in this MVP phase.",
    };
  }

  try {
    const extractedText = await extractPdfText(bytes);

    return {
      ...baseDocument,
      extractedText,
      extractionStatus: extractedText.length > 0 ? "completed" : "failed",
      extractionError:
        extractedText.length > 0
          ? null
          : "No embedded text found. OCR for scanned PDFs is post-MVP.",
    };
  } catch (error) {
    return {
      ...baseDocument,
      extractedText: null,
      extractionStatus: "failed",
      extractionError:
        error instanceof Error ? error.message : "PDF text extraction failed.",
    };
  }
}

function isPdf(file: File) {
  return file.type === "application/pdf" || file.name.endsWith(".pdf");
}

function getString(value: FormDataEntryValue | null) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function normalizeDocumentType(value: string | null): DocumentType {
  if (value && supportedDocumentTypes.includes(value as DocumentType)) {
    return value as DocumentType;
  }

  return "po";
}

function toPublicDocument(document: StoredDocument) {
  return {
    id: document.id,
    documentType: document.documentType,
    fileName: document.fileName,
    mimeType: document.mimeType,
    fileSize: document.fileSize,
    extractionStatus: document.extractionStatus,
    extractionError: document.extractionError,
    extractedTextPreview: document.extractedText?.slice(0, 700) ?? null,
    extractedTextLength: document.extractedText?.length ?? 0,
    uploadedAt: document.uploadedAt,
  };
}
