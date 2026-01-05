"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import SearchBox from "@/app/components/SearchBox";
import Link from "next/link";

export default function SearchPageClient() {
  const searchParams = useSearchParams();
  const nickname = (searchParams.get("nickname") ?? "").trim();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!nickname) {
      setData(null);
      return;
    }

    setLoading(true);

    fetch(`/api/search?nickname=${encodeURIComponent(nickname)}`, {
      cache: "no-store",
    })
      .then((res) => res.json())
      .then(setData)
      .catch(() => setData({ error: "upstream_error" }))
      .finally(() => setLoading(false));
  }, [nickname]);

  if (!nickname) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-white space-y-6">
        <SearchBox />
        <p className="text-gray-400">닉네임을 입력해 주세요.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-white space-y-6">
        <SearchBox initialValue={nickname} />
        <p className="text-gray-400">검색 중…</p>
      </div>
    );
  }

  if (!data || data.error) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-white space-y-6">
        <SearchBox initialValue={nickname} />
        <div className="bg-[#1B2230] border border-[#1C2230] rounded-xl p-4">
          <h1 className="font-bold text-lg">유저를 찾을 수 없습니다</h1>
          <p className="text-gray-400 mt-1">닉네임: {nickname}</p>

          <Link
            href={`/search?nickname=${encodeURIComponent(nickname)}`}
            className="inline-block mt-4 px-4 py-2 rounded bg-[#34E27A] text-black font-semibold hover:opacity-90"
          >
            다시 시도
          </Link>
        </div>
      </div>
    );
  }

  const matches = data.matches ?? [];

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6 text-white">
      <SearchBox initialValue={nickname} />

      <div className="bg-[#1B2230] rounded-xl p-6 border border-[#1C2230]">
        <h1 className="text-2xl font-extrabold">{nickname}</h1>
      </div>

      <div className="space-y-4">
        {matches.map((m: any) => (
          <Link
            key={m.matchId}
            href={`/match/${m.matchId}/${encodeURIComponent(nickname)}`}
            className="block bg-[#1B2230] border border-[#1C2230] rounded-xl p-4 hover:opacity-90"
          >
            {m.result} · {m.score} · vs {m.opponent}
          </Link>
        ))}
      </div>
    </div>
  );
}