"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, ShieldCheck, Truck, Sparkles } from "lucide-react";
import { Product } from "@/lib/types";
import { computeUnitPrice, SEAM_TYPES, TEXTURES } from "@/lib/pricing";
import { InstallmentResult } from "@/lib/types";

const SEAM_LABELS: Record<string, string> = {
  "پرچین": "پرچین (گرد و نرم)",
  "پیلی‌دار": "پیلی‌دار (چین‌های عمودی)",
  "حلقه‌ای": "حلقه‌ای (رینگی)",
};

const TEXTURE_LABELS: Record<string, string> = {
  "ساده": "ساده و صاف",
  "بافت‌دار": "بافت‌دار",
  "مخملی": "مخملی و براق",
};

function textureOverlay(texture: string): string {
  switch (texture) {
    case "بافت‌دار":
      return "repeating-linear-gradient(115deg, rgba(0,0,0,0.16) 0px, rgba(0,0,0,0.16) 2px, transparent 2px, transparent 7px)";
    case "مخملی":
      return "radial-gradient(circle at 28% 18%, rgba(255,255,255,0.28), transparent 55%)";
    default:
      return "none";
  }
}

function seamStripPattern(seamType: string): string {
  switch (seamType) {
    case "پیلی‌دار":
      return "repeating-linear-gradient(90deg, rgba(0,0,0,0.4) 0 4px, rgba(255,255,255,0.18) 4px 8px)";
    case "حلقه‌ای":
      return "repeating-radial-gradient(circle at 10px 6px, rgba(0,0,0,0.55) 0 3px, transparent 3.5px 20px)";
    default:
      return "repeating-radial-gradient(circle at 6px 8px, rgba(255,255,255,0.4) 0 2.5px, transparent 3px 11px)";
  }
}

export default function Customizer({ product }: { product: Product }) {
  const router = useRouter();
  const [colorIdx, setColorIdx] = useState(0);
  const [texture, setTexture] = useState<string>(TEXTURES[0]);
  const [seamType, setSeamType] = useState<string>(SEAM_TYPES[0]);
  const [widthCm, setWidthCm] = useState(220);
  const [lightBlockPct, setLightBlockPct] = useState(30);
  const [liked, setLiked] = useState(false);
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
    () => computeUnitPrice(product.basePrice, widthCm, seamType, texture),
    [product.basePrice, widthCm, seamType, texture]
  );

  const panelWidthPct = Math.max(14, 46 - lightBlockPct / 4);
  const panelBackground = [
    textureOverlay(texture),
    "repeating-linear-gradient(100deg, rgba(0,0,0,0.36) 0px, rgba(0,0,0,0.1) 22px, rgba(255,255,255,0.08) 44px, rgba(0,0,0,0.3) 66px)",
    color?.hex ?? "#6E2A34",
  ]
    .filter((l) => l !== "none")
    .join(", ");

  const inputCls =
    "w-full px-3.5 py-2.5 text-sm rounded-sm outline-none focus:ring-1 transition-shadow";
  const inputStyle = {
    background: "var(--surface)",
    border: "1px solid var(--line)",
    color: "var(--cream)",
  };

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
              texture,
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
      {/* ---------- controls ---------- */}
      <div>
        <div className="flex items-start justify-between gap-4 mb-2">
          <h1 className="text-2xl font-black">{product.name}</h1>
          <button
            onClick={() => setLiked((v) => !v)}
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
          >
            <Heart size={16} fill={liked ? "var(--burgundy-light)" : "none"} style={{ color: "var(--burgundy-light)" }} />
          </button>
        </div>
        <p className="text-sm mb-8" style={{ color: "var(--muted)" }}>{product.description}</p>

        {/* step 1: color */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-black w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "var(--brass)", color: "var(--ink)" }}>۱</span>
            <label className="text-sm font-bold">رنگ پارچه — {color?.name}</label>
          </div>
          <div className="flex gap-3 flex-wrap">
            {product.colors.map((c, i) => (
              <button
                key={c.id}
                onClick={() => setColorIdx(i)}
                className="w-11 h-11 rounded-md relative transition-transform"
                style={{
                  background: c.hex,
                  outline: i === colorIdx ? "2px solid var(--brass)" : "2px solid transparent",
                  outlineOffset: "2px",
                  transform: i === colorIdx ? "scale(1.06)" : "scale(1)",
                }}
                title={c.name}
              />
            ))}
          </div>
        </div>

        {/* step 2: texture */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-black w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "var(--brass)", color: "var(--ink)" }}>۲</span>
            <label className="text-sm font-bold">بافت پارچه</label>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {TEXTURES.map((t) => (
              <button
                key={t}
                onClick={() => setTexture(t)}
                className="rounded-sm overflow-hidden text-right transition-transform"
                style={{
                  border: t === texture ? "1px solid var(--brass)" : "1px solid var(--line)",
                  transform: t === texture ? "translateY(-2px)" : "none",
                }}
              >
                <div
                  className="h-12"
                  style={{
                    background: [textureOverlay(t), color?.hex ?? "#6E2A34"].filter((l) => l !== "none").join(", "),
                  }}
                />
                <div className="px-2 py-1.5 text-[11px] font-bold" style={{ background: "var(--surface)" }}>
                  {TEXTURE_LABELS[t]}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* step 3: seam type */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-black w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "var(--brass)", color: "var(--ink)" }}>۳</span>
            <label className="text-sm font-bold">نوع دوخت</label>
          </div>
          <div className="flex flex-col gap-2">
            {SEAM_TYPES.map((s) => (
              <button
                key={s}
                onClick={() => setSeamType(s)}
                className="text-sm text-right px-4 py-3 rounded-sm transition-colors"
                style={{
                  background: s === seamType ? "var(--brass)" : "var(--surface)",
                  color: s === seamType ? "var(--ink)" : "var(--cream)",
                  border: s === seamType ? "1px solid var(--brass)" : "1px solid var(--line)",
                  fontWeight: s === seamType ? 700 : 400,
                }}
              >
                {SEAM_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        {/* step 4: size + light */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-black w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "var(--brass)", color: "var(--ink)" }}>۴</span>
            <label className="text-sm font-bold">اندازه و نورگذری</label>
          </div>
          <label className="text-xs block mb-2" style={{ color: "var(--muted)" }}>عرض پنجره: {widthCm.toLocaleString("fa-IR")} سانتی‌متر</label>
          <input type="range" min={80} max={400} value={widthCm} onChange={(e) => setWidthCm(Number(e.target.value))} className="w-full mb-5" />
          <label className="text-xs block mb-2" style={{ color: "var(--muted)" }}>میزان بازشدگی پرده: {lightBlockPct}%</label>
          <input type="range" min={0} max={100} value={lightBlockPct} onChange={(e) => setLightBlockPct(Number(e.target.value))} className="w-full" />
        </div>

        <div className="flex items-center gap-2 text-2xl font-black mb-8" style={{ color: "var(--brass)" }}>
          <Sparkles size={18} />
          {unitPrice.toLocaleString("fa-IR")} تومان
        </div>

        {/* payment */}
        <div className="border-t pt-6" style={{ borderColor: "var(--line)" }}>
          <label className="text-sm font-bold block mb-3">نوع پرداخت</label>
          <div className="flex gap-3 mb-4">
            <button
              onClick={() => setPaymentType("full")}
              className="px-4 py-2.5 text-sm rounded-sm"
              style={{
                border: "1px solid var(--line)",
                background: paymentType === "full" ? "var(--brass)" : "transparent",
                color: paymentType === "full" ? "var(--ink)" : "var(--cream)",
                fontWeight: paymentType === "full" ? 700 : 400,
              }}
            >
              پرداخت کامل
            </button>
            <button
              onClick={() => setPaymentType("installment")}
              className="px-4 py-2.5 text-sm rounded-sm"
              style={{
                border: "1px solid var(--line)",
                background: paymentType === "installment" ? "var(--brass)" : "transparent",
                color: paymentType === "installment" ? "var(--ink)" : "var(--cream)",
                fontWeight: paymentType === "installment" ? 700 : 400,
              }}
            >
              خرید اقساطی
            </button>
          </div>

          {paymentType === "installment" && (
            <div className="p-4 mb-4 rounded-sm" style={{ background: "var(--surface)" }}>
              <div className="flex gap-4 mb-3">
                <div className="flex-1">
                  <label className="text-xs block mb-1" style={{ color: "var(--muted)" }}>پیش‌پرداخت (تومان)</label>
                  <input type="number" min={0} value={downPayment} onChange={(e) => setDownPayment(Number(e.target.value))} className={inputCls} style={inputStyle} />
                </div>
                <div className="flex-1">
                  <label className="text-xs block mb-1" style={{ color: "var(--muted)" }}>تعداد اقساط (ماه)</label>
                  <input type="number" min={1} max={12} value={months} onChange={(e) => setMonths(Number(e.target.value))} className={inputCls} style={inputStyle} />
                </div>
              </div>
              <button onClick={previewInstallment} className="text-sm font-bold underline" style={{ color: "var(--brass)" }}>
                محاسبه اقساط
              </button>
              {installmentPreview && (
                <div className="mt-3 text-sm">
                  قسط ماهانه: <b>{installmentPreview.monthlyAmount.toLocaleString("fa-IR")} تومان</b> برای {installmentPreview.months} ماه
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ---------- live preview ---------- */}
      <div>
        <div className="p-6 mb-4 rounded-sm" style={{ background: "var(--charcoal)" }}>
          <div
            className="relative h-80 rounded-sm overflow-hidden grain-bg"
            style={{ background: "linear-gradient(180deg, var(--charcoal-2), var(--charcoal))" }}
          >
            {/* floor */}
            <div className="absolute bottom-0 inset-x-0 h-12" style={{ background: "linear-gradient(180deg, transparent, rgba(0,0,0,.4))" }} />

            {/* window */}
            <div
              className="absolute top-8 bottom-12 left-1/2 -translate-x-1/2 w-3/4 overflow-hidden"
              style={{ background: "#0d0d0d", border: "10px solid #3c332a" }}
            >
              {/* sky/light behind */}
              <div
                className="absolute inset-0"
                style={{
                  background: `radial-gradient(circle at 50% 30%, rgba(245,238,224,${0.05 + (100 - lightBlockPct) / 400}), transparent 70%)`,
                }}
              />

              {/* right curtain panel */}
              <div className="absolute top-0 bottom-0 right-0" style={{ width: `${panelWidthPct}%`, background: panelBackground }}>
                <div className="absolute top-0 inset-x-0 h-4" style={{ background: seamStripPattern(seamType) }} />
              </div>
              {/* left curtain panel */}
              <div className="absolute top-0 bottom-0 left-0" style={{ width: `${panelWidthPct}%`, background: panelBackground }}>
                <div className="absolute top-0 inset-x-0 h-4" style={{ background: seamStripPattern(seamType) }} />
              </div>
            </div>
          </div>
          <div className="text-xs mt-3 text-center" style={{ color: "var(--muted)" }}>
            پیش‌نمایش زنده — برای دیدن روی عکس واقعی پنجره‌ی خودتان از «پیش‌نمایش هوشمند» استفاده کنید.
          </div>
        </div>

        <div className="flex gap-4 mb-8 text-xs" style={{ color: "var(--muted)" }}>
          <span className="flex items-center gap-1.5"><ShieldCheck size={14} style={{ color: "var(--brass)" }} /> ۲۴ ماه گارانتی دوخت</span>
          <span className="flex items-center gap-1.5"><Truck size={14} style={{ color: "var(--brass)" }} /> ارسال ۷ تا ۱۰ روز کاری</span>
        </div>

        <h3 className="font-bold mb-4">تکمیل سفارش</h3>
        <div className="flex flex-col gap-3 mb-4">
          <input placeholder="نام و نام خانوادگی" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className={inputCls} style={inputStyle} />
          <input placeholder="شماره تماس" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className={inputCls} style={inputStyle} />
          <textarea placeholder="آدرس تحویل" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} className={inputCls} style={inputStyle} rows={3} />
        </div>

        {error && <div className="text-sm mb-3" style={{ color: "var(--burgundy-light)" }}>{error}</div>}

        <button onClick={submitOrder} disabled={submitting} className="btn-brass w-full py-3.5 rounded-sm disabled:opacity-60">
          {submitting ? "در حال ثبت سفارش…" : "ثبت سفارش"}
        </button>
      </div>
    </div>
  );
}
