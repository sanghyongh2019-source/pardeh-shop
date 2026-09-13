"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Sparkles } from "lucide-react";

export default function Header() {
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/#catalog", label: "طرح‌ها" },
    { href: "/visualize", label: "پیش‌نمایش هوشمند" },
    { href: "/#installment", label: "فروش اقساطی" },
    { href: "/#faq", label: "سوالات متداول" },
  ];

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur border-b"
      style={{ background: "rgba(20,16,12,0.85)", borderColor: "var(--line-dark)" }}
    >
      <div className="container-x flex items-center justify-between py-4">
        <Link href="/" className="text-2xl font-black flex items-center gap-1.5" style={{ color: "var(--brass-deep)" }}>
          پرده<span style={{ color: "var(--burgundy)" }}>سرا</span>
          <Sparkles size={16} style={{ color: "var(--brass)" }} />
        </Link>

        <nav className="hidden md:flex gap-8 text-sm font-medium opacity-80">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="hover:opacity-100 transition-opacity">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:block">
          <Link
            href="/#catalog"
            className="btn-brass inline-block px-5 py-2.5 rounded-sm text-sm"
          >
            شروع سفارش
          </Link>
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="منو">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t" style={{ borderColor: "var(--line-dark)" }}>
          <div className="container-x py-4 flex flex-col gap-4 text-sm font-medium">
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
                {l.label}
              </a>
            ))}
            <Link
              href="/#catalog"
              onClick={() => setOpen(false)}
              className="btn-brass inline-block px-5 py-2.5 rounded-sm text-center"
            >
              شروع سفارش
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
