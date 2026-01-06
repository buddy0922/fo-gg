"use client";

type Team = {
  nickname?: string;
  matchDetail?: {
    matchResult?: "승" | "패" | "무" | string;
    possession?: number;
  };
  shoot?: {
    shootTotal?: number;
    effectiveShootTotal?: number;
    goalTotalDisplay?: number;
    goalTotal?: number;
  };
  shootDetail?: Array<{
    goalTime?: number; // seconds
    inPenalty?: boolean;
    result?: number;
    assist?: boolean;
    type?: number;
  }>;
  pass?: {
    throughPassTry?: number;
    crossTry?: number;
  };
};

type Reason = {
  key: string;
  title: string;
  desc: string;
  priority: number;
  rec: string[];
};

function num(v: any, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function clamp01(x: number) {
  if (x < 0) return 0;
  if (x > 1) return 1;
  return x;
}

function getGoalsFor(team: Team) {
  const gDisplay = num(team.shoot?.goalTotalDisplay, NaN);
  if (!Number.isNaN(gDisplay)) return gDisplay;
  return num(team.shoot?.goalTotal, 0);
}

function countLateConceded(enemy: Team) {
  const details = enemy.shootDetail ?? [];
  const late = details.filter((s) => num(s.goalTime, 0) >= 70 * 60).length;
  return late;
}

function outsideShotRatio(team: Team) {
  const details = team.shootDetail ?? [];
  if (details.length === 0) return 0;
  const outside = details.filter((s) => s.inPenalty === false).length;
  return outside / details.length;
}

function buildReasons(my: Team, enemy: Team): Reason[] {
  const myGoals = getGoalsFor(my);
  const enemyGoals = getGoalsFor(enemy);

  const myShoot = num(my.shoot?.shootTotal, 0);
  const myEff = num(my.shoot?.effectiveShootTotal, 0);
  const myPoss = num(my.matchDetail?.possession, 0);

  const enemyEff = num(enemy.shoot?.effectiveShootTotal, 0);

  const myThrough = num(my.pass?.throughPassTry, 0);
  const myCrossTry = num(my.pass?.crossTry, 0);

  const conceded = enemyGoals;

  const reasons: Reason[] = [];

  // ① 결정력/마무리
  if (myEff >= 5 && myGoals <= 1) {
    reasons.push({
      key: "finishing",
      title: "마무리 효율 개선",
      desc: "유효 슈팅 대비 득점 전환이 아쉬웠습니다. ‘좋은 위치에서 한 번에’가 핵심이에요.",
      priority: 90,
      rec: [
        "박스 안(특히 페널티 스팟/6야드)에서 마무리 비중을 늘려보세요.",
        "각도 없는 슈팅 대신 컷백·침투 후 ‘1~2터치 마무리’를 우선하세요.",
      ],
    });
  }

  // ② 슈팅 대비 득점 전환율
  const conv = myShoot > 0 ? myGoals / myShoot : 0;
  if (myShoot >= 8 && conv < 0.15) {
    reasons.push({
      key: "conversion",
      title: "찬스의 질(결정적 찬스) 만들기",
      desc: `슈팅 ${myShoot}회 대비 득점 ${myGoals}. 슈팅 수보다 ‘확률 높은 찬스’가 필요했습니다.`,
      priority: 80,
      rec: [
        "무리한 중거리 대신, 박스 모서리→중앙 1~2번 패스로 확실한 찬스를 만들어요.",
        "슛 타이밍을 0.5초 늦춰 GK 위치/각을 확인하고 마무리하세요.",
      ],
    });
  }

  // ③ 점유율 대비 찬스 부족
  if (myPoss >= 55 && myShoot <= 6) {
    reasons.push({
      key: "possession_no_chance",
      title: "점유율을 ‘위협’으로 바꾸기",
      desc: "공은 오래 가졌지만 슈팅/결정적 장면으로 이어지는 속도가 부족했습니다.",
      priority: 70,
      rec: [
        "측면에서만 돌리지 말고, 하프스페이스(박스 모서리)로 공을 운반하는 루트를 늘리세요.",
        "CAM/CF에 전진 움직임을 주고, 스루패스·침투 패턴 비중을 올려보세요.",
      ],
    });
  }

  // ④ 후반 실점 집중(근사)
  if (conceded >= 2) {
    const lateConceded = countLateConceded(enemy);
    const lateShare = conceded > 0 ? clamp01(lateConceded / conceded) : 0;
    if (lateShare >= 0.5) {
      reasons.push({
        key: "late_concede",
        title: "후반 운영 안정화",
        desc: "70분 이후 위험 상황이 늘어난 편입니다. ‘라인·압박 강도 조절’이 필요해요.",
        priority: 85,
        rec: [
          "70분 이후엔 라인/압박을 한 단계 낮추고, ‘패스길 차단→안전한 수비’로 전환하세요.",
          "교체카드는 수비·미드 체력 보강용으로 1~2장을 남겨두세요.",
        ],
      });
    }
  }

  // ⑤ 박스 밖 슈팅 의존(근사)
  const outRatio = outsideShotRatio(my);
  if (myShoot >= 6 && outRatio >= 0.4) {
    reasons.push({
      key: "outside_shot",
      title: "슈팅 위치 최적화",
      desc: "박스 밖 시도가 많으면 기대득점이 떨어지기 쉽습니다. 한 번 더 들어가서 쏘는 게 좋아요.",
      priority: 55,
      rec: [
        "박스 안으로 한 번 더 ‘운반’ 후 슈팅하는 습관을 들이세요.",
        "중거리 찬스는 ‘확실한 각+주발’일 때만 선택하세요.",
      ],
    });
  }

  // ⑥ 침투/스루 부족
  if (myThrough <= 3 && myShoot >= 7) {
    reasons.push({
      key: "no_through",
      title: "침투 패턴 추가",
      desc: "슈팅은 나왔지만 ‘뒤 공간 침투’로 마무리하는 장면이 적었습니다.",
      priority: 60,
      rec: [
        "측면으로 수비를 벌린 뒤 중앙 침투 스루패스를 2~3회 더 시도해보세요.",
        "ST/CF는 뒤 공간, CAM은 전진 위치를 잡게 운영해보세요.",
      ],
    });
  }

  // ⑦ 유효 슈팅 허용
  if (enemyEff >= 5) {
    reasons.push({
      key: "allow_eff",
      title: "위험 찬스 허용 줄이기",
      desc: "상대 유효 슈팅이 많았습니다. 중앙 차단과 풀백 밸런스가 포인트예요.",
      priority: 75,
      rec: [
        "상대가 중앙 전개할 때 CDM이 ‘패스길’을 먼저 막는 각을 잡아주세요.",
        "풀백이 동시에 올라가지 않게 한쪽은 대기(Stay back)로 밸런스를 맞춰보세요.",
      ],
    });
  }

  // ⑧ 크로스 효율(근사)
  if (myCrossTry >= 6 && myGoals <= 1) {
    reasons.push({
      key: "cross_low",
      title: "크로스 패턴 다변화",
      desc: "크로스 시도는 많았지만 득점으로 이어지는 효율이 아쉬웠습니다.",
      priority: 45,
      rec: [
        "무작정 올리기보다 컷백(낮은 크로스)·되돌림 패턴 비중을 늘려보세요.",
        "박스 안 숫자를 먼저 만들고(2~3명) 타이밍을 잡아 올리세요.",
      ],
    });
  }

  return reasons;
}

export default function LossDiagnosis({ my, enemy }: { my: Team; enemy: Team }) {
  const myResult = (my.matchDetail?.matchResult ?? "") as string;

  // if (myResult !== "패") return null;

  const reasons = buildReasons(my, enemy)
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 3);

  if (reasons.length === 0) {
    return (
      <div className="bg-[#1B2230] border border-[#1C2230] rounded-xl p-4">
        <div className="text-sm text-gray-300">
          코치 리포트를 만들기엔 데이터가 조금 부족했어요. (슈팅/패스 이벤트가 적음)
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1B2230] border border-[#1C2230] rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-extrabold">코치 리포트 · 개선 포인트 TOP 3</h2>
        <span className="text-xs text-gray-400">경기 결과: {myResult || "-"}</span>
      </div>

      <div className="text-sm text-gray-300">
        이번 경기 데이터를 바탕으로, 다음 경기에서 바로 적용 가능한 체크리스트를 정리했어요.
      </div>

      <div className="space-y-3">
        {reasons.map((r, idx) => (
          <div key={r.key} className="rounded-xl bg-black/20 p-4 border border-white/5">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 h-6 w-6 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold">
                {idx + 1}
              </div>

              <div className="flex-1">
                <div className="font-semibold">{r.title}</div>
                <div className="text-sm text-gray-300 mt-1">{r.desc}</div>

                <div className="mt-3">
                  <div className="text-xs font-semibold text-gray-200 mb-1">
                    ▶ 다음 경기 체크리스트
                  </div>
                  <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1">
                    {r.rec.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>

                <div className="mt-3 text-xs text-gray-400">
                  * 이 리포트는 경기 기록(슈팅/점유/패스 등) 기반의 자동 요약입니다.
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}