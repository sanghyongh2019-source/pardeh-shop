import { NextResponse } from "next/server";
import db from "@/lib/db";
import { Product } from "@/lib/types";

export async function GET() {
  const rows = db.prepare("SELECT * FROM products ORDER BY createdAt ASC").all() as any[];
  const colorStmt = db.prepare("SELECT id, name, hex FROM colors WHERE productId = ?");

  const products: Product[] = rows.map((p) => ({
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

  return NextResponse.json({ products });
}
