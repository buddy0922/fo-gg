// app/lib/shotExplain.ts

export type ShotLike = {
  inPenalty?: boolean;
  goalTime?: number;   // seconds (있으면)
  type?: number;       // 코드(있으면)
};

export function explainShotLine(opts: {
  isGoal: boolean;
  isForMe: boolean;          // 전적검색 유저 기준
  inPenalty?: boolean;
  distM?: number | null;     // 골대까지 거리(너가 이미 계산함)
  minute?: number | null;    // virtual minute(너가 이미 있음)
  shotType?: number | null;  // shot.type
}) {
  const { isGoal, isForMe, inPenalty, distM, minute } = opts;

  const side = isForMe ? "득점" : "실점";
  const when =
    typeof minute === "number"
      ? minute >= 90 ? "막판" : minute >= 70 ? "후반" : minute >= 45 ? "중후반" : "전반"
      : "경기";

  const box = inPenalty ? "박스 안" : "박스 밖";
  const d = typeof distM === "number" ? distM : null;

  // 1) 골이면
  if (isGoal) {
    if (d !== null && d <= 8) return `🧠 ${side}: ${when} ${box}에서 침착하게 마무리한 확률 높은 골`;
    if (d !== null && d <= 16) return `🧠 ${side}: ${when} ${box}에서 결정력으로 만든 좋은 찬스 골`;
    if (d !== null && d >= 20) return `🧠 ${side}: ${when} 장거리(중거리) 한 방이 터진 장면`;
    return `🧠 ${side}: ${when} 득점/실점으로 연결된 핵심 장면`;
  }

  // 2) 골 아니면(슈팅)
  if (d !== null && d <= 10) return `🧠 찬스: ${when} ${box}에서 아쉬운 결정적 찬스`;
  if (!inPenalty && d !== null && d >= 18) return `🧠 시도: ${when} ${box}에서 무리한 중거리 시도`;
  if (inPenalty) return `🧠 시도: ${when} ${box}에서 한 번 더 정확도가 필요했던 슈팅`;
  return `🧠 시도: ${when} ${box}에서 나온 일반 슈팅`;
}