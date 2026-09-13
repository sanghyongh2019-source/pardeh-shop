import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "پرده‌سرا | پرده تخصصی و سفارشی",
  description: "پرده تخصصی با سفارشی‌سازی زنده، پیش‌نمایش هوشمند و فروش اقساطی",
};

export const viewport: Viewport = {
  themeColor: "#14100C",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
