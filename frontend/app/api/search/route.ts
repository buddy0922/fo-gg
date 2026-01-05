import { NextResponse } from "next/server";
import { getCache, setCache } from "@/app/lib/serverCache";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function nxFetch(path: string) {
  const apiKey = process.env.NEXON_API_KEY;
  if (!apiKey) throw new Error("missing_api_key");

  const res = await fetch(`https://open.api.nexon.com/fconline/v1.0${path}`, {
    headers: { "x-nxopen-api-key": apiKey },
    cache: "no-store",
  });

  return res;
}

async function getDivisionMeta() {
  const res = await fetch(
    "https://open.api.nexon.com/static/fconline/meta/division.json",
    { cache: "no-store" }
  );
  if (!res.ok) return null;
  return res.json();
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rawNickname = searchParams.get("nickname");

  if (!rawNickname) {
    return NextResponse.json({ error: "nickname_required" }, { status: 400 });
  }

  const nickname = rawNickname.trim();
  if (!nickname) {
    return NextResponse.json({ error: "nickname_required" }, { status: 400 });
  }

  const cacheKey = `search:${nickname.toLowerCase()}`;
  const cached = getCache(cacheKey);
  if (cached) return NextResponse.json(cached);

  try {
    // 1) 닉네임 -> ouid
    const userRes = await nxFetch(`/users?nickname=${encodeURIComponent(nickname)}`);

    if (userRes.status === 503) {
      return NextResponse.json({ error: "temporary_unavailable" }, { status: 503 });
    }
    if (userRes.status === 404) {
      return NextResponse.json({ error: "user_not_found" }, { status: 404 });
    }
    if (!userRes.ok) {
      const text = await userRes.text().catch(() => "");
      return NextResponse.json(
        { error: "upstream_error", status: userRes.status, body: text.slice(0, 500) },
        { status: 500 }
      );
    }

    const user = await userRes.json();
    const ouid: string | undefined = user?.ouid;

    if (!ouid) {
      return NextResponse.json({ error: "user_not_found" }, { status: 404 });
    }

    // 2) 최고 티어
    const maxDivRes = await nxFetch(`/users/${encodeURIComponent(ouid)}/maxdivision`);
    const maxDiv = maxDivRes.ok ? await maxDivRes.json() : [];
    const list = Array.isArray(maxDiv) ? maxDiv : [];

    const official = list.filter((d: any) => d.matchType === 50);
    const highestDivision =
      official.length > 0 ? Math.max(...official.map((d: any) => d.division)) : undefined;

    const meta = await getDivisionMeta();
    const highestDivisionName =
      highestDivision && Array.isArray(meta)
        ? meta.find((d: any) => d.divisionId === highestDivision)?.divisionName
        : undefined;

    // 3) 최근 경기 matchId들
    const matchesRes = await nxFetch(
      `/users/${encodeURIComponent(ouid)}/matches?matchtype=50&offset=0&limit=10`
    );

    if (matchesRes.status === 503) {
      return NextResponse.json({ error: "temporary_unavailable" }, { status: 503 });
    }
    if (!matchesRes.ok) {
      const text = await matchesRes.text().catch(() => "");
      return NextResponse.json(
        { error: "upstream_error", status: matchesRes.status, body: text.slice(0, 500) },
        { status: 500 }
      );
    }

    const matchIds: string[] = (await matchesRes.json()) ?? [];

    // 4) match detail (너 UI가 쓰는 형태로 가공)
    const results: any[] = [];

    for (const matchId of matchIds) {
      try {
        const detailRes = await nxFetch(`/matches/${encodeURIComponent(matchId)}`);
        if (!detailRes.ok) continue;

        const match = await detailRes.json();
        const infos = match?.matchInfo;
        if (!infos || infos.length < 2) continue;

        const me = infos.find((p: any) => p.ouid === ouid);
        const enemy = infos.find((p: any) => p.ouid !== ouid);
        if (!me || !enemy) continue;

        const myGoal = me.shoot?.goalTotalDisplay ?? 0;
        const enemyGoal = enemy.shoot?.goalTotalDisplay ?? 0;

        results.push({
          matchId,
          result: myGoal > enemyGoal ? "승" : myGoal < enemyGoal ? "패" : "무",
          score: `${myGoal} : ${enemyGoal}`,
          opponent: enemy.nickname,
          matchDate: match.matchDate,
          matchType: "공식 경기",
        });
      } catch {
        continue;
      }
    }

    const response = {
      ouid,
      user: { nickname, highestDivision, highestDivisionName },
      matches: results,
    };

    setCache(cacheKey, response, 60);
    return NextResponse.json(response);
  } catch (e: any) {
    return NextResponse.json(
      { error: "upstream_error", message: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}