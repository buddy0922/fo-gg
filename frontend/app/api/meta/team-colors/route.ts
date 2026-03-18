import { NextResponse } from "next/server";

type Tier = "SS" | "S" | "A" | "B" | "C" | "F";

const mockData = [
  { teamColor: "레알 마드리드", users: 1842, pickRate: 20.57 },
  { teamColor: "대한민국", users: 1320, pickRate: 14.74 },
  { teamColor: "첼시", users: 1011, pickRate: 11.29 },
  { teamColor: "맨체스터 시티", users: 845, pickRate: 9.43 },
  { teamColor: "바르셀로나", users: 640, pickRate: 7.14 },
  { teamColor: "파리 생제르맹", users: 410, pickRate: 4.57 },
];

// 🔥 티어 분류 함수
function getTier(rank: number, total: number): Tier {
  const ratio = rank / total;

  if (ratio <= 0.05) return "SS";   // 상위 5%
  if (ratio <= 0.15) return "S";    // 상위 15%
  if (ratio <= 0.35) return "A";
  if (ratio <= 0.65) return "B";
  if (ratio <= 0.9) return "C";
  return "F";
}

export async function GET() {
  const sorted = [...mockData].sort((a, b) => b.pickRate - a.pickRate);

  const total = sorted.length;

  const data = sorted.map((item, idx) => ({
    rank: idx + 1,
    ...item,
    tier: getTier(idx + 1, total),
  }));

  return NextResponse.json({
    source: "ranker",
    baseDate: "2026-03-15",
    sampleSize: 8954,
    updateCycle: "monthly_twice",
    data,
  });
}