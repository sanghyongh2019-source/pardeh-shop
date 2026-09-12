import Link from "next/link";
import { ShieldCheck, Truck, RotateCcw, Camera, Send, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer style={{ background: "var(--charcoal)", color: "rgba(246,240,228,.72)" }}>
      <div className="container-x py-10 grid grid-cols-2 gap-6 border-b" style={{ borderColor: "var(--line)" }}>
        {[
          { icon: ShieldCheck, text: "۲۴ ماه گارانتی دوخت و نصب" },
          { icon: Truck, text: "ارسال به سراسر کشور" },
          { icon: RotateCcw, text: "۷ روز ضمانت بازگشت کالا" },
          { icon: Phone, text: "پشتیبانی تلفنی ۷ روز هفته" },
        ].map((it, i) => (
          <div key={i} className="flex items-center gap-3 text-xs md:text-sm">
            <it.icon size={20} style={{ color: "var(--brass)" }} className="shrink-0" />
            <span>{it.text}</span>
          </div>
        ))}
      </div>

      <div className="container-x py-14 grid grid-cols-2 md:grid-cols-4 gap-10">
        <div className="col-span-2 md:col-span-1">
          <div className="text-xl font-black mb-3" style={{ color: "var(--cream)" }}>
            پرده<span style={{ color: "var(--brass)" }}>سرا</span>
          </div>
          <p className="text-sm mb-4">
            دوخت، طراحی و نصب تخصصی پرده — با ضمانت اصالت پارچه و پیش‌نمایش هوشمند پیش از خرید.
          </p>
          <div className="flex gap-3">
            <a href="#" aria-label="اینستاگرام" className="w-9 h-9 rounded-full flex items-center justify-center border" style={{ borderColor: "var(--line)" }}>
              <Camera size={16} />
            </a>
            <a href="#" aria-label="تلگرام" className="w-9 h-9 rounded-full flex items-center justify-center border" style={{ borderColor: "var(--line)" }}>
              <Send size={16} />
            </a>
          </div>
        </div>

        <div>
          <h5 className="text-sm font-bold mb-4" style={{ color: "var(--cream)" }}>محصولات</h5>
          <ul className="text-sm space-y-2.5">
            <li><Link href="/#catalog">پرده کلاسیک</Link></li>
            <li><Link href="/#catalog">پرده مدرن</Link></li>
            <li><Link href="/#catalog">پرده بلک‌اوت</Link></li>
            <li><Link href="/#catalog">پرده کتان</Link></li>
          </ul>
        </div>

        <div>
          <h5 className="text-sm font-bold mb-4" style={{ color: "var(--cream)" }}>خدمات</h5>
          <ul className="text-sm space-y-2.5">
            <li><Link href="/#catalog">سفارشی‌سازی</Link></li>
            <li><Link href="/visualize">پیش‌نمایش هوشمند</Link></li>
            <li><Link href="/#installment">فروش اقساطی</Link></li>
            <li>نصب سراسری</li>
          </ul>
        </div>

        <div>
          <h5 className="text-sm font-bold mb-4" style={{ color: "var(--cream)" }}>پشتیبانی</h5>
          <ul className="text-sm space-y-2.5">
            <li>راهنمای اندازه‌گیری</li>
            <li>گارانتی و مرجوعی</li>
            <li><a href="#faq">سوالات متداول</a></li>
            <li>تماس با ما</li>
          </ul>
        </div>
      </div>

      <div className="container-x py-6 text-xs flex flex-wrap justify-between gap-2 border-t" style={{ borderColor: "var(--line)" }}>
        <span>© تمامی حقوق برای پرده‌سرا محفوظ است.</span>
        <span>طراحی با تمرکز بر اعتماد و اصالت</span>
      </div>
    </footer>
  );
}
