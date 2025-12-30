import Link from "next/link";

export default function NavBar() {
  return (
    <div className="bg-[#32D74B]">
      <div className="max-w-7xl mx-auto px-6 h-10 flex items-center gap-6">
        <Link
          href="/meta"
          className="text-black text-sm font-medium hover:underline"
        >
          추천 메타
        </Link>
        <Link
          href="/tactics"
          className="text-black text-sm font-medium hover:underline"
        >
          경기 전술
        </Link>
      </div>
    </div>
  );
}