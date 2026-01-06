"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import SearchBox from "@/app/components/SearchBox";
import { useLoading } from "@/app/providers/LoadingProvider";

type ApiResult =
  | {
      ouid: string;
      user: {
        nickname: string;
        highestDivision?: number;
        highestDivisionName?: string;
      };
      matches: Array<{
        matchId: string;
        result: "승" | "패" | "무";
        score: string;
        opponent: string;
        matchDate?: string;
        matchType?: string;
      }>;
    }
  | {
      error: string;
      status?: number;
      body?: string;
    };

function resultBarColor(result: "승" | "패" | "무") {
  switch (result) {
    case "승":
      return "bg-[#4A6CFF]"; // 🔵 승 → 파랑
    case "패":
      return "bg-red-400";
    case "무":
      return "bg-yellow-300";
  }
}

function getSummary(matches: any[]) {
  const recent = matches.slice(0, 20);
  let win = 0;
  recent.forEach((m) => {
    if (m.result === "승") win += 1;
  });

  const winRate = recent.length > 0 ? Math.round((win / recent.length) * 100) : 0;

  let streak = 0;
  let streakType: "승" | "패" | "무" | null = null;

  for (const m of recent) {
    if (!streakType) {
      streakType = m.result;
      streak = 1;
    } else if (m.result === streakType) {
      streak += 1;
    } else {
      break;
    }
  }

  return { winRate, streak, streakType };
}

function formatDate(dateString?: string) {
  if (!dateString) return "날짜 정보 없음";
  const d = new Date(dateString);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export default function SearchPageClient() {
  const sp = useSearchParams();

  const nickname = useMemo(() => {
    const raw = sp.get("nickname") ?? "";
    return raw.trim();
  }, [sp]);

  const [data, setData] = useState<ApiResult | null>(null);
  const PAGE_SIZE = 20;
const MAX_SHOW = 100;
const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

useEffect(() => {
  setVisibleCount(PAGE_SIZE);
}, [nickname]);

  const { setLoading } = useLoading();

  useEffect(() => {
    let ignore = false;

    async function run() {
      if (!nickname) {
        setData(null);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(
          `/api/search?nickname=${encodeURIComponent(nickname)}`,
          { cache: "no-store" }
        );
        const json = (await res.json().catch(() => null)) as ApiResult | null;

        if (ignore) return;

        if (!res.ok) {
          setData(
            json ?? { error: "upstream_error", status: res.status, body: "no body" }
          );
        } else {
          setData(json);
        }
      } catch (e: any) {
        if (!ignore) {
          setData({ error: "network_error", body: String(e?.message ?? e) });
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    run();
    return () => {
      ignore = true;
    };
  }, [nickname]);

  // ✅ 닉네임이 없을 때
  if (!nickname) {
    return (
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <SearchBox />
        <p className="text-gray-400">닉네임을 입력해 주세요.</p>
      </div>
    );
  }


  // ✅ 에러 처리
  if (!data || "error" in data) {
    return (
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <SearchBox initialValue={nickname} />

        <div
  className="border rounded-xl p-4"
  style={{ background: "var(--surface)", borderColor: "var(--border)" }}
>
          <h1 className="font-bold text-lg">오류가 발생했습니다</h1>

          <p className="text-gray-400 mt-1">
            닉네임: {nickname}
          </p>

          {"status" in (data ?? {}) && (
            <p className="text-gray-400 mt-1">status: {(data as any)?.status}</p>
          )}

          {"body" in (data ?? {}) && (data as any)?.body && (
            <pre className="text-xs whitespace-pre-wrap text-gray-400 mt-2">
              {(data as any).body}
            </pre>
          )}

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

  // ✅ 정상 렌더
  const matches = data.matches ?? [];
  
  const { winRate, streak, streakType } = getSummary(matches);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <SearchBox initialValue={nickname} />

      <div
  className="border rounded-xl p-6 space-y-4"
  style={{ background: "var(--surface)", borderColor: "var(--border)" }}
>
        <h1 className="text-2xl font-extrabold">{nickname}</h1>

        <div className="text-sm text-gray-300">
          승률 <span className="text-white font-semibold">{winRate}%</span>
          {streakType && (
            <>
              {" "}
              ·{" "}
              <span className="font-semibold">
                {streak}
                {streakType === "승"
                  ? "연승"
                  : streakType === "패"
                  ? "연패"
                  : "무"}
                중
              </span>
            </>
          )}
        </div>

        <div className="flex gap-1 relative">
  {matches.slice(0, 20).map((m, idx) => (
    <div key={idx} className="relative flex-1">
      {idx === 0 && (
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-xs text-white">
          ▲
        </div>
      )}
      <div className={`h-2 rounded ${resultBarColor(m.result)}`} />
    </div>
  ))}
</div>
        
      </div>

      <div className="space-y-6">
        {matches
  .slice(0, Math.min(visibleCount, MAX_SHOW))
  .map((m) => (
  <Link
    key={m.matchId}
    href={`/match/${m.matchId}/${encodeURIComponent(nickname)}`}
    className="block"
  >
            <div
              className={`
                relative
                rounded-2xl
                px-6
                py-5
                space-y-3
                transition-all
                duration-200
                hover:-translate-y-0.5
                hover:shadow-lg
                ${
                  m.result === "승"
  ? "bg-gradient-to-r from-[#2C7BC4] to-[#1B2F6A]"
  : m.result === "패"
  ? "bg-gradient-to-r from-[#7A1F2B] to-[#3A0F16]"
  : "bg-gradient-to-r from-[#8A7A2A] to-[#4A4318]"
                }
              `}
            >
              <div
                className={`
                  absolute left-0 top-0 h-full w-1.5 rounded-l-2xl
                  ${
                    m.result === "승"
                     ? "bg-[#4A6CFF]" // 🔵
                     : m.result === "패"
                     ? "bg-red-400"
                     : "bg-yellow-300"
                  }
                `}
              />

              <div className="text-xs text-gray-300">
                {formatDate(m.matchDate)} · 공식 경기
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-xl font-extrabold text-white w-10 text-center">
                    {m.result}
                  </div>
                  <div>
                    <div className="text-base font-semibold text-white">vs {m.opponent}</div>
                    <div className="text-sm text-gray-300">{m.score}</div>
                  </div>
                </div>

                <div className="text-sm text-gray-300">상세보기 →</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      {Math.min(visibleCount, MAX_SHOW) < Math.min(matches.length, MAX_SHOW) && (
  <div className="flex justify-center pt-2">
    <button
      type="button"
      onClick={() =>
        setVisibleCount((v) => Math.min(v + PAGE_SIZE, MAX_SHOW))
      }
      className="px-4 py-2 rounded-xl text-sm font-semibold
                 border transition hover:opacity-90"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      더보기 ({Math.min(visibleCount, MAX_SHOW)}/{Math.min(matches.length, MAX_SHOW)})
    </button>
  </div>
)}
    </div>
  );
}