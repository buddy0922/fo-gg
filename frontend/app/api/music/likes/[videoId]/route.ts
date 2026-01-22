import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ videoId: string }> }
) {
  const { videoId } = await context.params;

  return NextResponse.json({
    videoId,
    count: 0,
    hot: false,
  });
}