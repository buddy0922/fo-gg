// app/api/music/likes/[videoId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function isHot(count: number) {
  // ✅ 기준은 너 마음대로: 예) 10 이상이면 hot
  return count >= 10;
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ videoId: string }> }
) {
  const { videoId } = await context.params;

  if (!videoId) {
    return NextResponse.json({ error: "videoId required" }, { status: 400 });
  }

  const count = await prisma.musicLike.count({
    where: { videoId },
  });

  return NextResponse.json({
    videoId,
    count,
    hot: isHot(count),
  });
}