"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLoading } from "@/app/providers/LoadingProvider";

export default function SearchBox({ initialValue = "" }: { initialValue?: string }) {
  const router = useRouter();
  const { setLoading } = useLoading();

  const [nickname, setNickname] = useState(initialValue);

  const onSearch = () => {
    const v = nickname.trim();
    if (!v) return;

    // ✅ 클릭 순간 즉시 전역 로딩 ON
    setLoading(true);

    // ✅ 바로 이동
    router.push(`/search?nickname=${encodeURIComponent(v)}`);
  };

  return (
    <div className="flex gap-2 justify-center">
      <input
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSearch();
        }}
        placeholder="닉네임 입력"
        className="flex-1 px-4 py-2 rounded bg-[#1B2230] border border-gray-700 text-white text-sm"
      />

      <button
        onClick={onSearch}
        className="px-4 py-2 w-24 rounded text-sm font-semibold transition bg-[#34E27A] text-black hover:opacity-90"
      >
        검색
      </button>
    </div>
  );
}