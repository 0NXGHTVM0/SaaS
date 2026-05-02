import { NextResponse } from "next/server";
import { demoInvoices } from "@/lib/demo-data";

export async function GET() {
  return NextResponse.json({ invoices: demoInvoices });
}
