import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";
import db from "@/lib/db";

/**
 * این اندپوینت یک نسخه‌ی "mock" از قابلیت پیش‌نمایش هوشمند است، نه یک مدل
 * هوش مصنوعی واقعی. کاری که انجام می‌دهد: عکس پنجره‌ی کاربر را می‌گیرد و دو
 * پنل پرده (با رنگ و میزان بازشدگی انتخابی) را در دو طرف تصویر می‌نشاند تا
 * حس کلی نتیجه را نشان دهد.
 *
 * برای نسخه‌ی واقعی و دقیق (تشخیص خودکار قاب پنجره، هماهنگی نور و سایه با
 * محیط عکس) باید این بخش با یک مدل image-to-image / inpainting (مثل
 * Stable Diffusion + ControlNet یا Gemini/Imagen API) جایگزین شود؛ نقطه‌ی
 * اتصال آن دقیقاً همین‌جاست.
 */

const uploadsDir = path.join(process.cwd(), "public", "uploads");

function buildCurtainOverlaySvg(
  width: number,
  height: number,
  colorHex: string,
  opennessPct: number
) {
  // opennessPct: چه‌قدر از عرض پنجره باز/بدون پرده بماند (۰ یعنی کاملاً بسته)
  const panelWidth = Math.round((width * (100 - opennessPct)) / 100 / 2);
  const pleatWidth = Math.max(10, Math.round(panelWidth / 8));

  const pleatStripes = (x: number) =>
    Array.from({ length: Math.ceil(panelWidth / pleatWidth) })
      .map((_, i) => {
        const px = x + i * pleatWidth;
        const shade = i % 2 === 0 ? 1 : 0.82;
        return `<rect x="${px}" y="0" width="${pleatWidth}" height="${height}" fill="${colorHex}" opacity="${shade}" />`;
      })
      .join("");

  return `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <g>${pleatStripes(0)}</g>
  <g>${pleatStripes(width - panelWidth)}</g>
  <rect x="0" y="0" width="${panelWidth}" height="${height}" fill="black" opacity="0.12" />
  <rect x="${width - panelWidth}" y="0" width="${panelWidth}" height="${height}" fill="black" opacity="0.12" />
  <rect x="0" y="0" width="${width}" height="26" fill="#2A241F" opacity="0.9" />
</svg>`;
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("image") as File | null;
  const colorHex = (formData.get("colorHex") as string) || "#6E2A34";
  const openness = Number(formData.get("openness") ?? 30); // درصد بازشدگی وسط پنجره
  const productSlug = (formData.get("productSlug") as string) || "unknown";

  if (!file) {
    return NextResponse.json({ error: "عکس پنجره ارسال نشده است." }, { status: 400 });
  }
  if (!/^#[0-9A-Fa-f]{6}$/.test(colorHex)) {
    return NextResponse.json({ error: "کد رنگ نامعتبر است." }, { status: 400 });
  }

  fs.mkdirSync(uploadsDir, { recursive: true });

  const inputBuffer = Buffer.from(await file.arrayBuffer());
  const id = randomUUID();

  let image = sharp(inputBuffer).rotate(); // rotate() اصلاح خودکار orientation
  const metadata = await image.metadata();
  const width = metadata.width ?? 800;
  const height = metadata.height ?? 600;

  // برای سرعت، عکس ورودی را به یک عرض معقول محدود می‌کنیم
  const targetWidth = Math.min(width, 1200);
  image = image.resize({ width: targetWidth });
  const finalHeight = Math.round((height / width) * targetWidth);

  const overlaySvg = buildCurtainOverlaySvg(
    targetWidth,
    finalHeight,
    colorHex,
    Math.min(90, Math.max(0, openness))
  );

  const composited = await image
    .composite([{ input: Buffer.from(overlaySvg), top: 0, left: 0 }])
    .png()
    .toBuffer();

  const originalName = `${id}-original.jpg`;
  const resultName = `${id}-result.png`;

  fs.writeFileSync(path.join(uploadsDir, originalName), inputBuffer);
  fs.writeFileSync(path.join(uploadsDir, resultName), composited);

  db.prepare(
    `INSERT INTO visualization_requests (id, productSlug, colorHex, originalPath, resultPath, createdAt)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(id, productSlug, colorHex, `/uploads/${originalName}`, `/uploads/${resultName}`, new Date().toISOString());

  return NextResponse.json({
    id,
    originalUrl: `/uploads/${originalName}`,
    resultUrl: `/uploads/${resultName}`,
    mock: true,
    note: "این نتیجه با یک ترکیب‌بندی ساده (mock) تولید شده، نه یک مدل هوش مصنوعی واقعی.",
  });
}
