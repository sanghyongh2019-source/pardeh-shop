import Link from "next/link";
import { Product } from "@/lib/types";
import db from "@/lib/db";

async function getProducts(): Promise<Product[]> {
  // چون این کامپوننت روی سرور اجرا می‌شود، مستقیم از دیتابیس می‌خوانیم.
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

export default async function Home() {
  const products = await getProducts();

  return (
    <main>
      <header className="sticky top-0 z-50 bg-[var(--cream)] border-b" style={{ borderColor: "var(--line-dark)" }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between px-7 py-4">
          <div className="text-2xl font-black" style={{ color: "var(--brass-deep)" }}>
            پرده<span style={{ color: "var(--burgundy)" }}>سرا</span>
          </div>
          <nav className="hidden md:flex gap-8 text-sm font-medium opacity-80">
            <a href="#catalog">طرح‌ها</a>
            <Link href="/visualize">پیش‌نمایش هوشمند</Link>
          </nav>
        </div>
      </header>

      <section className="text-white" style={{ background: "var(--charcoal)" }}>
        <div className="max-w-6xl mx-auto px-7 py-20">
          <div className="text-sm font-bold mb-5" style={{ color: "var(--brass)" }}>
            پرده تخصصی، دوخت و نصب سراسری
          </div>
          <h1 className="text-4xl md:text-5xl font-black leading-relaxed max-w-xl mb-6">
            پرده‌ای که قبل از خریدن، در خانه‌ی خودت می‌بینی
          </h1>
          <p className="max-w-md text-white/75 mb-8">
            طرح را انتخاب کن، رنگ و اندازه را دقیق‌سازی کن و نتیجه را روی عکس پنجره‌ی
            واقعی خودت ببین — قبل از پرداخت نهایی.
          </p>
          <Link
            href="/visualize"
            className="inline-block px-7 py-4 font-bold rounded-sm"
            style={{ background: "var(--brass)", color: "var(--ink)" }}
          >
            شروع پیش‌نمایش
          </Link>
        </div>
      </section>

      <section id="catalog" className="max-w-6xl mx-auto px-7 py-20">
        <h2 className="text-3xl font-black mb-3">طرح‌هایی برای هر سبک از خانه</h2>
        <p className="text-sm mb-10" style={{ color: "#6b6154" }}>
          هر طرح با نوع پارچه و میزان نورگذری واقعی معرفی شده است.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <Link
              key={p.id}
              href={`/customize/${p.slug}`}
              className="border block hover:shadow-md transition-shadow"
              style={{ borderColor: "var(--line-dark)" }}
            >
              <div
                className="h-40"
                style={{
                  background: `linear-gradient(120deg, ${p.colors[0]?.hex ?? "#B98A44"}, ${
                    p.colors[1]?.hex ?? p.colors[0]?.hex ?? "#8C6529"
                  })`,
                }}
              />
              <div className="p-5">
                <span className="text-xs font-bold" style={{ color: "var(--brass)" }}>
                  {p.fabricType}
                </span>
                <h3 className="font-bold mt-1 mb-1">{p.name}</h3>
                <p className="text-xs" style={{ color: "#6b6154" }}>
                  {p.description}
                </p>
                <div className="mt-3 text-sm font-bold">
                  از {p.basePrice.toLocaleString("fa-IR")} تومان
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <footer className="text-white/60 text-sm py-10" style={{ background: "var(--charcoal)" }}>
        <div className="max-w-6xl mx-auto px-7">© تمامی حقوق برای پرده‌سرا محفوظ است.</div>
      </footer>
    </main>
  );
}
