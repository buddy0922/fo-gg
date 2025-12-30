import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/app/components/Header";
import { LoadingProvider } from "@/app/providers/LoadingProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FO.GG - FC온라인 전적 검색",
  description: "FC온라인 전적, 경기 분석, 메타 정보",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0B0F19] text-white`}
      >
        <LoadingProvider>
          <Header />

          <main className="pt-16 min-h-screen">
            {children}
          </main>
        </LoadingProvider>
      </body>
    </html>
  );
}