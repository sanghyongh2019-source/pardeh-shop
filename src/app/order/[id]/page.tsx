import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import db from "@/lib/db";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(id) as any;
  if (!order) notFound();

  const items = db.prepare("SELECT * FROM order_items WHERE orderId = ?").all(id) as any[];
  const plan = db.prepare("SELECT * FROM installment_plans WHERE orderId = ?").get(id) as any;

  return (
    <main>
      <Header />
      <div className="container-x py-16 max-w-2xl">
        <div className="flex items-center gap-3 mb-1">
          <CheckCircle2 size={26} style={{ color: "var(--brass-deep)" }} />
          <h1 className="text-2xl font-black">سفارش شما ثبت شد</h1>
        </div>
        <p className="text-sm mb-8" style={{ color: "var(--muted)" }}>
          شماره سفارش: <span className="font-mono">{order.id}</span>
        </p>

        <div className="border p-6 mb-6" style={{ borderColor: "var(--line-dark)" }}>
          {items.map((it) => (
            <div key={it.id} className="flex justify-between text-sm py-3 border-b" style={{ borderColor: "var(--line-dark)" }}>
              <span>رنگ {it.colorName} — دوخت {it.seamType} — بافت {it.texture} — عرض {it.widthCm} سانتی‌متر</span>
              <span className="font-bold">{it.unitPrice.toLocaleString("fa-IR")} تومان</span>
            </div>
          ))}
          <div className="flex justify-between pt-4 font-bold">
            <span>مبلغ کل</span>
            <span>{order.totalAmount.toLocaleString("fa-IR")} تومان</span>
          </div>
        </div>

        {plan && (
          <div className="p-6 mb-6" style={{ background: "var(--sand)" }}>
            <h3 className="font-bold mb-3">برنامه‌ی اقساط (آزمایشی)</h3>
            <p className="text-sm mb-3">
              پیش‌پرداخت: {plan.downPayment.toLocaleString("fa-IR")} تومان — {plan.months} قسط ماهانه‌ی{" "}
              {plan.monthlyAmount.toLocaleString("fa-IR")} تومانی
            </p>
            <div className="text-xs" style={{ color: "var(--muted)" }}>
              توجه: این یک درگاه اقساطی نمایشی است و پرداخت واقعی از حساب شما انجام نشده است.
            </div>
          </div>
        )}

        <div className="text-sm">
          وضعیت سفارش: <span className="font-bold">در انتظار پرداخت</span>
        </div>
      </div>
      <Footer />
    </main>
  );
}
