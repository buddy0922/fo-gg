import { NextResponse } from "next/server";
import { getCache, setCache } from "@/app/lib/serverCache";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const API_BASE = "https://open.api.nexon.com/fconline/v1";
const MATCH_LIMIT = 100;

// 전체탭에서 합칠 타입
const ALL_MATCH_TYPES = [50, 40, 52, 60]; // 공식/커스텀/감독/친선

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

async function getMatchTypeMeta() {
  const res = await fetch(
    "https://open.api.nexon.com/static/fconline/meta/matchtype.json",
    { cache: "no-store" }
  );
  if (!res.ok) return null;
  return res.json();
}

type CachedBase = {
  ouid: string;
  user: {
    nickname: string;
    highestDivision?: number;
    highestDivisionName?: string;
  };
  matchIdsAll: string[];
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const rawNickname = searchParams.get("nickname");
  const nickname = (rawNickname ?? "").trim();
  if (!nickname) {
    return NextResponse.json({ error: "nickname_required" }, { status: 400 });
  }

  // ✅ matchtype: URL에서 type(프론트용) 말고, API는 matchtype으로 받음
  // - 전체 탭이면 matchtype 없음(null)
  const rawMatchtype = searchParams.get("matchtype");
  const matchtypeFilter = rawMatchtype ? Number(rawMatchtype) : null;

  // ✅ pagination
  const rawOffset = searchParams.get("offset");
  const rawLimit = searchParams.get("limit");
  const offset = rawOffset ? Math.max(0, Number(rawOffset)) : 0;
  const limit = rawLimit ? Math.min(50, Math.max(1, Number(rawLimit))) : 20;

  // ✅ 캐시는 "base(ouid/user/matchIdsAll)"만 저장 (offset/limit은 캐시에 포함 X)
  const cacheKey = `search:${nickname.toLowerCase()}:mt:${rawMatchtype ?? "all"}`;
  const cachedBase = getCache(cacheKey) as CachedBase | null;

  try {
    // 0) matchType meta (라벨)
    const matchTypeMeta = await getMatchTypeMeta();
    const matchTypeNameById =
      Array.isArray(matchTypeMeta)
        ? new Map<number, string>(matchTypeMeta.map((x: any) => [x.matchtype, x.desc]))
        : new Map<number, string>();

    // ✅ A) base가 캐시에 있으면 matchIdsAll 만들기 과정 스킵
    if (cachedBase) {
      const { ouid, user, matchIdsAll } = cachedBase;

      const pageIds = matchIdsAll.slice(offset, offset + limit);
      const results: any[] = [];

      for (const matchId of pageIds) {
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

          const mt = Number(match?.matchType);
          const mtName = matchTypeNameById.get(mt) ?? `타입 ${mt}`;

          results.push({
            matchId,
            result: myGoal > enemyGoal ? "승" : myGoal < enemyGoal ? "패" : "무",
            score: `${myGoal} : ${enemyGoal}`,
            opponent: enemy.nickname,
            matchDate: match.matchDate,
            matchType: mtName,
            matchTypeId: mt,
          });
        } catch {
          continue;
        }
      }

      results.sort((a, b) => {
        const ta = a.matchDate ? new Date(a.matchDate).getTime() : 0;
        const tb = b.matchDate ? new Date(b.matchDate).getTime() : 0;
        return tb - ta;
      });

      const nextOffset = offset + results.length;
      const hasMore = nextOffset < matchIdsAll.length;

      return NextResponse.json({
        ouid,
        user,
        matches: results,
        nextOffset,
        hasMore,
      });
    }

    // ✅ B) base가 없으면: ouid + matchIdsAll 만들어서 캐시 후, 첫 페이지 detail만
    // 1) nickname -> ouid
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

    // 2) maxdivision (공식 50 기준 유지)
    const maxDivRes = await nxFetch(`/user/maxdivision?ouid=${encodeURIComponent(ouid)}`);
    const maxDivJson = maxDivRes.ok ? await maxDivRes.json() : [];
    const list = Array.isArray(maxDivJson) ? maxDivJson : [];

    const official = list.filter((d: any) => d.matchType === 50);
    const highestDivision =
      official.length > 0 ? Math.max(...official.map((d: any) => d.division)) : undefined;

    const divMeta = await getDivisionMeta();
    const highestDivisionName =
      highestDivision && Array.isArray(divMeta)
        ? divMeta.find((d: any) => d.divisionId === highestDivision)?.divisionName
        : undefined;

    // 3) recent match ids (전체 탭이면 4개 타입 합쳐서)
    const typesToFetch = matchtypeFilter !== null ? [matchtypeFilter] : ALL_MATCH_TYPES;

    const matchMap = new Map<string, number>(); // matchId -> matchType
    for (const mt of typesToFetch) {
      const res = await nxFetch(
        `/user/match?ouid=${encodeURIComponent(ouid)}&matchtype=${mt}&offset=0&limit=${MATCH_LIMIT}`
      );

      if (res.status === 503) {
        return NextResponse.json({ error: "temporary_unavailable" }, { status: 503 });
      }
      if (!res.ok) continue;

      const ids: string[] = (await res.json().catch(() => [])) ?? [];
      for (const id of ids) {
        if (!matchMap.has(id)) matchMap.set(id, mt);
      }
    }

    const matchIdsAll = Array.from(matchMap.keys());

    // ✅ base 캐시 저장 (5분)
    const user = { nickname, highestDivision, highestDivisionName };
    setCache(cacheKey, { ouid, user, matchIdsAll }, 300);

    // 4) 첫 페이지 detail만
    const pageIds = matchIdsAll.slice(offset, offset + limit);
    const results: any[] = [];

    for (const matchId of pageIds) {
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

        const mt = Number(match?.matchType);
        const mtName = matchTypeNameById.get(mt) ?? `타입 ${mt}`;

        results.push({
          matchId,
          result: myGoal > enemyGoal ? "승" : myGoal < enemyGoal ? "패" : "무",
          score: `${myGoal} : ${enemyGoal}`,
          opponent: enemy.nickname,
          matchDate: match.matchDate,
          matchType: mtName,
          matchTypeId: mt,
        });
      } catch {
        continue;
      }
    }

    results.sort((a, b) => {
      const ta = a.matchDate ? new Date(a.matchDate).getTime() : 0;
      const tb = b.matchDate ? new Date(b.matchDate).getTime() : 0;
      return tb - ta;
    });

    const nextOffset = offset + results.length;
    const hasMore = nextOffset < matchIdsAll.length;

    return NextResponse.json({
      ouid,
      user,
      matches: results,
      nextOffset,
      hasMore,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: "upstream_error", message: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}