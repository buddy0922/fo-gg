"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import SearchBox from "@/app/components/SearchBox";
import { useLoading } from "@/app/providers/LoadingProvider";
import RecentRingSummary from "@/app/components/RecentRingSummary";


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
        matchTypeId?: number;
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

  const router = useRouter();

  const PAGE_SIZE = 20;

const [user, setUser] = useState<null | {
  nickname: string;
  highestDivision?: number;
  highestDivisionName?: string;
}>(null);

const [matches, setMatches] = useState<any[]>([]);
const [nextOffset, setNextOffset] = useState(0);
const [hasMore, setHasMore] = useState(false);

const [error, setError] = useState<null | { error: string; status?: number; body?: string }>(null);

const type = useMemo(() => {
  const raw = sp.get("type"); // 화면 URL용
  if (!raw) return null;      // 전체
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}, [sp]);

  const [data, setData] = useState<ApiResult | null>(null);
const MAX_SHOW = 100;
const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

useEffect(() => {
  setUser(null);
  setMatches([]);
  setNextOffset(0);
  setHasMore(false);
  setError(null);
}, [nickname, type]);

  const { setLoading } = useLoading();

  useEffect(() => {
  let ignore = false;

  async function loadFirstPage() {
    if (!nickname) {
      setUser(null);
      setMatches([]);
      setNextOffset(0);
      setHasMore(false);
      setError(null);
      return;
    }

    setLoading(true);
    try {
      const qs = new URLSearchParams();
      qs.set("nickname", nickname);

      // ✅ 전체 탭이면 type을 안 넣고, 특정 탭이면 matchtype으로
      if (type !== null) qs.set("matchtype", String(type));

      // ✅ 페이지네이션 파라미터 (서버도 이걸 받도록 바꿔야 함)
      qs.set("offset", "0");
      qs.set("limit", String(PAGE_SIZE));

      const res = await fetch(`/api/search?${qs.toString()}`, { cache: "no-store" });
      const json = await res.json().catch(() => null);

      if (ignore) return;

      if (!res.ok || !json || json.error) {
        setError(json ?? { error: "upstream_error", status: res.status, body: "no body" });
        setUser(null);
        setMatches([]);
        setHasMore(false);
        setNextOffset(0);
        return;
      }

      // ✅ 서버 응답에서 user/matches/nextOffset/hasMore 받는다고 가정
      setUser(json.user ?? null);
      setMatches(json.matches ?? []);
      setNextOffset(json.nextOffset ?? PAGE_SIZE);
      setHasMore(Boolean(json.hasMore));
      setError(null);
    } catch (e: any) {
      if (!ignore) {
        setError({ error: "network_error", body: String(e?.message ?? e) });
      }
    } finally {
      if (!ignore) setLoading(false);
    }
  }

  loadFirstPage();
  return () => {
    ignore = true;
  };
}, [nickname, type, setLoading]);

async function loadMore() {
  if (!nickname || !hasMore) return;

  setLoading(true);
  try {
    const qs = new URLSearchParams();
    qs.set("nickname", nickname);
    if (type !== null) qs.set("matchtype", String(type));

    qs.set("offset", String(nextOffset));
    qs.set("limit", String(PAGE_SIZE));

    const res = await fetch(`/api/search?${qs.toString()}`, { cache: "no-store" });
    const json = await res.json().catch(() => null);

    if (!res.ok || !json || json.error) {
      setError(json ?? { error: "upstream_error", status: res.status, body: "no body" });
      return;
    }

    setMatches((prev) => [...prev, ...(json.matches ?? [])]);
    setNextOffset(json.nextOffset ?? nextOffset + PAGE_SIZE);
    setHasMore(Boolean(json.hasMore));
  } finally {
    setLoading(false);
  }
}

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
  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <SearchBox initialValue={nickname} />
        <div className="flex gap-2 overflow-x-auto">
  {[
    { label: "전체", type: null },
    { label: "공식경기", type: 50 },
    { label: "커스텀매치", type: 40 },
    { label: "감독모드", type: 52 },
    { label: "친선경기", type: 60 },
  ].map((t) => {
    const active = (t.type ?? null) === (type ?? null);

    return (
      <button
        key={t.label}
        type="button"
        onClick={() => {
          const qs = new URLSearchParams();
          qs.set("nickname", nickname);
          if (t.type !== null) qs.set("type", String(t.type)); // ✅ URL은 type
          router.push(`/search?${qs.toString()}`);
        }}
        className={[
          "px-3 py-1.5 rounded-full text-sm border whitespace-nowrap",
          active ? "bg-white text-black border-white" : "bg-transparent text-gray-300 border-white/20",
        ].join(" ")}
      >
        {t.label}
      </button>
    );
  })}
</div>
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

  const typeLabel =
  type === null ? "전체" :
  type === 50 ? "공식경기" :
  type === 40 ? "커스텀매치" :
  type === 52 ? "감독모드" :
  type === 60 ? "친선경기" : `타입 ${type}`;

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
      <RecentRingSummary
  key={`ring:${nickname}`}   // ✅ 이게 핵심
  title="최근 경기"
  matches={matches}
  take={20}
/>

<div className="flex gap-2 overflow-x-auto">
  {[
    { label: "전체", type: null },
    { label: "공식경기", type: 50 },
    { label: "커스텀매치", type: 40 },
    { label: "감독모드", type: 52 },
    { label: "친선경기", type: 60 },
  ].map((t) => {
    const active = (t.type ?? null) === (type ?? null);

    return (
      <button
        key={t.label}
        type="button"
        onClick={() => {
          const qs = new URLSearchParams();
          qs.set("nickname", nickname);
          if (t.type !== null) qs.set("type", String(t.type));
          router.push(`/search?${qs.toString()}`);
        }}
        className={[
          "px-3 py-1.5 rounded-full text-sm border whitespace-nowrap",
          active
            ? "bg-white text-black border-white"
            : "bg-transparent text-gray-300 border-white/20",
        ].join(" ")}
      >
        {t.label}
      </button>
    );
  })}
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
  ? "bg-gradient-to-r from-[#2C7BC4] to-[#4A6CFF]"
  : m.result === "패"
  ? "bg-gradient-to-r from-[#E25555] to-[#e2444f]"
  : "bg-gradient-to-r from-[#dbb411ff] to-[#dbb411ff]"
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
  {formatDate(m.matchDate)} · {type === null ? (m.matchType ?? "알 수 없음") : typeLabel}
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
      {hasMore && (
  <div className="flex justify-center pt-2">
    <button
      type="button"
      onClick={loadMore}
      className="px-4 py-2 rounded-xl text-sm font-semibold border transition hover:opacity-90"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      더보기
    </button>
  </div>
)}
    </div>
  );
}