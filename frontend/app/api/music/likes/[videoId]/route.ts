// app/api/music/likes/[videoId]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const HOT_THRESHOLD = 10; // 🔥 기준 마음대로 조절

export async function GET(
  _req: Request,
  { params }: { params: { videoId: string } }
) {
  const videoId = params.videoId;
  if (!videoId) return NextResponse.json({ error: "videoId required" }, { status: 400 });

  const count = await prisma.musicLike.count({ where: { videoId } });
  const hot = count >= HOT_THRESHOLD;

  return NextResponse.json({ videoId, count, hot });
}