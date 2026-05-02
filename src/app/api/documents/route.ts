import { NextResponse } from "next/server";
import { readDocuments } from "@/lib/documents/store";

export const runtime = "nodejs";

export async function GET() {
  const documents = await readDocuments();

  return NextResponse.json({
    documents: documents.map((document) => ({
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
    })),
  });
}
