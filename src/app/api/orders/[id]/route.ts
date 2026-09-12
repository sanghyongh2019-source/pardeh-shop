import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(id) as any;

  if (!order) {
    return NextResponse.json({ error: "سفارش پیدا نشد." }, { status: 404 });
  }

  const items = db.prepare("SELECT * FROM order_items WHERE orderId = ?").all(id);
  const plan = db.prepare("SELECT * FROM installment_plans WHERE orderId = ?").get(id) as any;

  return NextResponse.json({
    order,
    items,
    installment: plan ? { ...plan, schedule: JSON.parse(plan.schedule) } : null,
  });
}
