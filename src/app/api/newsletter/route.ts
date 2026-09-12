import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import db from "@/lib/db";
import { randomUUID } from "crypto";

const schema = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "ایمیل نامعتبر است." }, { status: 400 });
  }

  try {
    db.prepare(
      "INSERT INTO newsletter_subscribers (id, email, createdAt) VALUES (?, ?, ?)"
    ).run(randomUUID(), parsed.data.email, new Date().toISOString());
  } catch {
    // ایمیل تکراری - مشکلی نیست، همان‌طور با موفقیت پاسخ می‌دهیم
  }

  return NextResponse.json({ ok: true });
}
