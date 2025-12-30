import { NextResponse } from "next/server";
import api from "@/lib/api";
import { getCache, setCache } from "@/app/lib/serverCache";

// ⏱ retry용 sleep
const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export async function GET(
  req: Request,
  context: { params: Promise<{ matchId: string }> }
) {
  const { matchId } = await context.params;

  const cacheKey = `match:${matchId}`;

  // ✅ 1️⃣ 캐시 먼저
  const cached = getCache(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  let lastError: any = null;

  // ✅ 2️⃣ 최대 2회 시도 (1회 retry)
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const detailResp = await api.get("/match-detail", {
        params: { matchid: matchId },
      });

      const data = detailResp.data;

      // ✅ 성공 시 캐시 (30초)
      setCache(cacheKey, data, 180);

      return NextResponse.json(data);

    } catch (err: any) {
      const apiError = err?.response?.data?.error?.name;
      lastError = apiError;

      // 🔥 넥슨 서버 일시 장애 → retry 대상
      if (apiError === "OPENAPI00007" && attempt === 0) {
        await sleep(1000); // 1초 대기 후 재시도
        continue;
      }

      break;
    }
  }

  // ✅ retry 실패 후 처리
  if (lastError === "OPENAPI00007") {
    return NextResponse.json(
      { error: "temporary_unavailable" },
      { status: 503 }
    );
  }

  console.error("MATCH DETAIL ERROR:", lastError);
  return NextResponse.json(
    { error: "upstream_error" },
    { status: 500 }
  );
}