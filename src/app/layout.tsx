import type { Metadata } from "next";
import { Noto_Serif_SC } from "next/font/google";
import "./globals.css";

const notoSerif = Noto_Serif_SC({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif-sc",
});

export const metadata: Metadata = {
  title: "生辰起名 · 八字取名",
  description: "根据公历生辰排四柱八字，分析五行喜用神，智能推荐中文名字。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${notoSerif.variable} h-full`}>
      <body className="min-h-full font-serif antialiased text-stone-900">
        {children}
      </body>
    </html>
  );
}
