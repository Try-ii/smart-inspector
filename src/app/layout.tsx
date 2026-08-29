import type { Metadata } from "next";
import "@fontsource/alexandria/400.css";
import "@fontsource/alexandria/500.css";
import "@fontsource/alexandria/700.css";
import "@fontsource/alexandria/800.css";
import "@fontsource/alexandria/900.css";
import "@fontsource/tajawal/400.css";
import "@fontsource/tajawal/500.css";
import "@fontsource/tajawal/700.css";
import "@fontsource/tajawal/800.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "المفتش الذكي | منصة التفتيش الرقابي الذكي - منطقة المدينة المنورة",
  description: "منصة رقابية ذكية لتوجيه الجولات التفتيشية الميدانية نحو المنشآت الأعلى خطورة لرفع كفاءة الامتثال وحماية الصحة العامة.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen flex flex-col md:flex-row relative selection:bg-gov-sand selection:text-gov-charcoal">
        <div className="gov-grid-pattern" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
