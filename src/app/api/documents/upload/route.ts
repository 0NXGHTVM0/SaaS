import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const files = formData.getAll("files").filter((file) => file instanceof File);

  return NextResponse.json(
    {
      documents: files.map((file) => ({
        id: crypto.randomUUID(),
        fileName: file.name,
        mimeType: file.type,
        extractionStatus: "pending",
      })),
      nextJob: "document/extract",
    },
    { status: 202 },
  );
}
