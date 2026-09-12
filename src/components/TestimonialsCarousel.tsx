"use client";

import { useEffect, useState } from "react";
import { Star, Quote } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "مریم ر.",
    city: "تهران",
    text: "قبل از خرید، دقیقاً روی عکس پنجره‌ی خودم دیدم پرده چه شکلی می‌شود. همین باعث شد با اطمینان سفارش بدهم.",
  },
  {
    name: "حامد ن.",
    city: "اصفهان",
    text: "اقساط بدون پیش‌پرداخت سنگین، تصمیم خریدمان را خیلی راحت‌تر کرد. نصب هم دقیقاً سر وقت انجام شد.",
  },
  {
    name: "سارا م.",
    city: "شیراز",
    text: "برگه اصالت پارچه همراه سفارش آمد؛ برای خریدی با این حجم هزینه، خیلی به من آرامش داد.",
  },
  {
    name: "علی ک.",
    city: "مشهد",
    text: "کیفیت دوخت واقعاً فرق داشت با چیزی که قبلاً از یک مغازه‌ی معمولی خریده بودم.",
  },
];

export default function TestimonialsCarousel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActive((a) => (a + 1) % TESTIMONIALS.length), 4500);
    return () => clearInterval(t);
  }, []);

  const item = TESTIMONIALS[active];

  return (
    <div className="max-w-2xl mx-auto text-center">
      <Quote size={32} style={{ color: "var(--brass)" }} className="mx-auto mb-6" />
      <p key={active} className="fade-up text-lg md:text-xl leading-loose mb-6">
        «{item.text}»
      </p>
      <div className="flex items-center justify-center gap-1 mb-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} size={14} fill="var(--brass)" style={{ color: "var(--brass)" }} />
        ))}
      </div>
      <div className="text-sm font-bold" style={{ color: "var(--brass-deep)" }}>
        {item.name} — {item.city}
      </div>

      <div className="flex justify-center gap-2 mt-8">
        {TESTIMONIALS.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className="w-2.5 h-2.5 rounded-full transition-all"
            style={{ background: i === active ? "var(--brass)" : "var(--line-dark)" }}
            aria-label={`نظر ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
