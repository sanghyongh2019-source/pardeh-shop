import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";

// یک نمونه singleton از دیتابیس SQLite. برای پروداکشن واقعی، این باید با
// Postgres/MySQL و یک ORM (Prisma/Drizzle) جایگزین شود؛ اینجا برای نسخه‌ی
// آزمایشی، یک فایل SQLite ساده و بدون وابستگی به سرویس بیرونی استفاده شده.
const dataDir = path.join(process.cwd(), "data");
fs.mkdirSync(dataDir, { recursive: true });
const dbPath = path.join(dataDir, "app.db");
const db = new Database(dbPath, { timeout: 10000 });
db.pragma("busy_timeout = 10000");
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  basePrice INTEGER NOT NULL,
  fabricType TEXT NOT NULL,
  lightBlock TEXT NOT NULL,
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS colors (
  id TEXT PRIMARY KEY,
  productId TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  hex TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  customerName TEXT NOT NULL,
  customerPhone TEXT NOT NULL,
  customerAddress TEXT NOT NULL,
  totalAmount INTEGER NOT NULL,
  paymentType TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_payment',
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  orderId TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  productId TEXT NOT NULL REFERENCES products(id),
  colorName TEXT NOT NULL,
  colorHex TEXT NOT NULL,
  seamType TEXT NOT NULL,
  widthCm INTEGER NOT NULL,
  lightBlockPct INTEGER NOT NULL,
  unitPrice INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS installment_plans (
  id TEXT PRIMARY KEY,
  orderId TEXT UNIQUE NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  totalAmount INTEGER NOT NULL,
  downPayment INTEGER NOT NULL,
  months INTEGER NOT NULL,
  monthlyAmount INTEGER NOT NULL,
  interestRate REAL NOT NULL,
  schedule TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'mock-installment-gateway',
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS visualization_requests (
  id TEXT PRIMARY KEY,
  productSlug TEXT NOT NULL,
  colorHex TEXT NOT NULL,
  originalPath TEXT NOT NULL,
  resultPath TEXT NOT NULL,
  createdAt TEXT NOT NULL
);
`);

function seedIfEmpty() {
  // Next.js's build step evaluates این ماژول را از چند worker موازی import
  // می‌کند، پس چند فرآیند ممکن است هم‌زمان seedIfEmpty را صدا بزنند. برای
  // جلوگیری از race condition، همه‌ی کار (چک + insert) داخل یک تراکنش
  // immediate انجام می‌شود و خطای رقابتی احتمالی نادیده گرفته می‌شود.
  const products = [
    {
      slug: "classic-golden-pleat",
      name: "پرده پرچینی طلایی",
      category: "classic",
      description: "افت سنگین و کلاسیک، مناسب پذیرایی و اتاق نشیمن رسمی.",
      basePrice: 8_500_000,
      fabricType: "پارچه ژاکارد سنگین",
      lightBlock: "کم",
      colors: [
        { name: "طلایی برنزی", hex: "#B98A44" },
        { name: "زرشکی", hex: "#6E2A34" },
        { name: "زغالی", hex: "#2A241F" },
      ],
    },
    {
      slug: "modern-two-tone",
      name: "پرده دو رنگ شب‌گرد",
      category: "modern",
      description: "افت صاف و مدرن با دو لایه، نورگذری قابل تنظیم، مناسب اتاق کار.",
      basePrice: 7_200_000,
      fabricType: "پلی‌استر مات دو لایه",
      lightBlock: "متوسط",
      colors: [
        { name: "زغالی", hex: "#2A241F" },
        { name: "کرم", hex: "#EDE3CF" },
      ],
    },
    {
      slug: "natural-linen",
      name: "پرده کتان طبیعی",
      category: "linen",
      description: "سبک، روشن و طبیعی؛ مناسب اتاق خواب و فضاهای آرام.",
      basePrice: 5_400_000,
      fabricType: "کتان خام",
      lightBlock: "کم",
      colors: [
        { name: "کرم طبیعی", hex: "#EDE3CF" },
        { name: "دودی روشن", hex: "#C9BFA8" },
      ],
    },
    {
      slug: "burgundy-velvet",
      name: "پرده مخمل زرشکی",
      category: "velvet",
      description: "بلک‌اوت کامل و افت لوکس، مناسب سینمای خانگی.",
      basePrice: 11_800_000,
      fabricType: "مخمل ضخیم",
      lightBlock: "بلک‌اوت",
      colors: [
        { name: "زرشکی", hex: "#6E2A34" },
        { name: "زغالی", hex: "#2A241F" },
      ],
    },
  ];

  const insertProduct = db.prepare(
    `INSERT INTO products (id, slug, name, category, description, basePrice, fabricType, lightBlock, createdAt)
     VALUES (@id, @slug, @name, @category, @description, @basePrice, @fabricType, @lightBlock, @createdAt)`
  );
  const insertColor = db.prepare(
    `INSERT INTO colors (id, productId, name, hex) VALUES (@id, @productId, @name, @hex)`
  );

  const tx = db.transaction(() => {
    const count = db.prepare("SELECT COUNT(*) as c FROM products").get() as { c: number };
    if (count.c > 0) return;

    for (const p of products) {
      const id = randomUUID();
      insertProduct.run({
        id,
        slug: p.slug,
        name: p.name,
        category: p.category,
        description: p.description,
        basePrice: p.basePrice,
        fabricType: p.fabricType,
        lightBlock: p.lightBlock,
        createdAt: new Date().toISOString(),
      });
      for (const c of p.colors) {
        insertColor.run({ id: randomUUID(), productId: id, name: c.name, hex: c.hex });
      }
    }
  });

  try {
    tx.immediate();
  } catch (e) {
    // یک فرآیند موازی دیگر (مثلاً worker دیگری از مرحله‌ی build نکست‌جی‌اس)
    // همین الان seed را انجام داده؛ این خطا بی‌ضرر است.
    console.warn("seed skipped (likely already seeded concurrently):", (e as Error).message);
  }
}

seedIfEmpty();

export default db;
