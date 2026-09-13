import Link from "next/link";
import {
  Star,
  ShieldCheck,
  Palette,
  Ruler,
  Camera,
  Truck,
  CreditCard,
  CalendarClock,
  Percent,
  ArrowLeft,
} from "lucide-react";
import { Product } from "@/lib/types";
import db from "@/lib/db";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductGrid from "@/components/ProductGrid";
import TestimonialsCarousel from "@/components/TestimonialsCarousel";
import FaqAccordion from "@/components/FaqAccordion";
import Newsletter from "@/components/Newsletter";

// این صفحه باید همیشه از دیتابیس در حال اجرا (روی volume runtime) خوانده
// شود، نه این‌که در زمان build به‌صورت استاتیک freeze شود.
export const dynamic = "force-dynamic";

async function getProducts(): Promise<Product[]> {
  const rows = db.prepare("SELECT * FROM products ORDER BY createdAt ASC").all() as any[];
  const colorStmt = db.prepare("SELECT id, name, hex FROM colors WHERE productId = ?");
  return rows.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: p.category,
    description: p.description,
    basePrice: p.basePrice,
    fabricType: p.fabricType,
    lightBlock: p.lightBlock,
    colors: colorStmt.all(p.id) as any,
  }));
}

const STEPS = [
  { icon: Palette, title: "انتخاب طرح و رنگ", desc: "از بین طرح‌های کلاسیک تا مینیمال، پارچه و رنگ دلخواهتان را انتخاب کنید." },
  { icon: Ruler, title: "سفارشی‌سازی دقیق", desc: "عرض پنجره، نوع دوخت و میزان نورگذری را برای خانه‌ی خودتان تنظیم کنید." },
  { icon: Camera, title: "پیش‌نمایش هوشمند", desc: "عکس پنجره‌تان را بگذارید و نتیجه‌ی نهایی را پیش از خرید ببینید." },
  { icon: Truck, title: "دوخت، ارسال و نصب", desc: "تیم ما سفارش را می‌دوزد، ارسال می‌کند و در محل نصب می‌کند." },
];

export default async function Home() {
  const products = await getProducts();

  return (
    <main>
      <Header />

      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden" style={{ background: "var(--charcoal)" }}>
        <div className="container-x grid md:grid-cols-2 items-center gap-10 py-16 md:py-24">
          <div className="text-white fade-up">
            <div className="section-eyebrow mb-5 flex items-center gap-2" style={{ color: "var(--brass)" }}>
              پرده تخصصی، دوخت و نصب سراسری
            </div>
            <h1 className="text-4xl md:text-5xl font-black leading-relaxed mb-6">
              پرده‌ای که قبل از خریدن، در خانه‌ی خودت می‌بینی
            </h1>
            <p className="text-white/75 mb-8 max-w-md">
              از انتخاب پارچه تا دیدن نتیجه‌ی نهایی روی پنجره‌ی واقعی خودتان — با طراحی
              هوشمند، دوخت اختصاصی و امکان پرداخت اقساطی.
            </p>
            <div className="flex flex-wrap gap-4 mb-10">
              <Link href="#catalog" className="btn-brass px-7 py-4 rounded-sm inline-block">
                طراحی پرده‌ی من
              </Link>
              <Link href="/visualize" className="btn-outline border px-7 py-4 rounded-sm inline-block">
                پیش‌نمایش هوشمند
              </Link>
            </div>
            <div className="flex items-center gap-6 text-sm text-white/70">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={16} style={{ color: "var(--brass)" }} /> ۲۴ ماه گارانتی
              </span>
              <span className="flex items-center gap-1.5">
                <Percent size={16} style={{ color: "var(--brass)" }} /> اقساط تا ۱۲ ماه
              </span>
            </div>
          </div>

          <div className="relative">
            <div className="pleat-fold h-72 md:h-96 rounded-sm" style={{ background: "var(--brass-deep)" }} />
            <div
              className="absolute -bottom-6 -right-4 md:right-6 rounded-sm shadow-xl px-5 py-4 flex items-center gap-3"
              style={{ background: "var(--cream)", color: "var(--ink)" }}
            >
              <div className="flex -space-x-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} fill="var(--brass)" style={{ color: "var(--brass)" }} />
                ))}
              </div>
              <div className="text-xs font-bold leading-tight">
                ۴.۸ از ۵<br />
                <span style={{ color: "#6b6154" }} className="font-normal">رضایت مشتریان</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Stats ---------- */}
      <section className="border-b" style={{ borderColor: "var(--line-dark)" }}>
        <div className="container-x grid grid-cols-2 md:grid-cols-4 gap-8 py-10 text-center">
          {[
            ["+۳۲۰۰", "مشتری راضی"],
            ["۴۰+", "طرح و رنگ متنوع"],
            ["۹", "سال تجربه"],
            ["۲۸", "شهر تحت پوشش نصب"],
          ].map(([num, label]) => (
            <div key={label}>
              <div className="text-2xl md:text-3xl font-black mb-1" style={{ color: "var(--brass-deep)" }}>
                {num}
              </div>
              <div className="text-xs" style={{ color: "var(--muted)" }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Catalog ---------- */}
      <section id="catalog" className="container-x py-20">
        <div className="section-eyebrow mb-3">کاتالوگ محصولات</div>
        <h2 className="text-3xl font-black mb-3">طرح‌هایی برای هر سبک از خانه</h2>
        <p className="text-sm mb-10" style={{ color: "var(--muted)" }}>
          هر طرح با نوع پارچه، میزان نورگذری و امتیاز واقعی مشتریان معرفی شده است.
        </p>
        <ProductGrid products={products} />
      </section>

      {/* ---------- How it works ---------- */}
      <section style={{ background: "var(--sand)" }}>
        <div className="container-x py-20">
          <div className="section-eyebrow mb-3">مسیر خرید</div>
          <h2 className="text-3xl font-black mb-12">از انتخاب تا نصب، در ۴ قدم</h2>
          <div className="grid md:grid-cols-4 gap-8 relative">
            {STEPS.map((s, i) => (
              <div key={i} className="relative fade-up" style={{ animationDelay: `${i * 100}ms` }}>
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mb-5"
                  style={{ background: "var(--brass)", color: "var(--ink)" }}
                >
                  <s.icon size={22} />
                </div>
                <div className="text-xs font-bold mb-2" style={{ color: "var(--brass-deep)" }}>
                  قدم {i + 1}
                </div>
                <h3 className="font-bold mb-2">{s.title}</h3>
                <p className="text-sm" style={{ color: "var(--muted)" }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- AI visualize teaser ---------- */}
      <section className="text-white" style={{ background: "var(--charcoal)" }}>
        <div className="container-x py-20 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="section-eyebrow mb-3">پیش‌نمایش هوشمند</div>
            <h2 className="text-3xl font-black mb-5">عکس پنجره‌ات را بگذار، نتیجه را همان‌جا ببین</h2>
            <p className="text-white/70 mb-8">
              طرح انتخابی شما روی عکس واقعی پنجره‌تان قرار می‌گیرد. هر تغییر کوچک در رنگ
              یا مدل، در همان تصویر و در چند ثانیه به‌روزرسانی می‌شود.
            </p>
            <Link href="/visualize" className="btn-brass px-7 py-4 rounded-sm inline-flex items-center gap-2">
              شروع پیش‌نمایش <ArrowLeft size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="pleat-fold h-40 rounded-sm" style={{ background: "var(--burgundy)" }} />
            <div className="h-40 rounded-sm" style={{ background: "#0d0d0d", border: "8px solid #4a4038" }} />
            <div className="h-40 rounded-sm" style={{ background: "#0d0d0d", border: "8px solid #4a4038" }} />
            <div className="pleat-fold h-40 rounded-sm" style={{ background: "var(--brass-deep)" }} />
          </div>
        </div>
      </section>

      {/* ---------- Installment ---------- */}
      <section id="installment" className="container-x py-20">
        <div className="grid md:grid-cols-2 gap-14 items-center">
          <div>
            <div className="section-eyebrow mb-3">فروش اقساطی</div>
            <h2 className="text-3xl font-black mb-5">خرید اقساطی، بدون نگرانی مالی</h2>
            <p className="text-sm mb-8" style={{ color: "var(--muted)" }}>
              پرده باکیفیت لازم نیست یک‌جا هزینه‌ی سنگینی روی دستتان بگذارد. جدول کامل
              اقساط پیش از ثبت سفارش، دقیق و شفاف نمایش داده می‌شود.
            </p>
            <ul className="space-y-4 mb-2">
              <li className="flex items-start gap-3 text-sm">
                <CalendarClock size={18} style={{ color: "var(--brass-deep)" }} className="shrink-0 mt-0.5" />
                تقسیط تا ۱۲ ماه، محاسبه‌ی آنلاین پیش از سفارش
              </li>
              <li className="flex items-start gap-3 text-sm">
                <CreditCard size={18} style={{ color: "var(--brass-deep)" }} className="shrink-0 mt-0.5" />
                امکان ثبت سفارش بدون پیش‌پرداخت سنگین
              </li>
              <li className="flex items-start gap-3 text-sm">
                <ShieldCheck size={18} style={{ color: "var(--brass-deep)" }} className="shrink-0 mt-0.5" />
                تسویه زودتر از موعد بدون جریمه
              </li>
            </ul>
          </div>

          <div className="p-8" style={{ background: "var(--charcoal)", color: "var(--cream)" }}>
            <div className="text-4xl font-black mb-1" style={{ color: "var(--brass)" }}>
              ۸۵۰,۰۰۰ ت
            </div>
            <div className="text-xs mb-6" style={{ color: "rgba(246,240,228,.6)" }}>
              قسط ماهانه برای سفارش نمونه (پرده یک پنجره‌ی استاندارد)
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2.5 border-t" style={{ borderColor: "var(--line)" }}>
                <span>مبلغ کل سفارش</span><span className="font-bold">۱۰,۲۰۰,۰۰۰ ت</span>
              </div>
              <div className="flex justify-between py-2.5 border-t" style={{ borderColor: "var(--line)" }}>
                <span>مدت اقساط</span><span className="font-bold">۱۲ ماه</span>
              </div>
              <div className="flex justify-between py-2.5 border-t" style={{ borderColor: "var(--line)" }}>
                <span>پیش‌پرداخت</span><span className="font-bold">ندارد</span>
              </div>
            </div>
            <Link href="#catalog" className="btn-brass block text-center mt-6 py-3 rounded-sm">
              مشاهده‌ی طرح‌ها
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- Testimonials ---------- */}
      <section style={{ background: "var(--sand)" }}>
        <div className="container-x py-20">
          <TestimonialsCarousel />
        </div>
      </section>

      {/* ---------- Lookbook ---------- */}
      <section className="container-x py-20">
        <div className="section-eyebrow mb-3">لوک‌بوک</div>
        <h2 className="text-3xl font-black mb-10">پرده‌سرا در خانه‌های واقعی</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            "linear-gradient(140deg,#8C6529,#B98A44)",
            "linear-gradient(140deg,#2A241F,#6E2A34)",
            "linear-gradient(140deg,#EDE3CF,#C9BFA8)",
            "linear-gradient(140deg,#6E2A34,#2A241F)",
          ].map((bg, i) => (
            <div key={i} className="card-lift h-52 relative overflow-hidden" style={{ background: bg }}>
              <div className="absolute inset-0 pleat-fold opacity-30" />
            </div>
          ))}
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section id="faq" style={{ background: "var(--sand)" }}>
        <div className="container-x py-20">
          <div className="section-eyebrow mb-3 text-center">سوالات متداول</div>
          <h2 className="text-3xl font-black mb-12 text-center">هر چیزی که باید بدانید</h2>
          <FaqAccordion />
        </div>
      </section>

      {/* ---------- Newsletter ---------- */}
      <section className="text-white text-center" style={{ background: "var(--charcoal)" }}>
        <div className="container-x py-16">
          <h3 className="text-2xl font-black mb-3">از تخفیف‌های فصلی باخبر شوید</h3>
          <p className="text-white/70 mb-8 text-sm">فقط گاهی، فقط چیزهای مفید — بدون اسپم.</p>
          <Newsletter />
        </div>
      </section>

      <Footer />
    </main>
  );
}
