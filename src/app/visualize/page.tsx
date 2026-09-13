"use client";

import { useEffect, useRef, useState } from "react";
import { Upload, Wand2, Info } from "lucide-react";
import { Product } from "@/lib/types";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CompareSlider from "@/components/CompareSlider";

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
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    <main>
      <Header />
      <div className="container-x py-14">
        <div className="section-eyebrow mb-3">پیش‌نمایش هوشمند</div>
        <h1 className="text-3xl font-black mb-3">قبل از خرید، نتیجه را ببینید</h1>
        <p className="text-sm mb-3" style={{ color: "var(--muted)" }}>
          عکس پنجره‌ی خودتان را بگذارید، طرح و رنگ را انتخاب کنید و نتیجه را ببینید.
        </p>
        <p className="text-xs flex items-center gap-1.5 mb-10" style={{ color: "var(--muted)" }}>
          <Info size={13} /> این نسخه یک نمونه‌ی آزمایشی (mock) است، نه یک مدل هوش مصنوعی واقعی.
        </p>

        <div className="grid md:grid-cols-2 gap-10">
          <div>
            <label className="text-sm font-bold block mb-2">عکس پنجره</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const f = e.dataTransfer.files?.[0];
                if (f) onFileChange(f);
              }}
              className="cursor-pointer border-2 border-dashed rounded-sm flex flex-col items-center justify-center gap-2 py-10 mb-8 transition-colors"
              style={{
                borderColor: dragOver ? "var(--brass)" : "var(--line-dark)",
                background: dragOver ? "var(--sand)" : "transparent",
              }}
            >
              <Upload size={26} style={{ color: "var(--brass-deep)" }} />
              <span className="text-sm font-bold">
                {file ? file.name : "عکس را بکشید و رها کنید یا کلیک کنید"}
              </span>
              <span className="text-xs" style={{ color: "var(--muted)" }}>JPG یا PNG</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
              />
            </div>

            <label className="text-sm font-bold block mb-2">طرح پرده</label>
            <select
              value={productSlug}
              onChange={(e) => {
                setProductSlug(e.target.value);
                const p = products.find((pp) => pp.slug === e.target.value);
                if (p?.colors[0]) setColorHex(p.colors[0].hex);
              }}
              className="w-full mb-6 px-3 py-2.5 border text-sm rounded-sm"
              style={{ borderColor: "var(--line-dark)", background: "var(--surface)", color: "var(--cream)" }}
            >
              {products.map((p) => (
                <option key={p.slug} value={p.slug}>{p.name}</option>
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
                      className="w-9 h-9 rounded-full border-2"
                      style={{ background: c.hex, borderColor: c.hex === colorHex ? "var(--brass)" : "transparent" }}
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
              className="btn-brass px-6 py-4 rounded-sm disabled:opacity-60 flex items-center gap-2"
            >
              <Wand2 size={16} />
              {loading ? "در حال تولید پیش‌نمایش…" : resultUrl ? "به‌روزرسانی پیش‌نمایش" : "تولید پیش‌نمایش"}
            </button>
          </div>

          <div>
            {!previewUrl && (
              <div
                className="aspect-[4/3] flex items-center justify-center text-sm"
                style={{ background: "var(--sand)", color: "var(--muted)" }}
              >
                عکس پنجره‌تان اینجا نمایش داده می‌شود
              </div>
            )}
            {previewUrl && !resultUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="عکس اصلی پنجره" className="w-full border" style={{ borderColor: "var(--line-dark)" }} />
            )}
            {resultUrl && previewUrl && <CompareSlider beforeSrc={previewUrl} afterSrc={resultUrl} />}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
