import { NextResponse } from "next/server";
import { getReviewInvoiceById } from "@/lib/reviews/store";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const invoice = await getReviewInvoiceById(id);

  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
  }

  return NextResponse.json({ invoice });
}
