import MatchDetailClient from "./MatchDetailClient";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/* ===============================
   API 호출 (Server-safe)
================================ */
async function getMatchDetail(matchId: string) {
  const h = await headers();

  const host =
    h.get("x-forwarded-host") ??
    h.get("host") ??
    "localhost:3000";

  const proto =
    h.get("x-forwarded-proto") ??
    "http";

  const baseUrl = `${proto}://${host}`;

  const res = await fetch(`${baseUrl}/api/match/${matchId}`, {
    cache: "no-store",
  });

  // ✅ 실패면 body까지 읽어서 같이 넘기기
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return {
      error: "unknown" as const,
      status: res.status,
      body: text.slice(0, 500), // 너무 길면 잘라
      baseUrl,
    };
  }

  return res.json();
}

/* ===============================
   Page
================================ */
export default async function MatchDetailPage({
  params,
}: {
  params: { matchId: string; nickname: string };
}) {
  const { matchId, nickname } = params;

  const match = await getMatchDetail(matchId);

  /* ===== 에러 처리 ===== */
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
    <div className="bg-[#1B2230] border border-[#1C2230] rounded-xl p-6 text-white space-y-2">
      <p className="text-lg font-semibold">알 수 없는 오류가 발생했습니다.</p>
      {"status" in match && (
        <>
          <p className="text-sm text-gray-300">status: {match.status}</p>
          <p className="text-sm text-gray-300">baseUrl: {match.baseUrl}</p>
          <pre className="text-xs whitespace-pre-wrap text-gray-400">
            {match.body}
          </pre>
        </>
      )}
    </div>
  </div>
);
  }

  /* ===== 정상 렌더 ===== */
  return <MatchDetailClient match={match} nickname={nickname} />;
}