// lib/nexon.ts
import api from "@/lib/api";

export async function fetchMatchDetail(matchId: string) {
  try {
    const res = await api.get("/match-detail", {
      params: { matchid: matchId },
    });
    return res.data;
  } catch (err: any) {
    const code = err?.response?.data?.error?.name;

    if (code === "OPENAPI00007") {
      return { error: "temporary_unavailable" as const };
    }

    if (err?.response?.status === 404) {
      return { error: "not_found" as const };
    }

    return { error: "unknown" as const };
  }
}