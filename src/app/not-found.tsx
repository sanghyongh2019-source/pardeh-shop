import Link from "next/link";
import { SearchX } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <main>
      <Header />
      <div className="container-x py-28 text-center">
        <SearchX size={40} className="mx-auto mb-6" style={{ color: "var(--brass)" }} />
        <h1 className="text-3xl font-black mb-3">این صفحه پیدا نشد</h1>
        <p className="text-sm mb-10" style={{ color: "var(--muted)" }}>
          ممکن است لینک اشتباه باشد یا این طرح/سفارش دیگر موجود نباشد.
        </p>
        <Link href="/#catalog" className="btn-brass inline-block px-7 py-3.5 rounded-sm">
          بازگشت به کاتالوگ
        </Link>
      </div>
      <Footer />
    </main>
  );
}
