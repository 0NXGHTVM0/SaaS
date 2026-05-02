import { NextResponse } from "next/server";
import { getDocument } from "@/lib/documents/store";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const document = await getDocument(id);

  if (!document) {
    return NextResponse.json({ error: "Document not found." }, { status: 404 });
  }

  return NextResponse.json({
    document: {
      id: document.id,
      documentType: document.documentType,
      fileName: document.fileName,
      mimeType: document.mimeType,
      fileSize: document.fileSize,
      extractionStatus: document.extractionStatus,
      extractionError: document.extractionError,
      extractedText: document.extractedText,
      uploadedAt: document.uploadedAt,
    },
  });
}
