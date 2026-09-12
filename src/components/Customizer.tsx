"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@/lib/types";
import { computeUnitPrice, SEAM_TYPES } from "@/lib/pricing";
import { InstallmentResult } from "@/lib/types";

export default function Customizer({ product }: { product: Product }) {
  const router = useRouter();
  const [colorIdx, setColorIdx] = useState(0);
  const [seamType, setSeamType] = useState<string>(SEAM_TYPES[0]);
  const [widthCm, setWidthCm] = useState(220);
  const [lightBlockPct, setLightBlockPct] = useState(30);
  const [paymentType, setPaymentType] = useState<"full" | "installment">("full");
  const [months, setMonths] = useState(6);
  const [downPayment, setDownPayment] = useState(0);
  const [installmentPreview, setInstallmentPreview] = useState<InstallmentResult | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const color = product.colors[colorIdx] ?? product.colors[0];
  const unitPrice = useMemo(
    () => computeUnitPrice(product.basePrice, widthCm, seamType),
    [product.basePrice, widthCm, seamType]
  );

  async function previewInstallment() {
    setError(null);
    const res = await fetch("/api/installment/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ totalAmount: unitPrice, downPayment, months }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "خطا در محاسبه اقساط");
      return;
    }
    setInstallmentPreview(data.result);
  }

  async function submitOrder() {
    setError(null);
    if (!customerName || !customerPhone || !customerAddress) {
      setError("لطفاً نام، شماره تماس و آدرس را کامل وارد کنید.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerPhone,
          customerAddress,
          paymentType,
          items: [
            {
              productId: product.id,
              colorName: color.name,
              colorHex: color.hex,
              seamType,
              widthCm,
              lightBlockPct,
              quantity: 1,
            },
          ],
          installment: paymentType === "installment" ? { downPayment, months } : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "خطا در ثبت سفارش");
        setSubmitting(false);
        return;
      }
      router.push(`/order/${data.orderId}`);
    } catch {
      setError("خطا در ارتباط با سرور.");
      setSubmitting(false);
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-14">
      <div>
        <h1 className="text-2xl font-black mb-2">{product.name}</h1>
        <p className="text-sm mb-8" style={{ color: "#6b6154" }}>
          {product.description}
        </p>

        <div className="mb-6">
          <label className="text-sm font-bold block mb-2">رنگ پارچه</label>
          <div className="flex gap-3">
            {product.colors.map((c, i) => (
              <button
                key={c.id}
                onClick={() => setColorIdx(i)}
                className="w-9 h-9 rounded-full border-2"
                style={{
                  background: c.hex,
                  borderColor: i === colorIdx ? "var(--ink)" : "transparent",
                }}
                title={c.name}
              />
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="text-sm font-bold block mb-2">نوع دوخت</label>
          <div className="flex border" style={{ borderColor: "var(--line-dark)" }}>
            {SEAM_TYPES.map((s) => (
              <button
                key={s}
                onClick={() => setSeamType(s)}
                className="flex-1 py-2.5 text-sm"
                style={{
                  background: s === seamType ? "var(--ink)" : "transparent",
                  color: s === seamType ? "var(--cream)" : "inherit",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="text-sm font-bold block mb-2">عرض پنجره: {widthCm} سانتی‌متر</label>
          <input
            type="range"
            min={80}
            max={400}
            value={widthCm}
            onChange={(e) => setWidthCm(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="mb-8">
          <label className="text-sm font-bold block mb-2">میزان نورگذری: {lightBlockPct}%</label>
          <input
            type="range"
            min={0}
            max={100}
            value={lightBlockPct}
            onChange={(e) => setLightBlockPct(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="text-xl font-black mb-8">
          قیمت این سفارش: {unitPrice.toLocaleString("fa-IR")} تومان
        </div>

        <div className="border-t pt-6" style={{ borderColor: "var(--line-dark)" }}>
          <label className="text-sm font-bold block mb-3">نوع پرداخت</label>
          <div className="flex gap-3 mb-4">
            <button
              onClick={() => setPaymentType("full")}
              className="px-4 py-2 text-sm border rounded-sm"
              style={{
                borderColor: "var(--line-dark)",
                background: paymentType === "full" ? "var(--ink)" : "transparent",
                color: paymentType === "full" ? "var(--cream)" : "inherit",
              }}
            >
              پرداخت کامل
            </button>
            <button
              onClick={() => setPaymentType("installment")}
              className="px-4 py-2 text-sm border rounded-sm"
              style={{
                borderColor: "var(--line-dark)",
                background: paymentType === "installment" ? "var(--ink)" : "transparent",
                color: paymentType === "installment" ? "var(--cream)" : "inherit",
              }}
            >
              خرید اقساطی
            </button>
          </div>

          {paymentType === "installment" && (
            <div className="p-4 mb-4" style={{ background: "var(--sand)" }}>
              <div className="flex gap-4 mb-3">
                <div className="flex-1">
                  <label className="text-xs block mb-1">پیش‌پرداخت (تومان)</label>
                  <input
                    type="number"
                    min={0}
                    value={downPayment}
                    onChange={(e) => setDownPayment(Number(e.target.value))}
                    className="w-full px-2 py-1.5 border text-sm"
                    style={{ borderColor: "var(--line-dark)" }}
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs block mb-1">تعداد اقساط (ماه)</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={months}
                    onChange={(e) => setMonths(Number(e.target.value))}
                    className="w-full px-2 py-1.5 border text-sm"
                    style={{ borderColor: "var(--line-dark)" }}
                  />
                </div>
              </div>
              <button
                onClick={previewInstallment}
                className="text-sm font-bold underline"
                style={{ color: "var(--brass-deep)" }}
              >
                محاسبه اقساط
              </button>
              {installmentPreview && (
                <div className="mt-3 text-sm">
                  قسط ماهانه: <b>{installmentPreview.monthlyAmount.toLocaleString("fa-IR")} تومان</b>{" "}
                  برای {installmentPreview.months} ماه (نرخ سود نمایشی{" "}
                  {(installmentPreview.interestRate * 100).toFixed(0)}٪ در ماه)
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div>
        <div
          className="p-6 mb-6"
          style={{ background: "var(--charcoal)", color: "var(--cream)" }}
        >
          <div className="relative h-72 flex items-end justify-center" style={{ background: "#0d0d0d" }}>
            <div className="w-3/4 h-64 relative overflow-hidden" style={{ background: "#0d0d0d", border: "10px solid #4a4038" }}>
              <div
                className="absolute top-0 bottom-0"
                style={{ width: `${Math.max(10, 50 - lightBlockPct / 3)}%`, right: 0, background: color?.hex }}
              />
              <div
                className="absolute top-0 bottom-0"
                style={{ width: `${Math.max(10, 50 - lightBlockPct / 3)}%`, left: 0, background: color?.hex }}
              />
            </div>
          </div>
          <div className="text-xs text-white/50 mt-3 text-center">
            پیش‌نمایش ساده — برای دیدن روی عکس واقعی پنجره‌ی خودتان از «پیش‌نمایش هوشمند» استفاده کنید.
          </div>
        </div>

        <h3 className="font-bold mb-4">تکمیل سفارش</h3>
        <div className="flex flex-col gap-3 mb-4">
          <input
            placeholder="نام و نام خانوادگی"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="px-3 py-2.5 border text-sm"
            style={{ borderColor: "var(--line-dark)" }}
          />
          <input
            placeholder="شماره تماس"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            className="px-3 py-2.5 border text-sm"
            style={{ borderColor: "var(--line-dark)" }}
          />
          <textarea
            placeholder="آدرس تحویل"
            value={customerAddress}
            onChange={(e) => setCustomerAddress(e.target.value)}
            className="px-3 py-2.5 border text-sm"
            style={{ borderColor: "var(--line-dark)" }}
            rows={3}
          />
        </div>

        {error && <div className="text-sm mb-3" style={{ color: "var(--burgundy)" }}>{error}</div>}

        <button
          onClick={submitOrder}
          disabled={submitting}
          className="w-full py-3.5 font-bold rounded-sm disabled:opacity-60"
          style={{ background: "var(--brass)", color: "var(--ink)" }}
        >
          {submitting ? "در حال ثبت سفارش…" : "ثبت سفارش"}
        </button>
      </div>
    </div>
  );
}
