import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { fcLogoFont } from "./fonts/fcLogoFont";
import Header from "@/app/components/Header";
import ClientLoading from "@/app/ClientLoading";
import  LoadingProvider  from "@/app/providers/LoadingProvider";
import ThemeProvider from "./providers/ThemeProvider";
import AuthProvider from "./providers/AuthProvider";
import GlobalYouTubePlayer from "@/app/components/GlobalYouTubePlayer";
import FcNicknameGate from "@/app/components/FcNicknameGate";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "피파 전적 검색은 FCON.KR",
  description: "FC온라인 전적, 경기 분석, 메타 정보",
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={fcLogoFont.variable}>
      <head>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4421775826205410"
     crossOrigin="anonymous"></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0B0F19] text-white`}
      >
        <AuthProvider>
        <ThemeProvider>
          <LoadingProvider>
            <Header />
            <FcNicknameGate />

            {/* 🔥 useSearchParams 사용 → Suspense 필수 */}
            <Suspense fallback={null}>
              <ClientLoading />
            </Suspense>

            {/* 메인 컨텐츠 */}
            <main className="relative pt-16 min-h-screen">
  {children}
  <GlobalYouTubePlayer />
</main>
          </LoadingProvider>
        </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}