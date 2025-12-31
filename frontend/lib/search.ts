// frontend/lib/search.ts
import api from "@/lib/api";

async function getDivisionMeta() {
  const res = await fetch(
    "https://open.api.nexon.com/static/fconline/meta/division.json",
    { cache: "no-store" }
  );
  if (!res.ok) return null;
  return res.json();
}

export async function fetchSearch(nickname: string) {
  const clean = decodeURIComponent(nickname).trim();

  // 1) nickname -> ouid
  const idResp = await api.get("/id", { params: { nickname: clean } });
  const ouid: string | undefined = idResp.data?.ouid;

  if (!ouid) {
    return { error: "user_not_found" };
  }

  // 2) max division
  const maxDivResp = await api.get("/user/maxdivision", { params: { ouid } });
  const list = Array.isArray(maxDivResp.data) ? maxDivResp.data : [];
  const official = list.filter((d: any) => d.matchType === 50);
  const highestDivision =
    official.length > 0
      ? Math.max(...official.map((d: any) => d.division))
      : undefined;

  // 3) divisionId -> name
  const meta = await getDivisionMeta();
  const highestDivisionName =
    highestDivision && Array.isArray(meta)
      ? meta.find((d: any) => d.divisionId === highestDivision)?.divisionName
      : undefined;

  // 4) recent matches
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

  return {
    ouid,
    user: { nickname: clean, highestDivision, highestDivisionName },
    matches: results,
  };
}