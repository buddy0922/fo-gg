import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  _request: NextRequest,
  context: { params: { matchId: string } }
) {
  const { matchId } = context.params;

  const apiKey = process.env.NEXON_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "missing_api_key" },
      { status: 500 }
    );
  }

  const url = `https://open.api.nexon.com/fconline/v1.0/matches/${matchId}`;

  try {
    const res = await fetch(url, {
      headers: {
        "x-nxopen-api-key": apiKey,
      },
      cache: "no-store",
    });

    if (res.status === 503) {
      return NextResponse.json(
        { error: "temporary_unavailable" },
        { status: 503 }
      );
    }

    if (res.status === 404) {
      return NextResponse.json(
        { error: "not_found" },
        { status: 404 }
      );
    }

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json(
        {
          error: "upstream_error",
          status: res.status,
          body: text.slice(0, 500),
        },
        { status: 500 }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json(
      { error: "upstream_error", message: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}