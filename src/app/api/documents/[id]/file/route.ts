import { readFile } from "node:fs/promises";
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

  const file = await readFile(document.storagePath);

  return new Response(new Uint8Array(file), {
    headers: {
      "content-type": document.mimeType,
      "content-disposition": `inline; filename="${document.fileName}"`,
    },
  });
}
