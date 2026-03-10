"use client";

import Image from "next/image";
import Link from "next/link";
import SearchBox from "@/app/components/SearchBox";
import ShotHeatmap from "./ShotHeatmap";
import { TIER_IMAGE } from "@/app/lib/tier";
import LossDiagnosis from "./LossDiagnosis";

export default function MatchDetailClient({
  match,
  nickname,
}: {
  match: any;
  nickname: string;
}) {
  
  
  /* ===============================
     경기 기본 정보
  ============================== */
  const [rawHome, rawAway] = match.matchInfo;

  const searchNickname = nickname.trim().toLowerCase();
  const homeNick = String(rawHome.nickname ?? "").trim().toLowerCase();
  const awayNick = String(rawAway.nickname ?? "").trim().toLowerCase();

  const searchSide =
    homeNick === searchNickname
      ? "home"
      : awayNick === searchNickname
      ? "away"
      : "home";

  const leftTeam = searchSide === "home" ? rawHome : rawAway;
  const rightTeam = searchSide === "home" ? rawAway : rawHome;

  const myNickname = leftTeam.nickname;
  const enemyNickname = rightTeam.nickname;
  const myOuid = leftTeam.ouid;
  const enemyOuid = rightTeam.ouid;

  /* ===============================
     티어 정보 (이미 page.tsx에서 조회됨)
  ============================== */
  const myTierName = match.myTierName;
  const enemyTierName = match.enemyTierName;

  const myTierImg =
    typeof match.myHighestDivision === "number"
      ? TIER_IMAGE[match.myHighestDivision]
      : undefined;

  const enemyTierImg =
    typeof match.enemyHighestDivision === "number"
      ? TIER_IMAGE[match.enemyHighestDivision]
      : undefined;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* 🔍 전적 검색창 */}
      <SearchBox />

      {/* ===============================
          상단 스코어
      ============================== */}
      <div
  className="border rounded-xl p-4"
  style={{ background: "var(--surface)", borderColor: "var(--border)" }}
>
        <div className="flex items-center">
          {/* 왼쪽: 전적검색 유저 */}
          <div className="flex-1 pr-10 mt-6 flex flex-col items-end">
            <Link
  href={
    myOuid
      ? `/search?ouid=${encodeURIComponent(myOuid)}`
      : `/search?nickname=${encodeURIComponent(myNickname)}`
  }
  className="text-2xl font-extrabold hover:underline"
  style={{ color: "var(--text-main)" }}
>
  {myNickname}
</Link>

            {myTierName && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm" style={{ color: "var(--text-sub)" }}>
  {myTierName}
</span>
                {myTierImg && (
                  <Image src={myTierImg} alt="my-tier" width={22} height={22} />
                )}
              </div>
            )}
          </div>

          {/* 스코어 */}
          <div
  className="mt-6 text-4xl font-extrabold px-6 whitespace-nowrap"
  style={{ color: "var(--text-main)" }}
>
            {leftTeam.shoot?.goalTotalDisplay ?? 0}
            {" : "}
            {rightTeam.shoot?.goalTotalDisplay ?? 0}
          </div>

          {/* 오른쪽: 상대 유저 */}
          <div className="flex-1 pl-10 mt-6 flex flex-col items-start">
            <Link
  href={
    enemyOuid
      ? `/search?ouid=${encodeURIComponent(enemyOuid)}`
      : `/search?nickname=${encodeURIComponent(enemyNickname)}`
  }
  className="text-2xl font-extrabold hover:underline"
  style={{ color: "var(--text-main)" }}
>
  {enemyNickname}
</Link>

            {enemyTierName && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm" style={{ color: "var(--text-sub)" }}>
  {enemyTierName}
</span>
                {enemyTierImg && (
                  <Image
                    src={enemyTierImg}
                    alt="enemy-tier"
                    width={22}
                    height={22}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        <div className="text-center text-sm mt-2" style={{ color: "var(--text-sub)" }}>
  {new Date(match.matchDate).toLocaleString("ko-KR")}
</div>
      </div>

      <LossDiagnosis my={leftTeam} enemy={rightTeam} />

      {/* ===============================
          히트맵
      ============================== */}
      <ShotHeatmap home={rawHome} away={rawAway} searchSide={searchSide} />
    </div>
  );
}