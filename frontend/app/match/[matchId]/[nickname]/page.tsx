import { notFound } from "next/navigation";
import MatchDetailClient from "./MatchDetailClient";

async function getMatchDetail(matchId: string) {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const res = await fetch(
    `${baseUrl}/api/match/${matchId}`,
    { cache: "no-store" }
  );

  // ✅ 넥슨 서버 장애
  if (res.status === 503) {
    return { error: "temporary_unavailable" };
  }

  // ✅ 경기 없음 / 잘못된 matchId
  if (res.status === 404) {
    return { error: "not_found" };
  }

  if (!res.ok) {
    return { error: "unknown" };
  }

  return res.json();
}

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ matchId: string; nickname: string }>;
}) {
  const { matchId, nickname } = await params;

  const match = await getMatchDetail(matchId);

  if (!match || match.error) {
  if (match?.error === "temporary_unavailable") {
    return (
      <div className="bg-[#1B2230] border border-[#1C2230] rounded-xl p-4">
        <p className="text-lg font-semibold mb-2">
          넥슨 서버가 일시적으로 불안정합니다
        </p>
        <p className="text-sm mb-4">
          잠시 후 다시 시도해주세요.
        </p>

        <button
          onClick={() => location.reload()}
          className="px-4 py-2 bg-[#34E27A] text-black rounded font-semibold"
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (match?.error === "not_found") {
    return (
      <div className="bg-[#1B2230] border border-[#1C2230] rounded-xl p-4">
        <p className="text-lg font-semibold mb-2">
          경기 정보를 찾을 수 없습니다
        </p>
        <p className="text-sm">
          삭제되었거나 잘못된 경기 ID입니다.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#1B2230] border border-[#1C2230] rounded-xl p-4">
      알 수 없는 오류가 발생했습니다.
    </div>
  );
}

  // ✅ 정상일 때 반드시 이게 있어야 함
  return (
    <MatchDetailClient
      match={match}
      nickname={nickname}
    />
  );
}