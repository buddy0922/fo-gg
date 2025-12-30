import spidMeta from "@/public/data/spid.json";
import seasonMeta from "@/public/data/seasonid.json";
import { parseSpId } from "./spid";

type SpidRow = {
  id: number;
  name: string;
};

type SeasonRow = {
  seasonId: number;
  className?: string;
  seasonName?: string;
  name?: string;
};

const spidList = spidMeta as unknown as SpidRow[];
const seasonList = seasonMeta as unknown as SeasonRow[];

export function getPlayerDisplay(spId: number) {
  const { seasonId } = parseSpId(spId);

  const player = spidList.find((p) => p.id === spId);

  const season = seasonList.find((s) => s.seasonId === seasonId);
  const seasonName =
    season?.seasonName ||
    season?.className ||
    season?.name ||
    `시즌 ${seasonId}`;

  return {
    name: player?.name ?? `선수ID ${spId}`,
    season: seasonName,
  };
}