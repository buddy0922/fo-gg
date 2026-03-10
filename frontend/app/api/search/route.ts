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

async function getUserBasic(ouid: string) {
  const res = await nxFetch(`/user/basic?ouid=${encodeURIComponent(ouid)}`);
  if (!res.ok) return null;
  return res.json();
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
    { cache: "force-cache" } // ✅ 변경
  );
  if (!res.ok) return null;
  return res.json();
}

async function fetchDetailsBatch(ouid: string, ids: string[], matchTypeNameById: Map<number,string>) {
  const results: any[] = [];
  const CONCURRENCY = 6;

  for (let i = 0; i < ids.length; i += CONCURRENCY) {
    const chunk = ids.slice(i, i + CONCURRENCY);

    const chunkResults = await Promise.all(
      chunk.map(async (matchId) => {
        try {
          const detailCacheKey = `match-detail:${matchId}`;
let match = getCache(detailCacheKey);

if (!match) {
  const detailRes = await nxFetch(
    `/match-detail?matchid=${encodeURIComponent(matchId)}`
  );
  if (!detailRes.ok) return null;

  match = await detailRes.json();
  setCache(detailCacheKey, match, 300); // 5분 캐시
}
          const infos = match?.matchInfo;
          if (!infos || infos.length < 2) return null;

          const me = infos.find((p: any) => p.ouid === ouid);
          const enemy = infos.find((p: any) => p.ouid !== ouid);
          if (!me || !enemy) return null;

          const myGoal = me.shoot?.goalTotalDisplay ?? 0;
          const enemyGoal = enemy.shoot?.goalTotalDisplay ?? 0;

          const mt = Number(match?.matchType);
          const mtName = matchTypeNameById.get(mt) ?? `타입 ${mt}`;

          return {
            matchId,
            result: myGoal > enemyGoal ? "승" : myGoal < enemyGoal ? "패" : "무",
            score: `${myGoal} : ${enemyGoal}`,
            opponent: enemy.nickname,
            matchDate: match.matchDate,
            matchType: mtName,
            matchTypeId: mt,
          };
        } catch {
          return null;
        }
      })
    );

    for (const r of chunkResults) if (r) results.push(r);
  }

  return results;
}

type CachedBase = {
  ouid: string;
  user: {
    nickname: string;
    level?: number;               // ✅ 추가
    highestDivision?: number;
    highestDivisionName?: string;
  };
  matchIdsAll: string[];
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const rawNickname = searchParams.get("nickname");
const rawOuid = searchParams.get("ouid");

const nickname = (rawNickname ?? "").trim();
const ouidFromQuery = (rawOuid ?? "").trim();

if (!nickname && !ouidFromQuery) {
  return NextResponse.json(
    { error: "nickname_or_ouid_required" },
    { status: 400 }
  );
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
  const cacheBase = ouidFromQuery
  ? `ouid:${ouidFromQuery}`
  : `nickname:${nickname.toLowerCase()}`;

const cacheKey = `search:${cacheBase}:mt:${rawMatchtype ?? "all"}`;
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

      

const results = await fetchDetailsBatch(ouid, pageIds, matchTypeNameById);
const order = new Map(pageIds.map((id, i) => [id, i]));
results.sort((a, b) => (order.get(a.matchId)! - order.get(b.matchId)!));



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
    // 1) ouid 확정
let ouid: string | undefined = ouidFromQuery;
let resolvedNickname = nickname;

if (!ouid) {
  const idRes = await nxFetch(`/id?nickname=${encodeURIComponent(nickname)}`);

  if (idRes.status === 503) {
    return NextResponse.json(
      { error: "temporary_unavailable" },
      { status: 503 }
    );
  }

  if (!idRes.ok) {
    const text = await idRes.text().catch(() => "");
    return NextResponse.json(
      { error: "upstream_error", status: idRes.status, body: text.slice(0, 500) },
      { status: 500 }
    );
  }

  const idJson = await idRes.json();
  ouid = idJson?.ouid;
  if (!ouid) {
    return NextResponse.json({ error: "user_not_found" }, { status: 404 });
  }
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

    const matchMap = new Map<string, number>(); // matchId -> matchType (중복 제거/총 개수용)
const idsByType = new Map<number, string[]>(); // ✅ 타입별 최신순 배열

for (const mt of typesToFetch) {
  const res = await nxFetch(
    `/user/match?ouid=${encodeURIComponent(ouid)}&matchtype=${mt}&offset=0&limit=${MATCH_LIMIT}`
  );
  if (res.status === 503) {
    return NextResponse.json({ error: "temporary_unavailable" }, { status: 503 });
  }
  if (!res.ok) continue;

  const ids: string[] = (await res.json().catch(() => [])) ?? [];
  idsByType.set(mt, ids); // ✅ 타입별 배열 저장

  for (const id of ids) {
    if (!matchMap.has(id)) matchMap.set(id, mt);
  }
}

const matchIdsAll = Array.from(matchMap.keys()); // ✅ 이건 이제 "총 길이"만 쓰는 용도

// ✅ 전체탭이면: offset+limit만큼 최신을 맞추기 위해 후보를 더 뽑아 detail로 정렬
let candidateIds: string[] = [];

if (matchtypeFilter === null) {
  const PER_TYPE_TAKE = 35; // ✅ 여기만 조절 (30~40 추천)
  const seen = new Set<string>();

  for (const mt of typesToFetch) {
    const arr = idsByType.get(mt) ?? [];
    for (const id of arr.slice(0, PER_TYPE_TAKE)) {
      if (seen.has(id)) continue;
      seen.add(id);
      candidateIds.push(id);
    }
  }
} else {
  candidateIds = (idsByType.get(matchtypeFilter) ?? []).slice(offset, offset + limit);
}

    // ✅ base 캐시 저장 (5분)
    // ✅ level 가져오기
const basic = await getUserBasic(ouid);
const level =
  typeof basic?.level === "number"
    ? basic.level
    : typeof basic?.userLevel === "number"
    ? basic.userLevel
    : undefined;

// ✅ base 캐시 저장 (5분)
const user = {
  nickname: resolvedNickname || nickname || ouid,
  level,
  highestDivision,
  highestDivisionName,
};

    // ✅ [방법 A] 전체탭이면: candidateIds를 더 많이 detail로 가져와 matchDate로 정렬 → 정렬된 matchId들을 matchIdsAll로 캐싱
if (matchtypeFilter === null) {
  // 첫 페이지를 "진짜 최신"으로 만들기 위한 seed 개수
  const SEED = Math.min(candidateIds.length, 120);
const seedIds = candidateIds.slice(0, SEED);

  // 1) seedIds detail을 병렬로 받아옴
  const seedDetails = await fetchDetailsBatch(ouid, seedIds, matchTypeNameById);

  // 2) matchDate 최신순 정렬
  seedDetails.sort((a, b) => {
    const ta = a.matchDate ? new Date(a.matchDate).getTime() : 0;
    const tb = b.matchDate ? new Date(b.matchDate).getTime() : 0;
    return tb - ta;
  });

  // 3) 정렬된 matchId 리스트 만들기
  const sortedSeedIds = seedDetails.map((x) => x.matchId);
const seedSet = new Set(sortedSeedIds);
const restIds = matchIdsAll.filter((id) => !seedSet.has(id));
const sortedIdsAll = [...sortedSeedIds, ...restIds];
  // 4) 이걸 matchIdsAll로 캐싱 (✅ 여기서 최신순 보장)
  setCache(cacheKey, { ouid, user, matchIdsAll: sortedIdsAll }, 300);

  // 5) 이번 요청(page) 응답은 seedDetails에서 offset/limit만 잘라서 반환
  const pageResults = seedDetails.slice(offset, offset + limit);
  const nextOffset = offset + pageResults.length;
  const hasMore = nextOffset < sortedIdsAll.length;

  return NextResponse.json({
    ouid,
    user,
    matches: pageResults,
    nextOffset,
    hasMore,
  });
}

    setCache(cacheKey, { ouid, user, matchIdsAll }, 300);

    // 4) 첫 페이지 detail만
    const pageIds = candidateIds;

    const results = await fetchDetailsBatch(ouid, pageIds, matchTypeNameById);
    const order = new Map(pageIds.map((id, i) => [id, i]));
    results.sort((a, b) => (order.get(a.matchId)! - order.get(b.matchId)!));



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