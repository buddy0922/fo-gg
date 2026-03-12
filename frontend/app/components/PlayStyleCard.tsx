"use client";

import { useState } from "react";
import { PlayStyleResult } from "@/app/lib/playstyle";

type Props = {
  playStyle: PlayStyleResult;
  stats: {
    shootTotal: number;
    effectiveShootTotal: number;
    goalTotal: number;
    shootInPenalty: number;
    shootOutPenalty: number;

    passTry: number;
    passSuccess: number;
    shortPassTry: number;
    shortPassSuccess: number;
    longPassTry: number;
    longPassSuccess: number;
    throughPassTry: number;
    throughPassSuccess: number;

    tackleTry: number;
    tackleSuccess: number;

        blockTry: number;
    blockSuccess: number;

    possession: number;
    dribble: number;
    cornerKick: number;
    offsideCount: number;
  };
};

function safePercent(a: number, b: number) {
  return b > 0 ? Math.round((a / b) * 100) : 0;
}

export default function PlayStyleCard({ playStyle, stats }: Props) {
  const [open, setOpen] = useState(false);

  const shootTotal = stats.shootTotal ?? 0;
  const effectiveShootTotal = stats.effectiveShootTotal ?? 0;
  const goalTotal = stats.goalTotal ?? 0;
  const inside = stats.shootInPenalty ?? 0;
  const outside = stats.shootOutPenalty ?? 0;

  const passTry = stats.passTry ?? 0;
  const passSuccess = stats.passSuccess ?? 0;
  const shortPassTry = stats.shortPassTry ?? 0;
  const shortPassSuccess = stats.shortPassSuccess ?? 0;
  const longPassTry = stats.longPassTry ?? 0;
  const longPassSuccess = stats.longPassSuccess ?? 0;
  const throughPassTry = stats.throughPassTry ?? 0;
  const throughPassSuccess = stats.throughPassSuccess ?? 0;

  const tackleTry = stats.tackleTry ?? 0;
  const tackleSuccess = stats.tackleSuccess ?? 0;

    const blockTry = stats.blockTry ?? 0;
  const blockSuccess = stats.blockSuccess ?? 0;

  const possession = stats.possession ?? 0;
  const dribble = stats.dribble ?? 0;
  const cornerKick = stats.cornerKick ?? 0;
  const offsideCount = stats.offsideCount ?? 0;

  const insideRatio = safePercent(inside, shootTotal);
  const outsideRatio = safePercent(outside, shootTotal);
  const effectiveShootRatio = safePercent(effectiveShootTotal, shootTotal);
  const goalConversionRatio = safePercent(goalTotal, shootTotal);

  const passSuccessRatio = safePercent(passSuccess, passTry);

  const shortPassRatio = safePercent(shortPassTry, passTry);
  const longPassRatio = safePercent(longPassTry, passTry);
  const throughPassRatio = safePercent(throughPassTry, passTry);

  const shortPassSuccessRatio = safePercent(shortPassSuccess, shortPassTry);
  const longPassSuccessRatio = safePercent(longPassSuccess, longPassTry);
  const throughPassSuccessRatio = safePercent(
    throughPassSuccess,
    throughPassTry
  );

  const tackleSuccessRatio = safePercent(tackleSuccess, tackleTry);

  return (
    <div
      className="border rounded-xl p-5"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      <div className="flex items-center justify-between">
        <div
          className="text-lg font-extrabold"
          style={{ color: "var(--text-main)" }}
        >
          플레이 스타일
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="text-sm opacity-70 hover:opacity-100"
          style={{ color: "var(--text-sub)" }}
        >
          {open ? "닫기 ▲" : "자세히 보기 ▼"}
        </button>
      </div>

      <div className="mt-2">
        <div
          className="text-base font-semibold"
          style={{ color: "var(--text-main)" }}
        >
          {playStyle.description}
        </div>

        {playStyle.subDescription && (
          <div
            className="text-sm mt-1"
            style={{ color: "var(--text-sub)" }}
          >
            {playStyle.subDescription}
          </div>
        )}
      </div>

      {open && (
        <div className="mt-5 space-y-5 text-sm">
          <div>
            <div
              className="font-semibold mb-2"
              style={{ color: "var(--text-main)" }}
            >
              슛 성향
            </div>
            <div style={{ color: "var(--text-sub)" }}>
              박스 안 슛 {insideRatio}% · 박스 밖 슛 {outsideRatio}%
            </div>
            <div className="mt-1" style={{ color: "var(--text-sub)" }}>
              총 슛 {shootTotal}회 · 유효 슛 {effectiveShootTotal}회 · 득점 {goalTotal}골
            </div>
          </div>

          <div>
            <div
              className="font-semibold mb-2"
              style={{ color: "var(--text-main)" }}
            >
              슈팅 효율
            </div>
            <div style={{ color: "var(--text-sub)" }}>
              유효슈팅 비율 {effectiveShootRatio}% · 득점 전환율 {goalConversionRatio}%
            </div>
          </div>

          <div>
            <div
              className="font-semibold mb-2"
              style={{ color: "var(--text-main)" }}
            >
              패스 스타일
            </div>
            <div style={{ color: "var(--text-sub)" }}>
              숏패스 {shortPassRatio}% · 롱패스 {longPassRatio}% · 침투패스 {throughPassRatio}%
            </div>
            <div className="mt-1" style={{ color: "var(--text-sub)" }}>
              총 패스 {passTry}회 · 패스 성공률 {passSuccessRatio}%
            </div>
          </div>

          <div>
            <div
              className="font-semibold mb-2"
              style={{ color: "var(--text-main)" }}
            >
              패스 성공률 세부
            </div>
            <div style={{ color: "var(--text-sub)" }}>
              숏패스 성공률 {shortPassSuccessRatio}% · 롱패스 성공률 {longPassSuccessRatio}% · 침투패스 성공률 {throughPassSuccessRatio}%
            </div>
          </div>

          <div>
            <div
              className="font-semibold mb-2"
              style={{ color: "var(--text-main)" }}
            >
              수비 성향
            </div>
            <div style={{ color: "var(--text-sub)" }}>
              태클 시도 {tackleTry}회 · 태클 성공 {tackleSuccess}회 · 태클 성공률 {tackleSuccessRatio}%
            </div>
          </div>

                    <div>
            <div
              className="font-semibold mb-2"
              style={{ color: "var(--text-main)" }}
            >
              블락 / 수비 보조
            </div>
            <div style={{ color: "var(--text-sub)" }}>
              블락 시도 {blockTry}회 · 블락 성공 {blockSuccess}회
            </div>
          </div>

          <div>
            <div
              className="font-semibold mb-2"
              style={{ color: "var(--text-main)" }}
            >
              운영 지표
            </div>
            <div style={{ color: "var(--text-sub)" }}>
              평균 점유 지표 {possession} · 드리블 지표 {dribble}
            </div>
          </div>

          <div>
            <div
              className="font-semibold mb-2"
              style={{ color: "var(--text-main)" }}
            >
              공격 부가 지표
            </div>
            <div style={{ color: "var(--text-sub)" }}>
              코너킥 {cornerKick}회 · 오프사이드 {offsideCount}회
            </div>
          </div>
        </div>
      )}
    </div>
  );
}