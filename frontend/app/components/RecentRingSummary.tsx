"use client";

import { useEffect, useState } from "react";

type MatchItem = {
  result: "승" | "패" | "무";
  score: string; // "2 : 1"
};

function parseScore(score: string) {
  const m = score.match(/(\d+)\s*:\s*(\d+)/);
  if (!m) return { gf: 0, ga: 0 };
  return { gf: Number(m[1]), ga: Number(m[2]) };
}

export default function RecentRingSummary({
  title = "최근 경기",
  matches,
  take = 20,
}: {
  title?: string;
  matches: MatchItem[];
  take?: number;
}) {
  const recent = (matches ?? []).slice(0, take);

  const total = recent.length;
  const win = recent.filter((m) => m.result === "승").length;
  const draw = recent.filter((m) => m.result === "무").length;
  const lose = recent.filter((m) => m.result === "패").length;

  let gfSum = 0;
  let gaSum = 0;
  for (const m of recent) {
    const { gf, ga } = parseScore(m.score);
    gfSum += gf;
    gaSum += ga;
  }

  const winRate = total > 0 ? Math.round((win / total) * 100) : 0;
  const gfAvg = total > 0 ? gfSum / total : 0;
  const gaAvg = total > 0 ? gaSum / total : 0;

  // ✅ 숫자(%) 애니메이션
  const [animatedWinRate, setAnimatedWinRate] = useState(0);
  useEffect(() => {
    const duration = 900;
    const start = performance.now();
    const from = 0;
    const to = winRate;

    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setAnimatedWinRate(Math.round(from + (to - from) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [winRate]);

  // ✅ 도넛 채움 진행률(0~1) 애니메이션
  const [p, setP] = useState(0);
  useEffect(() => {
    const duration = 900;
    const start = performance.now();

    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setP(eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    setP(0);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [win, draw, lose, take]);

  // 각도 계산
  const winDeg = total > 0 ? (win / total) * 360 : 0;
  const drawDeg = total > 0 ? (draw / total) * 360 : 0;

  // p에 따라 각도를 0→최종각으로 스케일
  const winDegP = winDeg * p;
  const drawDegP = drawDeg * p;

  const ringBg = `conic-gradient(
    #4A6CFF 0deg ${winDegP}deg,
    #F2C94C ${winDegP}deg ${winDegP + drawDegP}deg,
    #E25555 ${winDegP + drawDegP}deg ${360 * p}deg,
    rgba(0,0,0,0) ${360 * p}deg 360deg
  )`;

  return (
    <div
      className="border rounded-xl p-5"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="text-lg font-extrabold" style={{ color: "var(--text-main)" }}>
          {title}
        </div>
        <div className="text-sm" style={{ color: "var(--text-sub)" }}>
          {total}경기 {win}승 {draw}무 {lose}패
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* ✅ 도넛 */}
        <div className="relative h-24 w-24 ring-animate">
          <div
            className="absolute inset-0 rounded-full ring-fill"
            style={{
              background: ringBg,
              WebkitMask: "radial-gradient(farthest-side, transparent 72%, #000 73%)",
              mask: "radial-gradient(farthest-side, transparent 72%, #000 73%)",
            }}
          />

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center leading-none">
              <div className="text-xl font-extrabold" style={{ color: "var(--text-main)" }}>
                {animatedWinRate}%
              </div>
              <div className="text-xs" style={{ color: "var(--text-sub)" }}>
                승률
              </div>
            </div>
          </div>
        </div>

        {/* 오른쪽 요약 */}
        <div className="flex-1">
          <div className="text-sm mb-2" style={{ color: "var(--text-sub)" }}>
            최근 {take}경기 평균
          </div>

          <div className="flex items-end gap-3">
            <div className="text-3xl font-extrabold" style={{ color: "var(--text-main)" }}>
              {gfAvg.toFixed(1)}
            </div>
            <div className="text-2xl font-bold" style={{ color: "var(--text-sub)" }}>
              /
            </div>
            <div className="text-3xl font-extrabold" style={{ color: "var(--text-main)" }}>
              {gaAvg.toFixed(1)}
            </div>
          </div>

          <div className="mt-1 text-sm" style={{ color: "var(--text-sub)" }}>
            득점 / 실점
          </div>
        </div>
      </div>

      {/* 범례 */}
      <div className="mt-4 flex gap-4 text-xs" style={{ color: "var(--text-sub)" }}>
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: "#4A6CFF" }} />
          승
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: "#F2C94C" }} />
          무
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: "#E25555" }} />
          패
        </span>
      </div>
    </div>
  );
}