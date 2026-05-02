import { NextResponse } from "next/server";
import { suppliers } from "@/lib/demo-data";

export async function GET() {
  return NextResponse.json({ suppliers });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  return NextResponse.json(
    {
      supplier: {
        id: crypto.randomUUID(),
        name: body.name ?? "New supplier",
        riskLevel: "normal",
      },
    },
    { status: 201 },
  );
}
