"use client";

import { useEffect, useMemo, useState } from "react";
import { getPlayerDisplay } from "@/app/lib/players";
import { explainShotLine } from "@/app/lib/shotExplain";

/* ===============================
   좌표 정규화
================================ */
function norm01(v: any) {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0.5;
  if (n > 1.01) return Math.max(0, Math.min(1, n / 100));
  return Math.max(0, Math.min(1, n));
}

/* ===============================
   실제 경기장 규격 (m)
================================ */
const FIELD_LENGTH = 105;
const FIELD_WIDTH = 68;

/* ===============================
   (핵심) 전적검색 유저를 항상 "오른쪽 공격"으로 보이게 하는 변환
================================ */
function shotToMeter(
  shot: any,
  team: "home" | "away",
  searchSide: "home" | "away"
) {
  const rawX = norm01(shot.x);

  // 전적검색 유저는 오른쪽 공격(그대로), 상대는 좌우 반전
  const xNorm = team === searchSide ? rawX : 1 - rawX;

  return {
    x: xNorm * FIELD_LENGTH,
    y: norm01(shot.y) * FIELD_WIDTH,
  };
}

/* ===============================
   미터 좌표 -> % (가로 필드 기준)
================================ */
function meterToPct(pos: { x: number; y: number }) {
  return {
    leftPct: (pos.x / FIELD_LENGTH) * 100,
    topPct: (pos.y / FIELD_WIDTH) * 100,
  };
}

/* ===============================
   골대까지 거리 (가로 기준)
================================ */
function distanceToAttackingGoalM(
  pos: { x: number; y: number },
  team: "home" | "away",
  searchSide: "home" | "away"
) {
  const goalX = team === searchSide ? FIELD_LENGTH : 0;
  const goalY = FIELD_WIDTH / 2;
  const dx = goalX - pos.x;
  const dy = goalY - pos.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/* ===============================
   분대 라벨
================================ */
function minuteGroup(min: number) {
  if (min <= 15) return "1~15";
  if (min <= 30) return "16~30";
  if (min <= 45) return "31~45";
  if (min <= 60) return "46~60";
  if (min <= 75) return "61~75";
  if (min <= 90) return "76~90";
  if (min <= 105) return "연장 전반 91~105";
  return "연장 후반 106~120";
}

/* ===============================
   가상 분 생성
================================ */
function buildVirtualMinutes(shots: any[]) {
  const sorted = shots
    .filter((s) => typeof s.goalTime === "number")
    .sort((a, b) => a.goalTime - b.goalTime);

  const map = new Map<any, number>();
  const total = sorted.length;

  sorted.forEach((s, idx) => {
    const minute = total <= 1 ? 1 : Math.round((idx / (total - 1)) * 119) + 1;
    map.set(s, minute);
  });

  return map;
}

/* ===============================
   골 판정 (스코어 기준 보정)
================================ */
function pickGoalsByScore(teamShots: any[], goalCount: number) {
  if (!goalCount) return new Set<number>();

  const shots = teamShots.map((s) => ({
    r: Number(s?.result),
    t: typeof s?.goalTime === "number" ? s.goalTime : Infinity,
  }));

  const codes = [1, 2, 3, 0];
  let best: number[] = [];

  for (const c of codes) {
    const idxs = shots
      .map((x, i) => ({ i, r: x.r, t: x.t }))
      .filter((x) => x.r === c)
      .sort((a, b) => a.t - b.t)
      .map((x) => x.i);

    if (idxs.length >= goalCount) {
      best = idxs.slice(0, goalCount);
      break;
    }
  }

  return new Set<number>(best);
}

/* ===============================
   모멘텀 가중치
================================ */
function inBox(x: number) {
  return x < 0.17 || x > 0.83;
}

function shotWeight(shot: any, isGoal: boolean) {
  let w = 1;
  if (inBox(norm01(shot.x))) w += 0.5;
  if (isGoal) w += 4;
  return w;
}

type EventItem = {
  key: string;
  team: "home" | "away";
  minute: number;
  label: string;
  isGoal: boolean;
  shot: any;
};

type ShotFilter = "all" | "goal" | "shot";

export default function ShotHeatmap({
  home,
  away,
  searchSide,
}: {
  home: any;
  away: any;
  searchSide: "home" | "away";
}) {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [filter, setFilter] = useState<ShotFilter>("all");

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedKey(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const normalGroups = ["1~15", "16~30", "31~45", "46~60", "61~75", "76~90"];

  const allShots = useMemo(
    () => [...(home?.shootDetail ?? []), ...(away?.shootDetail ?? [])],
    [home, away]
  );

  const minuteMap = useMemo(() => buildVirtualMinutes(allShots), [allShots]);

  const homeGoalIdx = useMemo(
    () =>
      pickGoalsByScore(
        home?.shootDetail ?? [],
        Number(home?.shoot?.goalTotalDisplay ?? 0)
      ),
    [home]
  );

  const awayGoalIdx = useMemo(
    () =>
      pickGoalsByScore(
        away?.shootDetail ?? [],
        Number(away?.shoot?.goalTotalDisplay ?? 0)
      ),
    [away]
  );

  const events: EventItem[] = useMemo(() => {
    const make = (team: "home" | "away", arr: any[], goalSet: Set<number>) =>
      arr.map((s, i) => {
        const m = minuteMap.get(s) ?? 1;
        return {
          key: `${team}-${i}`,
          team,
          minute: m,
          label: minuteGroup(m),
          isGoal: goalSet.has(i),
          shot: s,
        };
      });

    return [
      ...make("home", home?.shootDetail ?? [], homeGoalIdx),
      ...make("away", away?.shootDetail ?? [], awayGoalIdx),
    ];
  }, [home, away, minuteMap, homeGoalIdx, awayGoalIdx]);

  const filteredEvents = useMemo(() => {
    if (filter === "goal") return events.filter((e) => e.isGoal);
    if (filter === "shot") return events.filter((e) => !e.isGoal);
    return events;
  }, [events, filter]);

  const selected = useMemo(
    () => events.find((e) => e.key === selectedKey),
    [events, selectedKey]
  );

  const selectedDistM = useMemo(() => {
    if (!selected) return null;
    const posM = shotToMeter(selected.shot, selected.team, searchSide);
    return distanceToAttackingGoalM(posM, selected.team, searchSide);
  }, [selected, searchSide]);

  const explainLine = useMemo(() => {
    if (!selected) return "";
    const isForMe = selected.team === searchSide;

    return explainShotLine({
      isGoal: selected.isGoal,
      isForMe,
      inPenalty: selected.shot?.inPenalty,
      distM: selectedDistM,
      minute: selected.minute,
      shotType: selected.shot?.type ?? null,
    });
  }, [selected, searchSide, selectedDistM]);

  const momentumBins = useMemo(() => {
    return normalGroups.map((g) => {
      let searchM = 0;
      let oppM = 0;
      let firstKey: string | null = null;

      events.forEach((e, idx) => {
        if (e.label !== g) return;

        let w = shotWeight(e.shot, e.isGoal);
        const prev = events[idx - 1];
        if (prev && prev.team === e.team && prev.label === g) w += 0.3;

        if (!firstKey) firstKey = e.key;

        if (e.team === searchSide) searchM += w;
        else oppM += w;
      });

      return { label: g, diff: searchM - oppM, key: firstKey };
    });
  }, [events, normalGroups, searchSide]);

  const maxDiff = Math.max(...momentumBins.map((b) => Math.abs(b.diff)), 1);

  return (
    <div
      className="edge-card p-6 border space-y-6"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-bold" style={{ color: "var(--text-main)" }}>
          📊 경기 흐름 지표
        </h3>
        <span className="text-[11px]" style={{ color: "var(--text-sub)" }}>
          (슈팅, 골, 위치, 시점 기반)
        </span>
      </div>

      {/* 모멘텀 */}
      <div
        className="relative h-24 rounded-xl border overflow-hidden"
        style={{
          background: "var(--surface-2, var(--surface))",
          borderColor: "var(--border)",
        }}
      >
        <div className="absolute left-0 right-0 top-1/2 h-px bg-white/20" />
        <div className="flex h-full">
          {momentumBins.map((b) => {
            const h = (Math.abs(b.diff) / maxDiff) * 50;
            return (
              <button
                key={b.label}
                onClick={() => b.key && setSelectedKey(b.key)}
                className="flex-1 relative"
              >
                {b.diff > 0 && (
                  <div
                    className="absolute bottom-1/2 left-1/2 -translate-x-1/2 w-[70%] rounded-t-md bg-[#34E27A]"
                    style={{ height: `${h}%` }}
                  />
                )}
                {b.diff < 0 && (
                  <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[70%] rounded-b-md bg-red-400"
                    style={{ height: `${h}%` }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between text-xs" style={{ color: "var(--text-sub)" }}>
        {normalGroups.map((g) => (
          <span key={g} className="flex-1 text-center">
            {g}
          </span>
        ))}
      </div>

      {/* 히트맵 (가로 필드 기준 그대로) */}
      <div
        className="relative w-full aspect-[105/68] rounded-xl overflow-hidden border"
        style={{
          background: "var(--surface-2, var(--surface))",
          borderColor: "var(--border)",
        }}
        onClick={() => setSelectedKey(null)}
      >
        {/* 센터라인 */}
        <div className="absolute inset-y-0 left-1/2 w-px bg-white/20" />

        {/* 센터서클 */}
        <div
          className="absolute rounded-full border border-white/20"
          style={{
            width: `${((9.15 * 2) / 105) * 100}%`,
            height: `${((9.15 * 2) / 68) * 100}%`,
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />

        {/* 페널티박스 */}
        {[
          { side: "left", x: 0 },
          { side: "right", x: 105 - 16.5 },
        ].map((b) => (
          <div
            key={b.side}
            className="absolute border border-white/20"
            style={{
              left: `${(b.x / 105) * 100}%`,
              top: `${((68 / 2 - 40.32 / 2) / 68) * 100}%`,
              width: `${(16.5 / 105) * 100}%`,
              height: `${(40.32 / 68) * 100}%`,
            }}
          />
        ))}

        {/* 골에어리어 */}
        {[
          { side: "left", x: 0 },
          { side: "right", x: 105 - 5.5 },
        ].map((b) => (
          <div
            key={b.side}
            className="absolute border border-white/20"
            style={{
              left: `${(b.x / 105) * 100}%`,
              top: `${((68 / 2 - 18.32 / 2) / 68) * 100}%`,
              width: `${(5.5 / 105) * 100}%`,
              height: `${(18.32 / 68) * 100}%`,
            }}
          />
        ))}

        {/* 페널티 스폿 */}
        {[11, 105 - 11].map((x, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 bg-white rounded-full"
            style={{
              left: `${(x / 105) * 100}%`,
              top: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}

        {/* 슈팅 포인트 */}
        {filteredEvents.map((e) => {
          const posM = shotToMeter(e.shot, e.team, searchSide);
          const { leftPct, topPct } = meterToPct(posM);

          const isSearchUserShot = e.team === searchSide;
          const isActive = selectedKey === e.key;

          return (
            <button
              key={e.key}
              onClick={(ev) => {
                ev.stopPropagation();
                setSelectedKey(e.key);
              }}
              className={`
                absolute rounded-full transition-all duration-200
                ${e.isGoal ? "w-4 h-4" : "w-2.5 h-2.5"}
                ${isSearchUserShot ? "bg-[#34E27A]" : "bg-red-400"}
                ${
                  selectedKey
                    ? isActive
                      ? "opacity-100 scale-110 ring-2 ring-blue-400 ring-offset-2 z-20"
                      : "opacity-30"
                    : "opacity-100"
                }
              `}
              style={{
                left: `${leftPct}%`,
                top: `${topPct}%`,
                transform: "translate(-50%, -50%)",
                ...(selectedKey && isActive
                  ? ({ ringOffsetColor: "var(--surface-2, var(--surface))" } as any)
                  : {}),
              }}
            />
          );
        })}
      </div>

      {/* 선택 정보 */}
      {selected && (
        <div
          className="rounded-xl p-4 text-sm border"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <div className="font-semibold" style={{ color: "var(--text-main)" }}>
            {selected.isGoal ? "골" : "슈팅"} ·{" "}
            {selected.team === "home" ? home.nickname : away.nickname}
          </div>
          <div style={{ color: "var(--text-sub)" }}>
            {getPlayerDisplay(selected.shot.spId).name}
          </div>
          <div style={{ color: "var(--text-sub)" }}>{selected.label}분대</div>
          <div style={{ color: "var(--text-sub)" }}>
            골대까지 거리: {selectedDistM?.toFixed(1)}m
          </div>
          <div className="mt-2 text-sm" style={{ color: "var(--text-sub)" }}>
            {explainLine}
          </div>
        </div>
      )}
    </div>
  );
}