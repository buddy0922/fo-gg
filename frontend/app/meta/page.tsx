"use client";

import { useEffect, useState } from "react";

const TEAM_COLOR_ICON: Record<string, string> = {
  // 국가
  대한민국: "/team-colors/korea.png",
  잉글랜드: "/team-colors/england.png",
  프랑스: "/team-colors/france.png",
  독일: "/team-colors/germany.png",
  스페인: "/team-colors/spain.png",
  브라질: "/team-colors/brazil.png",
  아르헨티나: "/team-colors/argentina.png",
  포르투갈: "/team-colors/portugal.png",
  네덜란드: "/team-colors/netherlands.png",
  이탈리아: "/team-colors/italy.png",

  // 클럽
  "레알 마드리드": "/team-colors/real-madrid.png",
  첼시: "/team-colors/chelsea.png",
  바르셀로나: "/team-colors/barcelona.png",
  "맨체스터 시티": "/team-colors/man-city.png",
  "파리 생제르맹": "/team-colors/psg.png",
  리버풀: "/team-colors/liverpool.png",
  아스널: "/team-colors/arsenal.png",
  토트넘: "/team-colors/tottenham.png",
  바이에른뮌헨: "/team-colors/bayern.png",
  유벤투스: "/team-colors/juventus.png",
  "AC 밀란": "/team-colors/ac-milan.png",
  인테르: "/team-colors/inter.png",
};

export default function MetaPage() {
  const [formations, setFormations] = useState<any[]>([]);
const [metaSource, setMetaSource] = useState("");
const [updatedAt, setUpdatedAt] = useState("");
const [teamColors, setTeamColors] = useState<any[]>([]);
const [teamMetaInfo, setTeamMetaInfo] = useState({
  source: "",
  baseDate: "",
  sampleSize: 0,
});
const [activeTab, setActiveTab] = useState<"" | "포메이션" | "팀컬러" | "선수">("");

  useEffect(() => {
  fetch("/api/meta/team-colors")
    .then((res) => res.json())
    .then((res) => {
      setTeamColors(res.data || []);
      setTeamMetaInfo({
        source: res.source,
        baseDate: res.baseDate,
        sampleSize: res.sampleSize,
      });
    })
    .catch(() => {
      setTeamColors([]);
    });
}, []);

  useEffect(() => {
    fetch("/api/meta/formations")
      .then((res) => res.json())
      .then((res) => {
  setFormations(res.data || []);
  setMetaSource(res.source || "");
  setUpdatedAt(res.updatedAt || "");
})
      .catch(() => {
        setFormations([]);
      });
  }, []);

  function getTierStyle(tier: string) {
  switch (tier) {
    case "SS":
      return {
        background: "#dc4747ff", // 빨강
        color: "#FFFFFF",
      };
    case "S":
      return {
        background: "#3B82F6", // 파랑
        color: "#FFFFFF",
      };
    case "A":
      return {
        background: "#14B8A6", // 청록
        color: "#FFFFFF",
      };
    case "B":
      return {
        background: "#FACC15", // 노랑
        color: "#FFFFFF",
      };
    case "C":
      return {
        background: "#9CA3AF", // 회색
        color: "#FFFFFF",
      };
    default:
      return {
        background: "#996748ff", // 동색(브론즈 느낌)
        color: "#FFFFFF",
      };
  }
}

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="edge-card p-6">
        <h1
          className="text-2xl font-extrabold mb-2"
          style={{ color: "var(--text-main)" }}
        >
          추천 메타
        </h1>
        <p className="text-sm" style={{ color: "var(--text-sub)" }}>
  상위 랭커 기준으로 집계한 포메이션, 플레이 스타일, 포지션 메타를 확인할 수 있는 페이지입니다.
</p>
<div className="text-xs mt-2" style={{ color: "var(--text-sub)" }}>
  * 현재는 랭커 기준 메타 구조를 먼저 연결하는 단계이며, 일부 데이터는 순차적으로 업데이트됩니다.
</div>
      </div>

      <div className="flex justify-center gap-3 mt-2">
  {["포메이션", "팀컬러", "선수"].map((item) => (
   <button
  key={item}
  type="button"
  onClick={() =>
    setActiveTab(item as "포메이션" | "팀컬러" | "선수")
  }
  className="liquid-button px-6 py-2.5 rounded-xl text-base font-semibold transition-all duration-200"
  style={{
    color: "var(--text-main)",
    opacity: activeTab === item ? 1 : 0.55,
    transform: activeTab === item ? "translateY(-1px) scale(1.03)" : "none",
    boxShadow:
      activeTab === item
        ? "0 10px 24px rgba(15,23,42,0.10)"
        : undefined,
  }}
>
  {item}
</button>
  ))}
</div>

      <div className="flex justify-center mt-6">
  <div className="w-full max-w-2xl">
    
        {(activeTab === "포메이션") && (
        <div className="edge-card p-5 animate-fadeIn">
          <div
            className="text-lg font-extrabold mb-4"
            style={{ color: "var(--text-main)" }}
          >
            메타 포메이션 TOP 3
          </div>

          <div className="text-xs mb-4" style={{ color: "var(--text-sub)" }}>
  출처: {metaSource || "ranker"} · 갱신: {updatedAt ? new Date(updatedAt).toLocaleString("ko-KR") : "-"}
</div>

          <div className="space-y-3">
            {formations.map((f, idx) => (
              <div
                key={f.formation}
                className="rounded-xl px-4 py-3"
                style={{ background: "var(--surface-strong)" }}
              >
                <div
                  className="font-semibold"
                  style={{ color: "var(--text-main)" }}
                >
                  {idx + 1}. {f.formation}
                </div>

                <div className="text-sm mt-1" style={{ color: "var(--text-sub)" }}>
                  이용률 {f.pickRate}% · 승률 {f.winRate}%
                </div>
              </div>
            ))}

            {formations.length === 0 && (
              <div
                className="rounded-xl px-4 py-3 text-sm"
                style={{ background: "var(--surface-strong)", color: "var(--text-sub)" }}
              >
                포메이션 데이터를 불러오는 중입니다.
              </div>
            )}
          </div>
        </div>
        )}
        

{(activeTab === "팀컬러") && (
        <div className="edge-card p-5 animate-fadeIn">
  <div
    className="text-lg font-extrabold"
    style={{ color: "var(--text-main)" }}
  >
    팀컬러 티어리스트
  </div>

  <div className="text-xs mb-3" style={{ color: "var(--text-sub)" }}>
  {teamMetaInfo.baseDate} · 상위 {teamMetaInfo.sampleSize.toLocaleString()}명 대상
</div>

  <div
  className="rounded-2xl overflow-hidden"
  style={{ background: "var(--surface-strong)" }}
>
  <div
    className="grid grid-cols-[36px_minmax(0,1fr)_56px_64px] items-center gap-3 px-4 py-3 text-xs font-semibold"
    style={{ color: "var(--text-sub)" }}
  >
    <div />
    <div>팀컬러</div>
    <div className="text-center">티어</div>
    <div className="text-center">사용률</div>
  </div>

  {teamColors.map((t, idx) => (
    <div
      key={t.teamColor}
      className="grid grid-cols-[36px_minmax(0,1fr)_56px_64px] items-center gap-3 px-4 py-3"
      style={{
        borderTop: idx === 0 ? "1px solid var(--border)" : "1px solid var(--border)",
      }}
    >
      <div
        className="h-9 w-9 rounded-full"
        style={{ background: "var(--border)" }}
      />

      <div
        className="font-semibold truncate"
        style={{ color: "var(--text-main)" }}
      >
        {t.teamColor}
      </div>

      <div className="flex justify-center">
  <div
    className="w-[25px] h-[30px] flex items-start justify-center pt-[4px] text-[13px] font-bold"
    style={{
      background: getTierStyle(t.tier).background,
      color: "#FFFFFF",
      clipPath: "polygon(0 0, 100% 0, 100% 78%, 50% 100%, 0 78%)",
    }}
  >
    {t.tier}
  </div>
</div>

      <div
        className="text-sm font-semibold text-center"
        style={{ color: "var(--text-sub)" }}
      >
        {t.pickRate}%
      </div>
    </div>
  ))}
</div>
</div>
)}
      </div>
      </div>

      {(activeTab === "선수") && (
      <div className="edge-card p-5 animate-fadeIn">
        <div
          className="text-lg font-extrabold mb-4"
          style={{ color: "var(--text-main)" }}
        >
          포지션별 메타 선수
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            className="rounded-xl p-4"
            style={{ background: "var(--surface-strong)" }}
          >
            <div className="font-bold mb-2" style={{ color: "var(--text-main)" }}>
              공격
            </div>
            <div className="space-y-2 text-sm" style={{ color: "var(--text-sub)" }}>
              <div>ST · 추후 데이터 연동</div>
              <div>LW · 추후 데이터 연동</div>
              <div>RW · 추후 데이터 연동</div>
            </div>
          </div>

          <div
            className="rounded-xl p-4"
            style={{ background: "var(--surface-strong)" }}
          >
            <div className="font-bold mb-2" style={{ color: "var(--text-main)" }}>
              미드필더
            </div>
            <div className="space-y-2 text-sm" style={{ color: "var(--text-sub)" }}>
              <div>CAM · 추후 데이터 연동</div>
              <div>CM · 추후 데이터 연동</div>
              <div>CDM · 추후 데이터 연동</div>
            </div>
          </div>

          <div
            className="rounded-xl p-4"
            style={{ background: "var(--surface-strong)" }}
          >
            <div className="font-bold mb-2" style={{ color: "var(--text-main)" }}>
              수비 / GK
            </div>
            <div className="space-y-2 text-sm" style={{ color: "var(--text-sub)" }}>
              <div>CB · 추후 데이터 연동</div>
              <div>WB · 추후 데이터 연동</div>
              <div>GK · 추후 데이터 연동</div>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}