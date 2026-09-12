"use client";

import { useEffect, useState } from "react";
import { Product } from "@/lib/types";

export default function VisualizePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productSlug, setProductSlug] = useState("");
  const [colorHex, setColorHex] = useState("#6E2A34");
  const [openness, setOpenness] = useState(30);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => {
        setProducts(d.products);
        if (d.products[0]) {
          setProductSlug(d.products[0].slug);
          setColorHex(d.products[0].colors[0]?.hex ?? "#6E2A34");
        }
      });
  }, []);

  function onFileChange(f: File | null) {
    setFile(f);
    setResultUrl(null);
    if (f) setPreviewUrl(URL.createObjectURL(f));
  }

  async function generate() {
    if (!file) {
      setError("لطفاً ابتدا عکس پنجره را انتخاب کنید.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      fd.append("colorHex", colorHex);
      fd.append("openness", String(openness));
      fd.append("productSlug", productSlug);

      const res = await fetch("/api/ai-visualize", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "خطا در تولید پیش‌نمایش");
        return;
      }
      setResultUrl(data.resultUrl);
    } finally {
      setLoading(false);
    }
  }

  const selectedProduct = products.find((p) => p.slug === productSlug);

  return (
    <main className="max-w-5xl mx-auto px-7 py-14">
      <h1 className="text-3xl font-black mb-3">پیش‌نمایش هوشمند</h1>
      <p className="text-sm mb-10" style={{ color: "#6b6154" }}>
        عکس پنجره‌ی خودتان را بگذارید، طرح و رنگ را انتخاب کنید و نتیجه را ببینید.
        این نسخه یک نمونه‌ی آزمایشی (mock) است، نه یک مدل هوش مصنوعی واقعی.
      </p>

      <div className="grid md:grid-cols-2 gap-10">
        <div>
          <label className="text-sm font-bold block mb-2">عکس پنجره</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
            className="mb-6 text-sm"
          />

          <label className="text-sm font-bold block mb-2">طرح پرده</label>
          <select
            value={productSlug}
            onChange={(e) => {
              setProductSlug(e.target.value);
              const p = products.find((pp) => pp.slug === e.target.value);
              if (p?.colors[0]) setColorHex(p.colors[0].hex);
            }}
            className="w-full mb-6 px-3 py-2 border text-sm"
            style={{ borderColor: "var(--line-dark)" }}
          >
            {products.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name}
              </option>
            ))}
          </select>

          {selectedProduct && (
            <>
              <label className="text-sm font-bold block mb-2">رنگ</label>
              <div className="flex gap-3 mb-6">
                {selectedProduct.colors.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setColorHex(c.hex)}
                    className="w-8 h-8 rounded-full border-2"
                    style={{ background: c.hex, borderColor: c.hex === colorHex ? "var(--ink)" : "transparent" }}
                  />
                ))}
              </div>
            </>
          )}

          <label className="text-sm font-bold block mb-2">میزان بازشدگی پرده: {openness}%</label>
          <input
            type="range"
            min={0}
            max={90}
            value={openness}
            onChange={(e) => setOpenness(Number(e.target.value))}
            className="w-full mb-8"
          />

          {error && <div className="text-sm mb-4" style={{ color: "var(--burgundy)" }}>{error}</div>}

          <button
            onClick={generate}
            disabled={loading}
            className="px-6 py-3.5 font-bold rounded-sm disabled:opacity-60"
            style={{ background: "var(--brass)", color: "var(--ink)" }}
          >
            {loading ? "در حال تولید پیش‌نمایش…" : resultUrl ? "به‌روزرسانی پیش‌نمایش" : "تولید پیش‌نمایش"}
          </button>
        </div>

        <div>
          {!previewUrl && (
            <div
              className="h-80 flex items-center justify-center text-sm"
              style={{ background: "var(--sand)", color: "#6b6154" }}
            >
              عکس پنجره‌تان اینجا نمایش داده می‌شود
            </div>
          )}
          {previewUrl && !resultUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="عکس اصلی پنجره" className="w-full border" style={{ borderColor: "var(--line-dark)" }} />
          )}
          {resultUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={resultUrl} alt="پیش‌نمایش پرده روی پنجره" className="w-full border" style={{ borderColor: "var(--line-dark)" }} />
          )}
        </div>
      </div>
    </main>
  );
}
