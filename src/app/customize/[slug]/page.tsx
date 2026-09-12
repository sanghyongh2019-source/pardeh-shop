import { notFound } from "next/navigation";
import db from "@/lib/db";
import { Product } from "@/lib/types";
import Customizer from "@/components/Customizer";

async function getProduct(slug: string): Promise<Product | null> {
  const p = db.prepare("SELECT * FROM products WHERE slug = ?").get(slug) as any;
  if (!p) return null;
  const colors = db.prepare("SELECT id, name, hex FROM colors WHERE productId = ?").all(p.id);
  return { ...p, colors } as Product;
}

export default async function CustomizePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  return (
    <main className="max-w-6xl mx-auto px-7 py-14">
      <Customizer product={product} />
    </main>
  );
}
