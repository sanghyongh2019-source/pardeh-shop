import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const product = db.prepare("SELECT * FROM products WHERE slug = ?").get(slug) as any;

  if (!product) {
    return NextResponse.json({ error: "محصول پیدا نشد." }, { status: 404 });
  }

  const colors = db.prepare("SELECT id, name, hex FROM colors WHERE productId = ?").all(product.id);

  return NextResponse.json({ product: { ...product, colors } });
}
