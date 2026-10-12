import type { Metadata } from "next";
import { Noto_Kufi_Arabic } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const notoArabic = Noto_Kufi_Arabic({
  variable: "--font-noto-arabic",
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "نظام حساب التكاليف المعمارية",
  description: "نظام متكامل لحساب تكاليف المنشآت المعمارية وجداول الكميات BOQ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${notoArabic.variable} h-full`}>
      <body className="min-h-full flex">
        <Sidebar />
        <main className="flex-1 mr-64 p-6 overflow-auto">{children}</main>
      </body>
    </html>
  );
}
