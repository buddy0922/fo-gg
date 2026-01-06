import Link from "next/link";
import ThemeToggle from "@/app/components/ThemeToggle";

export default function Header() {
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
          className="md:text-3xl font-extrabold tracking-tight logo-font"
          style={{ color: "var(--text-main)" }}
        >
          FO.GG
        </Link>

        {/* 네비게이션 */}
        <nav className="flex gap-8 text-sm">
          <Link href="/meta" className="transition font-light hover:text-[#34E27A]" style={{ color: "var(--text-sub)" }}>
            추천 메타
          </Link>
          <Link href="/tactics" className="transition font-light hover:text-[#34E27A]" style={{ color: "var(--text-sub)" }}>
            경기 전술
          </Link>
          <Link href="/service" className="transition font-light hover:text-[#34E27A]" style={{ color: "var(--text-sub)" }}>
            서비스 안내
          </Link>
        </nav>

        <ThemeToggle />
      </div>

      <div className="h-[10px] bg-gradient-to-r from-[#34E27A] via-[#5CC4FF] to-[#4A6CFF]" />
    </header>
  );
}