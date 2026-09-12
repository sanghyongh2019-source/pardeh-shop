"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "پیش‌نمایش هوشمند دقیقاً چطور کار می‌کند؟",
    a: "عکس پنجره‌ی خودتان را آپلود می‌کنید، طرح و رنگ پرده را انتخاب می‌کنید و سیستم نتیجه را روی همان عکس نشان می‌دهد. می‌توانید رنگ و میزان بازشدگی را تغییر دهید و نتیجه فوراً به‌روزرسانی می‌شود.",
  },
  {
    q: "خرید اقساطی چه شرایطی دارد؟",
    a: "می‌توانید تا ۱۲ ماه اقساط انتخاب کنید. پیش از ثبت سفارش، جدول کامل اقساط با مبلغ هر ماه به شما نمایش داده می‌شود تا بدون ابهام تصمیم بگیرید.",
  },
  {
    q: "گارانتی دوخت و نصب شامل چه چیزهایی است؟",
    a: "۲۴ ماه گارانتی روی دوخت، ریل و اجرای نصب داریم. اگر مشکلی در این بازه پیش بیاید، بدون هزینه بررسی و رفع می‌شود.",
  },
  {
    q: "اگر رنگ یا اندازه دلخواهم را نبینم چه کار کنم؟",
    a: "در صفحه‌ی سفارشی‌سازی هر طرح، عرض دقیق پنجره‌ی خودتان را وارد می‌کنید و قیمت بر همان اساس محاسبه می‌شود. برای رنگ‌های خارج از لیست هم می‌توانید قبل از ثبت سفارش با ما در تماس باشید.",
  },
  {
    q: "ارسال و نصب در همه‌ی شهرها انجام می‌شود؟",
    a: "بله، ارسال به سراسر کشور انجام می‌شود و برای نصب تخصصی هم تیم‌های همکار در شهرهای اصلی فعال هستند.",
  },
];

export default function FaqAccordion() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div className="max-w-2xl mx-auto">
      {FAQS.map((f, i) => {
        const isOpen = openIdx === i;
        return (
          <div key={i} className="border-b" style={{ borderColor: "var(--line-dark)" }}>
            <button
              onClick={() => setOpenIdx(isOpen ? null : i)}
              className="w-full flex items-center justify-between py-5 text-right font-bold text-sm md:text-base"
            >
              {f.q}
              <ChevronDown
                size={18}
                className="transition-transform shrink-0 mr-3"
                style={{ transform: isOpen ? "rotate(180deg)" : "none", color: "var(--brass-deep)" }}
              />
            </button>
            {isOpen && (
              <p className="pb-5 text-sm leading-loose" style={{ color: "var(--muted)" }}>
                {f.a}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
