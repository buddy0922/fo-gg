import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ matchId: string }> }
) {
  const apiKey = process.env.NEXON_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "missing_api_key" }, { status: 500 });
  }

  const { matchId } = await context.params;

  if (!matchId || typeof matchId !== "string") {
    return NextResponse.json({ error: "invalid_matchId" }, { status: 400 });
  }

  // ✅ 너가 curl로 "정상" 확인한 엔드포인트 그대로 사용
  const url = `https://open.api.nexon.com/fconline/v1/match-detail?matchid=${encodeURIComponent(
    matchId
  )}`;

  try {
    const res = await fetch(url, {
      headers: {
        "x-nxopen-api-key": apiKey,
      },
      cache: "no-store",
    });

    // 넥슨 서버 불안정
    if (res.status === 503) {
      return NextResponse.json({ error: "temporary_unavailable" }, { status: 503 });
    }

    // matchId가 틀리거나 삭제됨
    if (res.status === 404) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    // 그 외 에러
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json(
        {
          error: "upstream_error",
          status: res.status,
          body: text.slice(0, 500),
          url,
        },
        { status: 500 }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json(
      { error: "upstream_error", message: String(e?.message ?? e), url },
      { status: 500 }
    );
  }
}