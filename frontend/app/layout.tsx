import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";

const vazirmatn = Vazirmatn({
  subsets: ["arabic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SoloPortal Lite | پرتال رزرو و پرداخت فریلنسرها",
  description: "سامانه یکپارچه رزرو وقت و تسویه مالی متخصصان مستقل",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body className={`${vazirmatn.className} bg-slate-50 text-slate-900 antialiased`}>
        {children}
      </body>
    </html>
  );
}