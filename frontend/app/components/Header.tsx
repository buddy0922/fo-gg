"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ThemeToggle from "@/app/components/ThemeToggle";
import { signIn, signOut, useSession } from "next-auth/react";

export default function Header() {
  const { data: session, status } = useSession(); // ✅ 이거 추가
  const [fcNickname, setFcNickname] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
  if (!session) {
    setFcNickname(null);
    return;
  }

  (async () => {
    const res = await fetch("/api/me", { cache: "no-store" });
    const json = await res.json().catch(() => null);
    setFcNickname(json?.user?.fcNickname ?? null);
  })();
}, [session]);

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
          FCON.kr
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
            <div className="relative">
  <button
    type="button"
    onClick={() => setMenuOpen((prev) => !prev)}
    className="text-sm font-bold hover:text-[#34E27A]"
  >
    {fcNickname ?? session.user?.name ?? "사용자"} ▼
  </button>

  {menuOpen ? (
    <div
      className="absolute right-0 mt-2 w-44 rounded-xl border p-2 shadow-lg"
      style={{
        background: "var(--surface)",
        borderColor: "var(--border)",
      }}
    >
      <button
        type="button"
        onClick={async () => {
          setMenuOpen(false);

          const res = await fetch("/api/me", { cache: "no-store" });
const json = await res.json().catch(() => null);
const ouid = json?.user?.ouid;

if (!ouid) {
  alert("구단주 등록을 먼저 해주세요.");
  window.dispatchEvent(new Event("open-fc-nickname-gate"));
  return;
}

window.location.href = `/search?ouid=${encodeURIComponent(ouid)}`;
        }}
        className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-white/5"
      >
        내 구단
      </button>

      <button
        type="button"
        onClick={() => {
          setMenuOpen(false);
          window.dispatchEvent(new Event("open-fc-nickname-gate"));
        }}
        className="mt-1 block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-white/5"
      >
        구단주 변경
      </button>

      <button
        type="button"
        onClick={() => {
          setMenuOpen(false);
          signOut();
        }}
        className="mt-1 block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-white/5"
      >
        로그아웃
      </button>
    </div>
  ) : null}
</div>
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