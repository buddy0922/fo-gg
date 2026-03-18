import { NextResponse } from "next/server";

// 🔥 임시 더미 데이터 (나중에 DB로 교체)
const mockData = [
  { formation: "4-2-3-1", pickRate: 24.1, winRate: 53.8 },
  { formation: "4-2-2-2", pickRate: 19.9, winRate: 52.6 },
  { formation: "4-1-2-3", pickRate: 16.4, winRate: 51.2 },
  { formation: "4-3-3", pickRate: 14.8, winRate: 50.9 },
];

export async function GET() {
  return NextResponse.json({
    source: "ranker",
    updatedAt: new Date().toISOString(),
    data: mockData,
  });
}