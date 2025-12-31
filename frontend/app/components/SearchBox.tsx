"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SearchBox({
  initialValue = "",
}: {
  initialValue?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [nickname, setNickname] = useState(initialValue);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
  if (loading) setLoading(false);
}, [pathname, searchParams, loading]);

  const onSearch = async () => {
  if (!nickname.trim() || loading) return;

  setLoading(true);

  sessionStorage.setItem("skipGlobalLoading", "1");

  router.push(`/search?nickname=${encodeURIComponent(nickname.trim())}`);
  
};

  return (
    <div className="flex gap-2 justify-center">
      <input
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        onKeyDown={(e) => {
  if (e.key === "Enter" && !loading) {
    onSearch();
  }
}}
        placeholder="닉네임 입력"
        disabled={loading}
        className="flex-1 px-4 py-2 rounded bg-[#1B2230] border border-gray-700 text-white text-sm disabled:opacity-50"
      />

      <button
  onClick={onSearch}
  disabled={loading}
  className={`px-4 py-2 w-24 rounded text-sm font-semibold transition
    ${loading
      ? "bg-gray-600 cursor-not-allowed text-gray-300"
      : "bg-[#34E27A] text-black hover:opacity-90"}
  `}
>
  {loading ? "검색 중…" : "검색"}
</button>
    </div>
  );
}