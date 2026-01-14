import { NextResponse } from "next/server";
import { getCache, setCache } from "@/app/lib/serverCache";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const API_BASE = "https://open.api.nexon.com/fconline/v1";
const MATCH_LIMIT = 100;

async function nxFetch(pathWithQuery: string) {
  const apiKey = process.env.NEXON_API_KEY;
  if (!apiKey) throw new Error("missing_api_key");

  const url = `${API_BASE}${pathWithQuery}`;
  const res = await fetch(url, {
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

  // ✅ A) matchtype 파라미터 받기 (없으면 기본값 50)
  const rawMatchtype = searchParams.get("matchtype"); // "50" 같은 문자열
  const matchtype = rawMatchtype ? Number(rawMatchtype) : 50;

  const nickname = (rawNickname ?? "").trim();
  if (!nickname) {
    return NextResponse.json({ error: "nickname_required" }, { status: 400 });
  }

  // ✅ B) 캐시 키에 matchtype 포함 (탭별 캐시 분리)
  const cacheKey = `search:${nickname.toLowerCase()}:mt:${rawMatchtype ?? "default"}`;
  const cached = getCache(cacheKey);
  if (cached) return NextResponse.json(cached);

  try {
    /* 1) nickname -> ouid  (✅ v1/id) */
    const idRes = await nxFetch(`/id?nickname=${encodeURIComponent(nickname)}`);

    if (idRes.status === 503) {
      return NextResponse.json({ error: "temporary_unavailable" }, { status: 503 });
    }

    if (!idRes.ok) {
      const text = await idRes.text().catch(() => "");
      return NextResponse.json(
        { error: "upstream_error", status: idRes.status, body: text.slice(0, 500) },
        { status: 500 }
      );
    }

    const idJson = await idRes.json();
    const ouid: string | undefined = idJson?.ouid;

    if (!ouid) {
      return NextResponse.json({ error: "user_not_found" }, { status: 404 });
    }

    /* 2) maxdivision (✅ v1/user/maxdivision) */
    const maxDivRes = await nxFetch(`/user/maxdivision?ouid=${encodeURIComponent(ouid)}`);
    const maxDivJson = maxDivRes.ok ? await maxDivRes.json() : [];
    const list = Array.isArray(maxDivJson) ? maxDivJson : [];

    // (기존 그대로) 최고 티어는 공식(50) 기준으로만 계산
    const official = list.filter((d: any) => d.matchType === 50);
    const highestDivision =
      official.length > 0 ? Math.max(...official.map((d: any) => d.division)) : undefined;

    const meta = await getDivisionMeta();
    const highestDivisionName =
      highestDivision && Array.isArray(meta)
        ? meta.find((d: any) => d.divisionId === highestDivision)?.divisionName
        : undefined;

    /* 3) recent matches (✅ v1/user/match) */
const matchtypeParam = searchParams.get("matchtype");
const requestedType = matchtypeParam ? Number(matchtypeParam) : null;

// 전체면 여러 타입을 합쳐서 보여주기
const TYPES_FOR_ALL = [50, 40, 52, 60];
const typesToFetch = requestedType === null ? TYPES_FOR_ALL : [requestedType];

// matchId 중복 방지
const matchIdSet = new Set<string>();
const matchIdsAll: string[] = [];

for (const mt of typesToFetch) {
  const matchRes = await nxFetch(
    `/user/match?ouid=${encodeURIComponent(ouid)}&matchtype=${mt}&offset=0&limit=${MATCH_LIMIT}`
  );

  if (matchRes.status === 503) {
    return NextResponse.json({ error: "temporary_unavailable" }, { status: 503 });
  }

  if (!matchRes.ok) {
    const text = await matchRes.text().catch(() => "");
    return NextResponse.json(
      { error: "upstream_error", status: matchRes.status, body: text.slice(0, 500) },
      { status: 500 }
    );
  }

  const ids: string[] = (await matchRes.json()) ?? [];
  for (const id of ids) {
    if (!matchIdSet.has(id)) {
      matchIdSet.add(id);
      matchIdsAll.push(id);
    }
  }
}

    /* 4) match-detail (✅ v1/match-detail?matchid=...) */
    const results: any[] = [];

    for (const matchId of matchIdsAll) {
      try {
        const detailRes = await nxFetch(`/match-detail?matchid=${encodeURIComponent(matchId)}`);
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
          // ✅ D) matchType 라벨을 하드코딩 제거 (일단 matchtype 숫자 노출)
          matchType: `matchtype=${matchtype}`,
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