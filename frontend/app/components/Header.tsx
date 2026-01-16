"use client";

import Link from "next/link";
import ThemeToggle from "@/app/components/ThemeToggle";
import { signIn, signOut, useSession } from "next-auth/react";

export default function Header() {
  const { data: session, status } = useSession(); // ✅ 이거 추가

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: "var(--surface)",
        borderColor: "var(--border)",
        color: "var(--text-main)",
        backdropFilter: "blur(10px)",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* 로고 */}
        <Link
          href="/"
          className="md:text-2xl font-extrabold tracking-[0.03em] fc-logo-font"
          style={{ color: "var(--text-main)" }}
        >
          FO.GG
        </Link>

        {/* 네비게이션 */}
        <nav className="flex gap-8 text-sm">
          <Link
            href="/meta"
            className="font-medium text-[var(--text-main)] transition-colors duration-200 hover:text-[#34E27A]"
          >
            추천 메타
          </Link>

          <Link
            href="/tactics"
            className="font-medium text-[var(--text-main)] transition-colors duration-200 hover:text-[#34E27A]"
          >
            경기 전술
          </Link>

          <Link
            href="/service"
            className="font-medium text-[var(--text-main)] transition-colors duration-200 hover:text-[#34E27A]"
          >
            서비스 안내
          </Link>

          <Link
            href="/music"
            className="font-medium text-[var(--text-main)] transition-colors duration-200 hover:text-[#34E27A]"
          >
            음악
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          {status === "loading" ? null : session ? (
            <>
              <span className="text-sm opacity-80">
                {session.user?.name ?? "사용자"}
              </span>
              <button
                onClick={() => signOut()}
                className="text-sm font-medium hover:text-[#34E27A]"
              >
                로그아웃
              </button>
            </>
          ) : (
            <button
              onClick={() => signIn("google")}
              className="text-sm font-medium hover:text-[#34E27A]"
            >
              Google 로그인
            </button>
          )}
        </div>
      </div>

      <div className="h-[10px] bg-gradient-to-r from-[#34E27A] via-[#5CC4FF] to-[#4A6CFF]" />
    </header>
  );
}