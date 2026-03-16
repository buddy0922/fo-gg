"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import SearchBox from "@/app/components/SearchBox";
import { useLoading } from "@/app/providers/LoadingProvider";
import RecentRingSummary from "@/app/components/RecentRingSummary";
import Image from "next/image";
import { TIER_IMAGE } from "@/app/lib/tier"; // 경로는 네 파일 위치에 맞게
import PlayStyleCard from "@/app/components/PlayStyleCard";
import { detectPlayStyle } from "@/app/lib/playstyle";




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

const POSITION_LABEL: Record<number, string> = {
  0: "GK",
  1: "SW",
  2: "RWB",
  3: "RB",
  4: "RCB",
  5: "CB",
  6: "LCB",
  7: "LB",
  8: "LWB",
  9: "RDM",
  10: "CDM",
  11: "LDM",
  12: "RM",
  13: "RCM",
  14: "CM",
  15: "LCM",
  16: "LM",
  17: "RAM",
  18: "CAM",
  19: "LAM",
  20: "RF",
  21: "CF",
  22: "LF",
  23: "RW",
  24: "RS",
  25: "ST",
  26: "LS",
  27: "LW",
  28: "SUB",
};

export default function SearchPageClient() {
  const sp = useSearchParams();

  const { nickname, ouid } = useMemo(() => {
  const rawNickname = sp.get("nickname") ?? "";
  const rawOuid = sp.get("ouid") ?? "";

  return {
    nickname: rawNickname.trim(),
    ouid: rawOuid.trim(),
  };
}, [sp]);

  const router = useRouter();

  const PAGE_SIZE = 10;

const [user, setUser] = useState<null | {
  nickname: string;
  level?: number;
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
    if (!nickname && !ouid) {
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

if (ouid) {
  qs.set("ouid", ouid);
} else {
  qs.set("nickname", nickname);
}

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
      console.log("matches sample", json.matches?.[0]);
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
  if ((!nickname && !ouid) || !hasMore) return;

  setLoading(true);
  try {
    const qs = new URLSearchParams();

if (ouid) {
  qs.set("ouid", ouid);
} else {
  qs.set("nickname", nickname);
}
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
  if (!nickname && !ouid) {
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

          {error?.status !== undefined && (
  <p className="text-gray-400 mt-1">status: {error.status}</p>
)}

{error?.body && (
  <pre className="text-xs whitespace-pre-wrap text-gray-400 mt-2">
    {error.body}
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
  const styleStats = matches.slice(0, 20).reduce(
  (acc, m) => {
    const s = m.playStyle;
    if (!s) return acc;

    acc.shootTotal += s.shootTotal ?? 0;
    acc.effectiveShootTotal += s.effectiveShootTotal ?? 0;
    acc.goalTotal += s.goalTotal ?? 0;
    acc.shootInPenalty += s.shootInPenalty ?? 0;
    acc.shootOutPenalty += s.shootOutPenalty ?? 0;

    acc.goalInPenalty += s.goalInPenalty ?? 0;
acc.goalOutPenalty += s.goalOutPenalty ?? 0;
acc.goalHeading += s.goalHeading ?? 0;
acc.goalFreekick += s.goalFreekick ?? 0;

    acc.passTry += s.passTry ?? 0;
    acc.passSuccess += s.passSuccess ?? 0;
    acc.shortPassTry += s.shortPassTry ?? 0;
    acc.shortPassSuccess += s.shortPassSuccess ?? 0;
    acc.longPassTry += s.longPassTry ?? 0;
    acc.longPassSuccess += s.longPassSuccess ?? 0;
    acc.throughPassTry += s.throughPassTry ?? 0;
    acc.throughPassSuccess += s.throughPassSuccess ?? 0;

    acc.tackleTry += s.tackleTry ?? 0;
    acc.tackleSuccess += s.tackleSuccess ?? 0;

    acc.blockTry += s.blockTry ?? 0;
acc.blockSuccess += s.blockSuccess ?? 0;

acc.possession += s.possession ?? 0;
acc.dribble += s.dribble ?? 0;
acc.cornerKick += s.cornerKick ?? 0;
acc.offsideCount += s.offsideCount ?? 0;

    return acc;
  },
  {
    shootTotal: 0,
    effectiveShootTotal: 0,
    goalTotal: 0,
    shootInPenalty: 0,
    shootOutPenalty: 0,

    goalInPenalty: 0,
goalOutPenalty: 0,
goalHeading: 0,
goalFreekick: 0,

    passTry: 0,
    passSuccess: 0,
    shortPassTry: 0,
    shortPassSuccess: 0,
    longPassTry: 0,
    longPassSuccess: 0,
    throughPassTry: 0,
    throughPassSuccess: 0,

    tackleTry: 0,
    tackleSuccess: 0,

    blockTry: 0,
blockSuccess: 0,

possession: 0,
dribble: 0,
cornerKick: 0,
offsideCount: 0,
  }
);

const playStyle =
  matches.length > 0
    ? detectPlayStyle(styleStats)
    : {
        key: "none",
        title: "분석 중",
        description: "최근 경기 데이터를 분석하고 있습니다.",
        subDescription: "조금만 기다리면 플레이 스타일이 계산됩니다.",
      };

const positionRatings = matches.slice(0, 20).reduce((acc, m) => {
  const players = Array.isArray(m.players) ? m.players : [];

  for (const p of players) {
    const pos = p.spPosition;
    const rating = Number(p.spRating ?? 0);
    const name = String(p.name ?? p.spName ?? "").trim();

    if (!pos || !rating) continue;

    if (!acc[pos]) {
      acc[pos] = {
        sum: 0,
        count: 0,
        names: {} as Record<string, number>,
      };
    }

    acc[pos].sum += rating;
    acc[pos].count += 1;

    if (name) {
      acc[pos].names[name] = (acc[pos].names[name] ?? 0) + 1;
    }
  }

  return acc;
}, {} as Record<number, { sum: number; count: number; names: Record<string, number> }>);

const weakPositions = (
  Object.entries(positionRatings) as [
    string,
    { sum: number; count: number; names: Record<string, number> }
  ][]
)
  .map(([pos, v]) => {
    const topPlayer =
      Object.entries(v.names).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";

    return {
      spPosition: Number(pos),
      avgRating: v.count > 0 ? v.sum / v.count : 0,
      topPlayer,
    };
  })
  .sort((a, b) => a.avgRating - b.avgRating)
  .slice(0, 3);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <SearchBox initialValue={nickname} />
      
<div
  className="border rounded-xl p-6 space-y-4"
  style={{ background: "var(--surface)", borderColor: "var(--border)" }}
>
        <div className="flex items-start justify-between">
          <div>
  <h1 className="flex items-center gap-2 text-2xl font-extrabold">
        
  <span>{nickname}</span>

  {user?.highestDivision !== undefined && TIER_IMAGE[user.highestDivision] && (
    <Image
      src={TIER_IMAGE[user.highestDivision]}
      alt={user.highestDivisionName ?? "tier"}
      width={24}
      height={24}
      className="shrink-0"
      priority
    />
  )}

  {user?.level !== undefined && <span>Lv.{user.level}</span>}
</h1>
</div>
<button
  onClick={() => {
    const url = `${window.location.origin}/search?nickname=${encodeURIComponent(nickname)}`;
    navigator.clipboard.writeText(url);
    alert("전적 링크가 복사되었습니다.");
  }}
  className="text-xs px-3 py-1 rounded border hover:opacity-80"
  style={{ borderColor: "var(--border)" }}
>
  공유
</button>
</div>

        <div className="text-sm">
          승률 <span className="font-semibold">{winRate}%</span>
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
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-xs">
          ▲
        </div>
      )}
      <div className={`h-2 rounded ${resultBarColor(m.result)}`} />
    </div>
  ))}
</div>
        
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {/* 왼쪽: 최근 경기 (절반) */}
  <RecentRingSummary
    key={`ring:${nickname}`}
    title="최근 경기"
    matches={matches}
    take={20}
  />
  


  {/* 오른쪽: 그냥 빈 공간 */}
  <div />
</div>

<PlayStyleCard
  playStyle={playStyle}
  stats={styleStats}
/>

<div
  className="border rounded-xl p-5"
  style={{ background: "var(--surface)", borderColor: "var(--border)" }}
>
  <div
    className="text-lg font-extrabold mb-2"
    style={{ color: "var(--text-main)" }}
  >
    보완이 필요한 포지션
  </div>

  <div className="space-y-2">
    {weakPositions.map((p, idx) => (
      <div
        key={p.spPosition}
        className="flex items-center justify-between rounded-lg px-3 py-2"
        style={{ background: "var(--surface-strong)" }}
      >
        <div>
  <div style={{ color: "var(--text-main)" }}>
    {idx + 1}. {POSITION_LABEL[p.spPosition] ?? `포지션 ${p.spPosition}`}
  </div>

  {p.topPlayer && (
    <div className="text-xs mt-1" style={{ color: "var(--text-sub)" }}>
      자주 기용한 선수: {p.topPlayer}
    </div>
  )}

  <div className="text-xs mt-1" style={{ color: "var(--text-sub)" }}>
    {p.avgRating < 4
      ? "최근 경기에서 가장 흔들린 자리입니다."
      : p.avgRating < 4.3
      ? "조금 더 보완하면 팀 밸런스가 좋아질 수 있습니다."
      : "상대적으로 덜 강한 포지션입니다."}
  </div>
</div>
        <div style={{ color: "var(--text-sub)" }}>
          평균 평점 {p.avgRating.toFixed(2)}
        </div>
      </div>
    ))}
  </div>
</div>



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
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
        }}
        className={[
          "px-3 py-1.5 rounded-full text-sm border whitespace-nowrap transition",
          active
            ? "text-[var(--text-main)] font-semibold"
            : "text-[var(--text-sub)] hover:text-[var(--text-main)]",
        ].join(" ")}
      >
        {t.label}
      </button>
    );
  })}
</div>

      <div className="space-y-6">
        {matches.map((m) => (
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