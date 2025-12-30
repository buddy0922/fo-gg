"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getPlayerDisplay } from "@/app/lib/players";

const POS_NUM_TO_CODE: Record<number, string> = {
  0: "GK",
  1: "SW",
  2: "RWB",
  3: "RB",
  4: "RCB",
  5: "CB",
  6: "LCB",
  7: "LB",
  8: "LWB",
  9: "CDM",
  10: "RDM",
  11: "LDM",
  12: "CM",
  13: "RCM",
  14: "LCM",
  15: "CAM",
  16: "RAM",
  17: "LAM",
  18: "RM",
  19: "LM",
  20: "RW",
  21: "LW",
  22: "RF",
  23: "LF",
  24: "RS",
  25: "LS",
  26: "CF",
  27: "ST",
};

function displayPosition(pos: any): string {
  if (pos == null) return "UNK";

  // 숫자면 -> 코드로
  if (typeof pos === "number" && Number.isFinite(pos)) {
    return POS_NUM_TO_CODE[pos] ?? `POS${pos}`;
  }

  // 문자열이면 -> 정리해서 그대로
  const s = String(pos).trim().toUpperCase();
  return s || "UNK";
}

function ratingColor(rating: number) {
  if (rating >= 8) return "text-[#34E27A]";
  if (rating >= 6) return "text-yellow-400";
  return "text-red-400";
}


function roleByPosition(pos: any): "GK" | "DF" | "MF" | "FW" {
  if (pos == null) return "MF";

  let p: string;

  // 숫자 포지션 대응
  if (typeof pos === "number") {
    p = POS_NUM_TO_CODE[pos] ?? "";
  } else {
    p = String(pos).toUpperCase();
  }

  if (p === "GK") return "GK";

  if (["LB", "RB", "CB", "LCB", "RCB", "LWB", "RWB", "SW"].includes(p))
    return "DF";

  if (
    ["CDM", "CM", "CAM", "LDM", "RDM", "LCM", "RCM", "LAM", "RAM", "LM", "RM"].includes(p)
  )
    return "MF";

  if (["ST", "CF", "RS", "LS", "LW", "RW", "LF", "RF"].includes(p))
    return "FW";

  return "MF";
}

function badgeColorByRole(role: string) {
  switch (role) {
    case "GK":
      return "bg-yellow-400/90 text-black"; // GK 노랑
    case "DF":
      return "bg-blue-500/90 text-white";  // DF 파랑
    case "MF":
      return "bg-green-500/90 text-black"; // MF 초록
    case "FW":
      return "bg-red-500/90 text-white";   // FW 빨강
    default:
      return "bg-white/10 text-gray-200";
  }
}


export default function RatingsToggle({
  leftTeam,
  rightTeam,
}: {
  leftTeam: any;
  rightTeam: any;
}) {
  const [open, setOpen] = useState(false);

  // 애니메이션을 위해 "DOM은 남겨두고" 닫힐 때도 transition 되게
  const [render, setRender] = useState(false);

  // height 애니메이션: 실제 컨텐츠 높이를 측정해서 maxHeight로 전환
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [maxH, setMaxH] = useState<number>(0);

  useEffect(() => {
    if (open) {
      setRender(true); // 열릴 때는 먼저 렌더
    }
  }, [open]);

  useEffect(() => {
    if (!render) return;

    // 다음 tick에 높이 재서 maxHeight 세팅 (열릴 때)
    const id = requestAnimationFrame(() => {
      const h = contentRef.current?.scrollHeight ?? 0;
      setMaxH(h);
    });

    return () => cancelAnimationFrame(id);
  }, [render, leftTeam, rightTeam]);

  // 닫힐 때: maxHeight를 0으로 -> transition -> 끝나면 render false
  useEffect(() => {
    if (!open && render) {
      setMaxH(0);
      const t = setTimeout(() => setRender(false), 360);
      return () => clearTimeout(t);
    }
  }, [open, render]);

  const teams = useMemo(() => [leftTeam, rightTeam], [leftTeam, rightTeam]);

  return (
    <div className="space-y-4">
      {/* ===== 닫혀 있을 때: 평점 보기 버튼 ===== */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="w-full h-12 rounded-xl
                     bg-[#1B2230] border border-[#1C2230]
                     text-sm font-semibold text-gray-200
                     hover:bg-[#232B3A] transition"
        >
          ▼ 평점 보기
        </button>
      )}

      {/* ===== 펼쳐지는 영역 (slide down/up) ===== */}
      {render && (
        <div
  className="overflow-hidden transition-[max-height,opacity,transform]"
  style={{
    maxHeight: open ? maxH : 0,
    opacity: open ? 1 : 0,
    transform: open ? "translateY(0px)" : "translateY(-10px)",
    transitionDuration: "320ms",
    transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
  }}
>
          <div ref={contentRef} className="space-y-4 pt-2">
            {/* 평점 리스트 */}
            <div className="grid md:grid-cols-2 gap-4">
              {teams.map((team, idx) => {
                const ratedPlayers = team.player
                  .filter((p: any) => (p.status?.spRating ?? 0) > 0)
                  .sort(
                    (a: any, b: any) =>
                      (b.status?.spRating ?? 0) - (a.status?.spRating ?? 0)
                  );

                const mvpSpId = ratedPlayers[0]?.spId ?? null;
                const worstSpId =
                  ratedPlayers[ratedPlayers.length - 1]?.spId ?? null;

                return (
                  <div
                    key={idx}
                    className="bg-[#1B2230] rounded-2xl p-4 border border-[#1C2230]"
                  >
                    <h3 className="font-bold mb-3 text-center">
                      {team.nickname}
                    </h3>

                    <div className="space-y-2">
                      {ratedPlayers.map((p: any) => {
  const rating = p.status?.spRating ?? 0;
  const display = getPlayerDisplay(p.spId);
  const pos = displayPosition(p.spPosition);

                        return (
                          <div
                            key={p.spId}
                            className="flex justify-between items-center
                                       bg-[#161A23] rounded-lg px-3 py-2"
                          >
                            <div>
                              <div className="flex items-center gap-2">
  {/* 포지션 배지 */}
  {(() => {
  const role = roleByPosition(p.spPosition);
  return (
    <span
      className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
        role === "GK"
          ? "bg-yellow-400/20 text-yellow-300"
          : role === "DF"
          ? "bg-blue-400/20 text-blue-300"
          : role === "MF"
          ? "bg-green-400/20 text-green-300"
          : "bg-red-400/20 text-red-300"
      }`}
    >
      {pos}   {/* ✅ FW/MF가 아니라 ST/LDM/RCB 같은 세부 포지션 */}
    </span>
  );
})()}

  {/* 선수 이름 */}
  <span className="font-semibold">{display.name}</span>

  {/* MVP 아이콘 */}
{p.spId === mvpSpId && (
  <span
    title="MVP"
    className="ml-1 text-lg leading-none"
  >
    👑
  </span>
)}

{/* 꼴지 아이콘 */}
{p.spId === worstSpId && (
  <span
    title="Lowest Rating"
    className="ml-1 text-base leading-none opacity-80"
  >
    💀
  </span>
)}
</div>

                              <div className="text-xs text-gray-400">
                                {display.season}
                              </div>
                            </div>

                            <div className={`font-bold ${ratingColor(rating)}`}>
                              {rating.toFixed(1)}
                              
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 평점 닫기 버튼 (평점 아래) */}
            <button
              onClick={() => setOpen(false)}
              className="w-full h-12 rounded-xl
                         bg-[#1B2230] border border-[#1C2230]
                         text-sm font-semibold text-gray-300
                         hover:bg-[#232B3A] transition"
            >
              ▲ 평점 닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}