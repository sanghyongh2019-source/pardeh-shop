import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { calculateInstallment } from "@/lib/installment";

const schema = z.object({
  totalAmount: z.number().positive(),
  downPayment: z.number().min(0),
  months: z.number().int().min(1).max(12),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "ورودی نامعتبر است.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const result = calculateInstallment(
      parsed.data.totalAmount,
      parsed.data.downPayment,
      parsed.data.months
    );
    return NextResponse.json({ result, provider: "mock-installment-gateway" });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
