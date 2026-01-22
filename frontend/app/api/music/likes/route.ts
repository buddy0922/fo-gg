// app/api/music/likes/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
// import { authOptions } from "@/lib/auth"; // 네 프로젝트에 있으면 연결
export const runtime = "nodejs";

function getEmail(session: any) {
  return session?.user?.email as string | undefined;
}

/**
 * GET  /api/music/likes
 * - 내가 좋아요한 videoId 목록 + videoId별 count
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    console.log("[/api/music/likes] session =", session); // ✅ 추가
    console.log("[/api/music/likes] email =", session?.user?.email); // ✅ 추가
    const email = getEmail(session);

    // 전체 count 집계 (topLiked 등에 사용)
    const grouped = await prisma.musicLike.groupBy({
      by: ["videoId"],
      _count: { videoId: true },
    });

    const counts: Record<string, number> = {};
    for (const g of grouped) counts[g.videoId] = g._count.videoId;

    // 로그인 안 했으면 counts만 내려도 되고, likes는 빈 배열
    if (!email) {
      return NextResponse.json({ likes: [], counts });
    }

    // 내 likes 목록
    const rows: { videoId: string }[] = await prisma.musicLike.findMany({
  where: { email },
  select: { videoId: true },
});

const likes = rows.map((r) => r.videoId);
    return NextResponse.json({ likes, counts });
  } catch (e) {
    console.error("GET /api/music/likes failed:", e);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}

/**
 * POST /api/music/likes
 * body: { videoId }
 * - 좋아요 추가(이미 있으면 그대로)
 * return: { liked: true, count }
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const email = getEmail(session);
    if (!email) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const { videoId } = await req.json();
    if (!videoId) return NextResponse.json({ error: "videoId required" }, { status: 400 });

    // upsert: 있으면 유지, 없으면 생성
    await prisma.musicLike.upsert({
      where: { email_videoId: { email, videoId } },
      update: {},
      create: { email, videoId },
    });

    const count = await prisma.musicLike.count({ where: { videoId } });
    return NextResponse.json({ liked: true, count });
  } catch (e) {
    console.error("POST /api/music/likes failed:", e);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/music/likes
 * body: { videoId }
 * - 좋아요 제거(없어도 OK)
 * return: { liked: false, count }
 */
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const email = getEmail(session);
    if (!email) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const { videoId } = await req.json();
    if (!videoId) return NextResponse.json({ error: "videoId required" }, { status: 400 });

    await prisma.musicLike.deleteMany({
      where: { email, videoId },
    });

    const count = await prisma.musicLike.count({ where: { videoId } });
    return NextResponse.json({ liked: false, count });
  } catch (e) {
    console.error("DELETE /api/music/likes failed:", e);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}