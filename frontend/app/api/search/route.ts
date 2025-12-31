import { NextResponse } from "next/server";
import api from "@/lib/api";
import { getCache, setCache } from "@/app/lib/serverCache";

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
    return NextResponse.json(
      { error: "nickname_required" },
      { status: 400 }
    );
  }

  

  const nickname = rawNickname.trim();
const normalizedNickname = nickname.toLowerCase();

  // ✅ 1️⃣ 캐시 키 생성
  const cacheKey = `search:${normalizedNickname}`;

  // ✅ 2️⃣ 캐시 먼저 확인
  const cached = getCache(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  try {
    /* ===============================
       1️⃣ nickname → ouid
    =============================== */
    let ouid: string | undefined;

    try {
      const idResp = await api.get("/id", { params: { nickname } });
      ouid = idResp.data?.ouid;
    } catch (err: any) {
      const apiError = err?.response?.data?.error?.name;

      if (apiError === "OPENAPI00007") {
        return NextResponse.json(
          { error: "temporary_unavailable" },
          { status: 503 }
        );
      }

      console.error("ID API ERROR:", err?.response?.data ?? err);
      return NextResponse.json(
        { error: "upstream_error" },
        { status: 500 }
      );
    }

    if (!ouid) {
      return NextResponse.json(
        { error: "user_not_found" },
        { status: 404 }
      );
    }

    /* ===============================
       2️⃣ 역대 최고 티어 (공식 경기)
    =============================== */
    const maxDivResp = await api.get("/user/maxdivision", {
      params: { ouid },
    });

    const list = Array.isArray(maxDivResp.data)
      ? maxDivResp.data
      : [];

    const official = list.filter((d: any) => d.matchType === 50);

    const highestDivision =
      official.length > 0
        ? Math.max(...official.map((d: any) => d.division))
        : undefined;

    /* ===============================
       3️⃣ divisionId → 이름
    =============================== */
    const meta = await getDivisionMeta();
    let highestDivisionName: string | undefined;

    if (highestDivision && Array.isArray(meta)) {
      highestDivisionName = meta.find(
        (d: any) => d.divisionId === highestDivision
      )?.divisionName;
    }

    /* ===============================
       4️⃣ 최근 경기
    =============================== */
    const matchResp = await api.get("/user/match", {
      params: { ouid, matchtype: 50, offset: 0, limit: 10 },
    });

    const matchIds: string[] = matchResp.data || [];
    const results: any[] = [];

    for (const matchId of matchIds) {
      try {
        const detailResp = await api.get("/match-detail", {
          params: { matchid: matchId },
        });

        const match = detailResp.data;
        const infos = match?.matchInfo;
        if (!infos || infos.length < 2) continue;

        const me = infos.find((p: any) => p.ouid === ouid);
        const enemy = infos.find((p: any) => p.ouid !== ouid);
        if (!me || !enemy) continue;

        const myGoal = me.shoot?.goalTotalDisplay ?? 0;
        const enemyGoal = enemy.shoot?.goalTotalDisplay ?? 0;

        results.push({
          matchId,
          result:
            myGoal > enemyGoal ? "승" :
            myGoal < enemyGoal ? "패" : "무",
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
  user: {
    nickname,
    highestDivision,
    highestDivisionName,
  },
  matches: results,
};

// ✅ 3️⃣ 캐시에 저장 (60초)
setCache(cacheKey, response, 60);

return NextResponse.json(response);

  } catch (err: any) {
    const apiError = err?.response?.data?.error?.name;

    if (apiError === "OPENAPI00007") {
      return NextResponse.json(
        { error: "temporary_unavailable" },
        { status: 503 }
      );
    }

    console.error("SEARCH API ERROR:", err?.response?.data ?? err);
    return NextResponse.json(
      { error: "upstream_error" },
      { status: 500 }
    );
  }
}

