"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Star, Sun, Layers } from "lucide-react";
import { Product } from "@/lib/types";

const CATEGORY_LABELS: Record<string, string> = {
  all: "همه",
  classic: "کلاسیک",
  modern: "مدرن",
  linen: "مینیمال",
  velvet: "لوکس",
};

// امتیازها ثابت و بر اساس ایندکس محصول هستند (نه تصادفی)، صرفاً برای نمایش.
const RATINGS = [4.9, 4.7, 4.8, 5.0];
const BADGES = ["پرفروش", "جدید", null, "پیشنهاد ویژه"];

export default function ProductGrid({ products }: { products: Product[] }) {
  const [category, setCategory] = useState("all");
  const [liked, setLiked] = useState<Record<string, boolean>>({});

  const categories = ["all", ...Array.from(new Set(products.map((p) => p.category)))];
  const filtered = category === "all" ? products : products.filter((p) => p.category === category);

  return (
    <div>
      <div className="flex gap-2 mb-10 flex-wrap">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className="px-4 py-2 text-sm rounded-full border transition-colors"
            style={{
              borderColor: category === c ? "transparent" : "var(--line-dark)",
              background: category === c ? "var(--brass)" : "transparent",
              color: category === c ? "var(--ink)" : "inherit",
              fontWeight: category === c ? 700 : 500,
            }}
          >
            {CATEGORY_LABELS[c] ?? c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filtered.map((p, i) => {
          const idx = products.findIndex((pp) => pp.id === p.id);
          const rating = RATINGS[idx % RATINGS.length];
          const badge = BADGES[idx % BADGES.length];

          return (
            <div
              key={p.id}
              className="card-lift border relative overflow-hidden fade-up"
              style={{ borderColor: "var(--line-dark)", background: "var(--surface)", animationDelay: `${i * 60}ms` }}
            >
              {badge && (
                <span
                  className="absolute top-3 right-3 z-10 text-[11px] font-bold px-2.5 py-1 rounded-full"
                  style={{ background: "var(--burgundy)", color: "var(--cream)" }}
                >
                  {badge}
                </span>
              )}
              <button
                onClick={() => setLiked((s) => ({ ...s, [p.id]: !s[p.id] }))}
                className="absolute top-3 left-3 z-10 w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: "rgba(20,16,12,.75)" }}
                aria-label="علاقه‌مندی"
              >
                <Heart
                  size={15}
                  fill={liked[p.id] ? "var(--burgundy)" : "none"}
                  style={{ color: "var(--burgundy)" }}
                />
              </button>

              <Link href={`/customize/${p.slug}`}>
                <div
                  className="h-44 relative"
                  style={{
                    background: `linear-gradient(120deg, ${p.colors[0]?.hex ?? "#B98A44"}, ${
                      p.colors[1]?.hex ?? p.colors[0]?.hex ?? "#8C6529"
                    })`,
                  }}
                >
                  <div className="absolute inset-0 pleat-fold opacity-40" />
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold" style={{ color: "var(--brass-deep)" }}>
                      {p.fabricType}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-bold">
                      <Star size={12} fill="var(--brass)" style={{ color: "var(--brass)" }} />
                      {rating.toLocaleString("fa-IR")}
                    </span>
                  </div>
                  <h3 className="font-bold mb-1.5">{p.name}</h3>
                  <p className="text-xs mb-3" style={{ color: "var(--muted)" }}>
                    {p.description}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] mb-3" style={{ color: "var(--muted)" }}>
                    <span className="flex items-center gap-1">
                      <Sun size={12} /> نورگذری {p.lightBlock}
                    </span>
                    <span className="flex items-center gap-1">
                      <Layers size={12} /> {p.colors.length} رنگ
                    </span>
                  </div>
                  <div className="text-sm font-bold">
                    از {p.basePrice.toLocaleString("fa-IR")} تومان
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
