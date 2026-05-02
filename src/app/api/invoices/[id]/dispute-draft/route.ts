import { NextResponse } from "next/server";
import { getReviewInvoiceById } from "@/lib/reviews/store";

export const runtime = "nodejs";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const invoice = await getReviewInvoiceById(id);

  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
  }

  return NextResponse.json({
    invoiceId: id,
    subject: `Question about ${invoice.invoiceNumber}`,
    body: `Hello,\n\nWe are reviewing ${invoice.invoiceNumber} and found mismatches that need confirmation before payment.\n\n${invoice.exceptions
      .map((exception) => `- ${exception.title}: ${exception.explanation}`)
      .join("\n")}\n\nCould you confirm or issue a corrected invoice?\n\nThanks,\nFinance team`,
    status: "draft",
  });
}
