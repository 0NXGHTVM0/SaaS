import { NextResponse } from "next/server";
import { getAllInvoicesForReview } from "@/lib/reviews/store";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ invoices: await getAllInvoicesForReview() });
}
