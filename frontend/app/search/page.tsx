import Link from "next/link";
import SearchBox from "@/app/components/SearchBox";

/* ===============================
   API 호출
================================ */
async function getSearch(nickname: string) {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const res = await fetch(
    `${baseUrl}/api/search?nickname=${encodeURIComponent(nickname)}`,
    { cache: "no-store" }
  );

  if (!res.ok) return null;
  return res.json();
}

/* ===============================
   승 / 무 / 패 색상
================================ */
function resultBarColor(result: "승" | "패" | "무") {
  switch (result) {
    case "승":
      return "bg-[#34E27A]";
    case "패":
      return "bg-red-400";
    case "무":
      return "bg-yellow-300";
  }
}

/* ===============================
   승률 / 연승 계산
================================ */
function getSummary(matches: any[]) {
  const recent = matches.slice(0, 10);

  let win = 0;
  recent.forEach((m) => {
    if (m.result === "승") win += 1;
  });

  const winRate =
    recent.length > 0 ? Math.round((win / recent.length) * 100) : 0;

  let streak = 0;
  let streakType: "승" | "패" | "무" | null = null;

  for (const m of recent) {
    if (!streakType) {
      streakType = m.result;
      streak = 1;
    } else if (m.result === streakType) {
      streak += 1;
    } else {
      break;
    }
  }

  return { winRate, streak, streakType };
}

/* ===============================
   날짜 포맷
================================ */
function formatDate(dateString?: string) {
  if (!dateString) return "날짜 정보 없음";
  const d = new Date(dateString);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ nickname?: string }>;
}) {
  const { nickname } = await searchParams;

  if (!nickname) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-white space-y-6">
        <SearchBox />
        <p className="text-gray-400">닉네임을 입력해 주세요.</p>
      </div>
    );
  }

  const data = await getSearch(nickname);

  if (!data || data.error) {
  return (
    <div className="max-w-3xl mx-auto p-6 text-white space-y-6">
      <SearchBox initialValue={nickname} />

      <div className="bg-[#1B2230] border border-[#1C2230] rounded-xl p-4">
        {data?.error === "temporary_unavailable" ? (
          <>
            <h1 className="font-bold text-lg">
              넥슨 서버가 일시적으로 불안정합니다
            </h1>
            <p className="text-gray-400 mt-1">
              잠시 후 다시 시도해 주세요.
            </p>

            {/* 재시도 버튼 */}
            <Link
              href={`/search?nickname=${encodeURIComponent(nickname)}`}
              className="inline-block mt-4 px-4 py-2 rounded bg-[#34E27A] text-black font-semibold hover:opacity-90"
            >
              다시 시도
            </Link>
          </>
        ) : (
          <>
            <h1 className="font-bold text-lg">
              유저를 찾을 수 없습니다
            </h1>
            <p className="text-gray-400 mt-1">
              닉네임: {nickname}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

  const matches = data.matches ?? [];
  const { winRate, streak, streakType } = getSummary(matches);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6 text-white">
      {/* 🔍 검색창 */}
      <SearchBox initialValue={nickname} />

      {/* ===============================
          유저 요약 카드
      =============================== */}
      <div className="bg-[#1B2230] rounded-xl p-6 space-y-4 border border-[#1C2230]">
        <h1 className="text-2xl font-extrabold">{nickname}</h1>

        <div className="text-sm text-gray-300">
          승률 <span className="text-white font-semibold">{winRate}%</span>
          {streakType && (
            <>
              {" "}
              ·{" "}
              <span className="font-semibold">
                {streak}
                {streakType === "승"
                  ? "연승"
                  : streakType === "패"
                  ? "연패"
                  : "무"}
                중
              </span>
            </>
          )}
        </div>

        <div className="flex gap-1">
          {matches.slice(0, 10).map((m: any, idx: number) => (
            <div
              key={idx}
              className={`h-2 flex-1 rounded ${resultBarColor(m.result)}`}
            />
          ))}
        </div>
      </div>

      {/* ===============================
          전적 카드 리스트 (STEP 4C)
      =============================== */}
      <div className="space-y-6">
        {matches.map((m: any) => (
          <Link
  key={m.matchId}
  href={`/match/${m.matchId}/${encodeURIComponent(nickname)}`}
  className="block"
>
            <div
              className={`
                relative
                rounded-2xl
                px-6
                py-5
                space-y-3
                transition-all
                duration-200
                hover:-translate-y-0.5
                hover:shadow-lg
                ${
                  m.result === "승"
                    ? "bg-gradient-to-r from-[#0f2f1f] to-[#134a31]"
                    : m.result === "패"
                    ? "bg-gradient-to-r from-[#2b0f12] to-[#45161a]"
                    : "bg-gradient-to-r from-[#2e2a12] to-[#4a4318]"
                }
              `}
            >
              {/* 좌측 컬러 바 */}
              <div
                className={`
                  absolute left-0 top-0 h-full w-1.5 rounded-l-2xl
                  ${
                    m.result === "승"
                      ? "bg-[#34E27A]"
                      : m.result === "패"
                      ? "bg-red-400"
                      : "bg-yellow-300"
                  }
                `}
              />

              {/* 상단 메타 정보 */}
              <div className="text-xs text-gray-300">
                {formatDate(m.matchDate)} · 공식 경기
              </div>

              {/* 메인 정보 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-xl font-extrabold text-white w-10 text-center">
                    {m.result}
                  </div>
                  <div>
                    <div className="text-base font-semibold text-white">
                      vs {m.opponent}
                    </div>
                    <div className="text-sm text-gray-300">
                      {m.score}
                    </div>
                  </div>
                </div>

                <div className="text-sm text-gray-300">
                  상세보기 →
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}