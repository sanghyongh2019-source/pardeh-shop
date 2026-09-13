import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { z } from "zod";
import db from "@/lib/db";
import { calculateInstallment } from "@/lib/installment";
import { computeUnitPrice } from "@/lib/pricing";

const orderSchema = z.object({
  customerName: z.string().min(2),
  customerPhone: z.string().min(8),
  customerAddress: z.string().min(5),
  paymentType: z.enum(["full", "installment"]),
  items: z
    .array(
      z.object({
        productId: z.string(),
        colorName: z.string(),
        colorHex: z.string(),
        seamType: z.enum(["پرچین", "پیلی‌دار", "حلقه‌ای"]),
        texture: z.enum(["ساده", "بافت‌دار", "مخملی"]).default("ساده"),
        widthCm: z.number().int().positive(),
        lightBlockPct: z.number().int().min(0).max(100),
        quantity: z.number().int().positive().default(1),
      })
    )
    .min(1),
  installment: z
    .object({
      downPayment: z.number().min(0),
      months: z.number().int().min(1).max(12),
    })
    .optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = orderSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "ورودی سفارش نامعتبر است.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  const productStmt = db.prepare("SELECT * FROM products WHERE id = ?");
  const itemsWithPrice = data.items.map((item) => {
    const product = productStmt.get(item.productId) as any;
    if (!product) throw new Error(`محصول با شناسه‌ی ${item.productId} پیدا نشد.`);
    const unitPrice = computeUnitPrice(product.basePrice, item.widthCm, item.seamType, item.texture);
    return { ...item, unitPrice, quantity: item.quantity ?? 1 };
  });

  const totalAmount = itemsWithPrice.reduce(
    (sum, i) => sum + i.unitPrice * i.quantity,
    0
  );

  if (data.paymentType === "installment" && !data.installment) {
    return NextResponse.json(
      { error: "برای پرداخت اقساطی باید اطلاعات اقساط ارسال شود." },
      { status: 400 }
    );
  }

  const orderId = randomUUID();
  const now = new Date().toISOString();

  const insertOrder = db.prepare(
    `INSERT INTO orders (id, customerName, customerPhone, customerAddress, totalAmount, paymentType, status, createdAt)
     VALUES (@id, @customerName, @customerPhone, @customerAddress, @totalAmount, @paymentType, 'pending_payment', @createdAt)`
  );
  const insertItem = db.prepare(
    `INSERT INTO order_items (id, orderId, productId, colorName, colorHex, seamType, texture, widthCm, lightBlockPct, unitPrice, quantity)
     VALUES (@id, @orderId, @productId, @colorName, @colorHex, @seamType, @texture, @widthCm, @lightBlockPct, @unitPrice, @quantity)`
  );
  const insertPlan = db.prepare(
    `INSERT INTO installment_plans (id, orderId, totalAmount, downPayment, months, monthlyAmount, interestRate, schedule, provider, createdAt)
     VALUES (@id, @orderId, @totalAmount, @downPayment, @months, @monthlyAmount, @interestRate, @schedule, 'mock-installment-gateway', @createdAt)`
  );

  let installmentResult = null;

  try {
    const tx = db.transaction(() => {
      insertOrder.run({
        id: orderId,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerAddress: data.customerAddress,
        totalAmount,
        paymentType: data.paymentType,
        createdAt: now,
      });

      for (const item of itemsWithPrice) {
        insertItem.run({ id: randomUUID(), orderId, ...item });
      }

      if (data.paymentType === "installment" && data.installment) {
        const calc = calculateInstallment(
          totalAmount,
          data.installment.downPayment,
          data.installment.months
        );
        insertPlan.run({
          id: randomUUID(),
          orderId,
          totalAmount: calc.totalAmount,
          downPayment: calc.downPayment,
          months: calc.months,
          monthlyAmount: calc.monthlyAmount,
          interestRate: calc.interestRate,
          schedule: JSON.stringify(calc.schedule),
          createdAt: now,
        });
        installmentResult = calc;
      }
    });
    tx();
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }

  return NextResponse.json(
    {
      orderId,
      totalAmount,
      paymentType: data.paymentType,
      installment: installmentResult,
      status: "pending_payment",
      note:
        data.paymentType === "installment"
          ? "این یک درگاه اقساطی آزمایشی (mock) است و پرداخت واقعی انجام نمی‌شود."
          : "این یک ثبت سفارش آزمایشی است؛ درگاه پرداخت واقعی متصل نیست.",
    },
    { status: 201 }
  );
}

export async function GET() {
  const orders = db.prepare("SELECT * FROM orders ORDER BY createdAt DESC").all();
  return NextResponse.json({ orders });
}
