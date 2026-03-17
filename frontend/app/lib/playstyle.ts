type PlayStyleStats = {
  shootTotal: number;
  effectiveShootTotal: number;
  goalTotal: number;
  shootInPenalty: number;
  shootOutPenalty: number;

  passTry: number;
  passSuccess: number;

  shortPassTry: number;
  shortPassSuccess: number;
  longPassTry: number;
  longPassSuccess: number;

  throughPassTry: number;
  throughPassSuccess: number;

  tackleTry: number;
  tackleSuccess: number;
};

export type PlayStyleResult = {
  key: string;
  title: string;
  description: string;
  subDescription: string;
};

function safeDiv(a: number, b: number) {
  return b > 0 ? a / b : 0;
}

export function detectPlayStyle(stats: PlayStyleStats): PlayStyleResult {
  const shootOutsideRatio = safeDiv(stats.shootOutPenalty, stats.shootTotal);
  const shootInsideRatio = safeDiv(stats.shootInPenalty, stats.shootTotal);
  const effectiveShootRatio = safeDiv(stats.effectiveShootTotal, stats.shootTotal);
  const goalEfficiency = safeDiv(stats.goalTotal, stats.shootTotal);

  const passSuccessRate = safeDiv(stats.passSuccess, stats.passTry);
  const shortPassRatio = safeDiv(stats.shortPassTry, stats.passTry);
  const longPassRatio = safeDiv(stats.longPassTry, stats.passTry);
  const throughPassRatio = safeDiv(stats.throughPassTry, stats.passTry);

  const shortPassSuccessRate = safeDiv(stats.shortPassSuccess, stats.shortPassTry);
  const longPassSuccessRate = safeDiv(stats.longPassSuccess, stats.longPassTry);
  const throughPassSuccessRate = safeDiv(
    stats.throughPassSuccess,
    stats.throughPassTry
  );

  const tackleRate = safeDiv(stats.tackleSuccess, stats.tackleTry);

  const styles = [
    {
      key: "the_zd",
      score: shootOutsideRatio * 3.2 + goalEfficiency * 1.2 + effectiveShootRatio * 0.6,
      title: "THE ZD형",
      description: "이상호급 THE ZD입니다.",
      subDescription: "박스 밖 슛 비율이 높고, 감아차기 성향이 강합니다.",
    },

    {
      key: "midrange_bomber",
      score: shootOutsideRatio * 2.8 + stats.shootTotal * 0.015,
      title: "중거리 폭격형",
      description: "굴리트 빙의한 중거리 폭격기입니다.",
      subDescription: "거리 안 재고 일단 때리는 성향이 강합니다.",
    },

    {
      key: "tikitaka",
      score:
        shortPassRatio * 2.4 +
        passSuccessRate * 1.8 +
        shortPassSuccessRate * 1.3 -
        longPassRatio * 0.7,
      title: "티키타카형",
      description: "08/09 바르샤급 티키타카 스타일입니다.",
      subDescription: "짧은 패스로 템포를 유지하며 경기를 풀어갑니다.",
    },

    {
      key: "possession",
      score: passSuccessRate * 2.2 + shortPassRatio * 1.5,
      title: "점유 지배형",
      description: "펩 과르디올라 빙의한 점유 축구입니다.",
      subDescription: "무리하지 않고 공을 오래 소유하는 성향입니다.",
    },

    {
      key: "counter",
      score:
        throughPassRatio * 2.2 +
        longPassRatio * 1.4 +
        throughPassSuccessRate * 1.2 +
        goalEfficiency * 0.8,
      title: "역습형",
      description: "레알 마드리드급 역습의 신입니다.",
      subDescription: "한 번에 전진하는 공격 전환이 강점입니다.",
    },

    {
      key: "direct_attack",
      score: longPassRatio * 2 + throughPassRatio * 1.5 + longPassSuccessRate * 1.2,
      title: "직선 전개형",
      description: "생각보다 손보다 발이 먼저 나가는 직진형입니다.",
      subDescription: "짧게 돌리기보다 빠르게 앞으로 보냅니다.",
    },

    {
      key: "longpass_builder",
      score: longPassRatio * 2.5 + longPassSuccessRate * 1.5,
      title: "롱패스 전개형",
      description: "알론소급 롱패스를 즐깁니다.",
      subDescription: "한 번의 긴 패스로 전개를 시작하는 스타일입니다.",
    },

    {
      key: "killer_pass",
      score: throughPassRatio * 2.8 + throughPassSuccessRate * 1.6,
      title: "킬패스형",
      description: "데브라이너급 킬패스를 노립니다.",
      subDescription: "침투패스를 통한 찬스 메이킹 빈도가 높습니다.",
    },

    {
      key: "box_poacher",
      score: shootInsideRatio * 2.8 + goalEfficiency * 1.4,
      title: "박스 침투형",
      description: "수아레스처럼 박스 안에서 해결합니다.",
      subDescription: "박스 안 슛 비중이 높고 마무리 지향적입니다.",
    },

    {
      key: "finisher",
      score: goalEfficiency * 3.3 + effectiveShootRatio * 1.1,
      title: "피니셔형",
      description: "호날두급 마무리 능력입니다.",
      subDescription: "많이 때리기보다, 찬스가 오면 확실히 넣습니다.",
    },

    {
      key: "shot_spammer",
      score: stats.shootTotal * 0.03 + effectiveShootRatio * 0.5,
      title: "난사형 공격가",
      description: "일단 때리고 보는 공격 본능형입니다.",
      subDescription: "슛 버튼이 닳아 있을 가능성이 높습니다.",
    },

    {
      key: "careful_attacker",
      score: goalEfficiency * 2 + effectiveShootRatio * 1.3 - stats.shootTotal * 0.01,
      title: "침착한 공격가",
      description: "기다릴 줄 아는 침착한 공격가입니다.",
      subDescription: "무리한 슈팅보다 좋은 찬스를 골라갑니다.",
    },

    {
      key: "catenaccio",
      score: tackleRate * 2.5 + (1 - goalEfficiency) * 0.3,
      title: "카테나치오형",
      description: "이탈리아식 카테나치오입니다.",
      subDescription: "공격보다 안정과 수비 완성도를 우선합니다.",
    },

    {
      key: "pressing_defender",
      score: stats.tackleTry * 0.03 + tackleRate * 1.8,
      title: "압박형 수비",
      description: "클롭식 게겐프레싱입니다.",
      subDescription: "상대에게 편하게 공을 돌릴 시간을 주지 않습니다.",
    },

    {
      key: "safe_defender",
      score: tackleRate * 2 + passSuccessRate * 0.8,
      title: "안정형 운영",
      description: "무너지지 않는 안정 지향형입니다.",
      subDescription: "크게 흔들리지 않는 운영이 특징입니다.",
    },

    {
      key: "balanced",
      score:
        1.2 -
        Math.abs(shortPassRatio - 0.5) -
        Math.abs(shootInsideRatio - 0.5) -
        Math.abs(passSuccessRate - 0.75),
      title: "밸런스형",
      description: "특정 스타일에 치우치지 않은 밸런스형입니다.",
      subDescription: "한 가지보다 전체 밸런스를 중시하는 타입입니다.",
    },
  ];

  styles.sort((a, b) => b.score - a.score);

const top1 = styles[0];
const top2 = styles[1];
const top3 = styles[2];

// 1등과 2등 점수 차이가 너무 작으면 → 밸런스형 처리
if (top2 && top1.score - top2.score < 0.15) {
  return {
    key: "balanced",
    title: "밸런스형",
    description: "특정 스타일에 치우치지 않은 올라운드 플레이입니다.",
    subDescription: "여러 공격 패턴을 섞어 사용하는 플레이 스타일입니다.",
  };
}

// 1등이 지나치게 튀는 스타일(난사형 등)일 때 보정
if (top1.key === "shot_spammer" && top2 && top2.score > top1.score * 0.85) {
  return top2;
}

// 기본
return top1;
}

export function getStyleStrengthWeakness(stats: any) {
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  const safe = (a: number, b: number) => (b > 0 ? a / b : 0);

  // 🔥 슛 정확도
  const shotAcc = safe(stats.effectiveShootTotal, stats.shootTotal);
  if (shotAcc > 0.7) strengths.push("결정력이 매우 뛰어납니다");
  else if (shotAcc < 0.4) weaknesses.push("슈팅 정확도가 낮은 편입니다");

  // 🔥 패스 정확도
  const passAcc = safe(stats.passSuccess, stats.passTry);
  if (passAcc > 0.85) strengths.push("패스 성공률이 매우 안정적입니다");
  else if (passAcc < 0.7) weaknesses.push("패스 미스가 많은 편입니다");

  // 🔥 스루패스 비중
  const throughRatio = safe(stats.throughPassTry, stats.passTry);
  if (throughRatio > 0.25) strengths.push("침투 패스를 적극적으로 활용합니다");
  else if (throughRatio < 0.1) weaknesses.push("침투 패스 활용이 적은 편입니다");

  // 🔥 롱패스 비중
  const longRatio = safe(stats.longPassTry, stats.passTry);
  if (longRatio > 0.2) strengths.push("롱패스 전개를 자주 활용합니다");

  // 🔥 박스 안 슛 비중
  const inBoxRatio = safe(stats.shootInPenalty, stats.shootTotal);
  if (inBoxRatio > 0.8) strengths.push("박스 안에서 확실하게 마무리합니다");
  else if (inBoxRatio < 0.5) weaknesses.push("무리한 중거리 시도가 많습니다");

  // 🔥 수비 성공률
  const tackleRate = safe(stats.tackleSuccess, stats.tackleTry);
  if (tackleRate > 0.7) strengths.push("수비 성공률이 안정적입니다");
  else if (tackleRate < 0.4) weaknesses.push("수비 성공률이 낮은 편입니다");

  // 🔥 점유율
  const possession = stats.possession ?? 0;
  if (possession > 55) strengths.push("경기 주도권을 잡는 플레이를 합니다");
  else if (possession < 45) weaknesses.push("상대에게 주도권을 내주는 경우가 많습니다");

  // 🔥 드리블
  if ((stats.dribble ?? 0) > 80) strengths.push("개인기 활용이 활발합니다");

  return {
    strengths: strengths.slice(0, 3),
    weaknesses: weaknesses.slice(0, 3),
  };
}

export function getTacticRecommendation({
  playStyle,
  formation,
  weakPositions,
}: {
  playStyle: any;
  formation: string;
  weakPositions: { spPosition: number; avgRating: number }[];
}) {
  const rec: {
    summary: string;
    details: string[];
  } = {
    summary: "",
    details: [],
  };

  // 🔥 스타일 기반
  if (playStyle.key === "counter") {
    rec.summary = "역습 중심 전술이 가장 잘 맞습니다.";
    rec.details.push("수비 라인을 살짝 내리고 빠른 전개에 집중하세요.");
  } else if (playStyle.key === "tikitaka") {
    rec.summary = "점유율 기반 빌드업 전술이 잘 맞습니다.";
    rec.details.push("짧은 패스 + 중앙 전개를 유지하세요.");
  } else if (playStyle.key === "cross") {
    rec.summary = "측면 활용 전술이 효과적입니다.";
    rec.details.push("윙 + 풀백 오버래핑을 적극 활용하세요.");
  } else {
    rec.summary = "현재 플레이 스타일을 유지하면서 보완이 필요합니다.";
  }

  // 🔥 포메이션 기반
  if (formation === "4-2-3-1") {
    rec.details.push("CAM 중심 공격 전개를 강화해보세요.");
  } else if (formation === "4-3-3") {
    rec.details.push("윙어 침투와 측면 공간 활용이 중요합니다.");
  } else if (formation === "4-4-2") {
    rec.details.push("투톱 간 연계 플레이를 적극 활용하세요.");
  }

  // 🔥 약점 포지션 기반
  if (weakPositions.length > 0) {
    const weak = weakPositions[0];

    rec.details.push("가장 취약한 포지션 보완이 필요합니다.");
  }

  return rec;
}