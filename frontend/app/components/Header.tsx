import Link from "next/link";
import ThemeToggle from "@/app/components/ThemeToggle";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0F1218] border-b border-[#161A23]">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* 로고 */}
        <Link
          href="/"
          className="md:text-3xl font-extrabold text-gray tracking-tight"
        >
          FO.GG
        </Link>

        {/* 네비게이션 */}
        <nav className="flex gap-8 text-sm text-gray-300">
          <Link
            href="/meta"
            className="hover:text-[#34E27A] transition font-light"
          >
            추천 메타
          </Link>
          <Link
            href="/tactics"
            className="hover:text-[#34E27A] transition font-light"
          >
            경기 전술
          </Link>
          <Link
  href="/service"
  className="text-sm text-gray-400 hover:text-white"
>
  서비스 안내
</Link>
        </nav>
        <ThemeToggle></ThemeToggle>
      </div>

      {/* FC ONLINE 스타일 포인트 라인 */}
      <div className="h-[10px] bg-[#34E27A]" />
    </header>
  );
}