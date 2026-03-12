"use client";

import { useState } from "react";
import { PlayStyleResult } from "@/app/lib/playstyle";

type Props = {
  playStyle: PlayStyleResult;
  stats: any;
};

export default function PlayStyleCard({ playStyle, stats }: Props) {
  const [open, setOpen] = useState(false);

  const shootTotal = stats.shootTotal ?? 0;
  const inside = stats.shootInPenalty ?? 0;
  const outside = stats.shootOutPenalty ?? 0;

  const passTotal = stats.passTry ?? 0;
  const shortPass = stats.shortPassTry ?? 0;
  const longPass = stats.longPassTry ?? 0;
  const throughPass = stats.throughPassTry ?? 0;

  const insideRatio = shootTotal ? Math.round((inside / shootTotal) * 100) : 0;
  const outsideRatio = shootTotal ? Math.round((outside / shootTotal) * 100) : 0;

  const shortRatio = passTotal ? Math.round((shortPass / passTotal) * 100) : 0;
  const longRatio = passTotal ? Math.round((longPass / passTotal) * 100) : 0;
  const throughRatio = passTotal
    ? Math.round((throughPass / passTotal) * 100)
    : 0;

  return (
    <div
      className="border rounded-xl p-5"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      <div className="flex items-center justify-between">
        <div className="text-lg font-extrabold">플레이 스타일</div>

        <button
          onClick={() => setOpen(!open)}
          className="text-sm opacity-70 hover:opacity-100"
        >
          {open ? "닫기 ▲" : "자세히 보기 ▼"}
        </button>
      </div>

      <div className="mt-2 text-base font-semibold">
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
      </div>

      {open && (
        <div className="mt-4 space-y-4 text-sm">
          <div>
            <div className="font-semibold mb-1">슛 성향</div>
            <div>박스 안 슛 {insideRatio}%</div>
            <div>박스 밖 슛 {outsideRatio}%</div>
          </div>

          <div>
            <div className="font-semibold mb-1">패스 스타일</div>
            <div>숏패스 {shortRatio}%</div>
            <div>롱패스 {longRatio}%</div>
            <div>침투패스 {throughRatio}%</div>
          </div>
        </div>
      )}
    </div>
  );
}