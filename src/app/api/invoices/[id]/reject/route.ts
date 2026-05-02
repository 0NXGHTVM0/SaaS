import { NextResponse } from "next/server";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return NextResponse.json({
    invoiceId: id,
    decision: "rejected",
    message: "Rejection recorded with audit-trail placeholder.",
  });
}
