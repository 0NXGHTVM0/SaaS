import { NextResponse } from "next/server";
import { getInvoiceById } from "@/lib/demo-data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return NextResponse.json({ invoice: getInvoiceById(id) });
}
