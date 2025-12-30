export function parseSpId(spId: number) {
  const spIdStr = spId.toString();

  // FC온라인 spId 구조: 시즌ID(3자리) + 선수ID
  const seasonId = Number(spIdStr.slice(0, 3));
  const playerId = Number(spIdStr.slice(3));

  return { seasonId, playerId };
}