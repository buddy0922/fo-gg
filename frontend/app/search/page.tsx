"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import SearchBox from "@/app/components/SearchBox";
import Link from "next/link";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const nickname = searchParams.get("nickname")?.trim() ?? "";

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!nickname) return;

    setLoading(true);

    fetch(`/api/search?nickname=${encodeURIComponent(nickname)}`)
      .then((res) => res.json())
      .then(setData)
      .catch(() => setData({ error: "upstream_error" }))
      .finally(() => setLoading(false));
  }, [nickname]);

  /* ===== 닉네임 없음 ===== */
  if (!nickname) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-white space-y-6">
        <SearchBox />
        <p className="text-gray-400">닉네임을 입력해 주세요.</p>
      </div>
    );
  }

  /* ===== 로딩 ===== */
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-white">
        검색 중…
      </div>
    );
  }

  /* ===== 에러 ===== */
  if (!data || data.error) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-white space-y-6">
        <SearchBox initialValue={nickname} />
        <div className="bg-[#1B2230] p-4 rounded">
          유저를 찾을 수 없습니다
        </div>
      </div>
    );
  }

  /* ===== 정상 ===== */
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6 text-white">
      <SearchBox initialValue={nickname} />

      <div className="bg-[#1B2230] p-6 rounded">
        <h1 className="text-2xl font-bold">{nickname}</h1>
      </div>

      <div className="space-y-4">
        {data.matches.map((m: any) => (
          <Link
            key={m.matchId}
            href={`/match/${m.matchId}/${encodeURIComponent(nickname)}`}
            className="block bg-[#1B2230] p-4 rounded"
          >
            {m.result} · {m.score} · vs {m.opponent}
          </Link>
        ))}
      </div>
    </div>
  );
}