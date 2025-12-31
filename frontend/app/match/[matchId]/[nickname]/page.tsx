import MatchDetailClient from "./MatchDetailClient";

async function getMatchDetail(matchId: string) {
  const res = await fetch(`/api/match/${matchId}`, { cache: "no-store" });

  if (res.status === 503) return { error: "temporary_unavailable" as const };
  if (res.status === 404) return { error: "not_found" as const };
  if (!res.ok) return { error: "unknown" as const };

  return res.json();
}

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ matchId: string; nickname: string }>;
}) {
  const { matchId, nickname } = await params;
  const match = await getMatchDetail(matchId);

  if (!match || "error" in match) {
    if (match?.error === "temporary_unavailable") {
      return (
        <div className="max-w-3xl mx-auto p-6">
          <div className="bg-[#1B2230] border border-[#1C2230] rounded-xl p-6 text-white">
            <p className="text-lg font-semibold mb-2">
              넥슨 서버가 일시적으로 불안정합니다
            </p>
            <p className="text-sm text-gray-300 mb-4">
              잠시 후 다시 시도해주세요.
            </p>

            {/* Server Component라 onClick 못 씀 → 링크로 처리 */}
            <a
              href={`/match/${matchId}/${encodeURIComponent(nickname)}`}
              className="inline-block px-4 py-2 bg-[#34E27A] text-black rounded font-semibold hover:opacity-90"
            >
              다시 시도
            </a>
          </div>
        </div>
      );
    }

    if (match?.error === "not_found") {
      return (
        <div className="max-w-3xl mx-auto p-6">
          <div className="bg-[#1B2230] border border-[#1C2230] rounded-xl p-6 text-white">
            <p className="text-lg font-semibold mb-2">
              경기 정보를 찾을 수 없습니다
            </p>
            <p className="text-sm text-gray-300">
              삭제되었거나 잘못된 경기 ID입니다.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-[#1B2230] border border-[#1C2230] rounded-xl p-6 text-white">
          알 수 없는 오류가 발생했습니다.
        </div>
      </div>
    );
  }

  return <MatchDetailClient match={match} nickname={nickname} />;
}