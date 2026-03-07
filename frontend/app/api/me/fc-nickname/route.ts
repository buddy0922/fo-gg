import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const NEXON_API_KEY = process.env.NEXON_API_KEY;

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!NEXON_API_KEY) {
    return NextResponse.json(
      { error: "missing_api_key" },
      { status: 500 }
    );
  }

  const { fcNickname } = await req.json();
  const nickname = String(fcNickname ?? "").trim();

  if (!nickname) {
    return NextResponse.json({ error: "nickname_required" }, { status: 400 });
  }

  // ✅ 여기서 string으로 확정
  const apiKey = NEXON_API_KEY;

  const res = await fetch(
    `https://open.api.nexon.com/fconline/v1/id?nickname=${encodeURIComponent(nickname)}`,
    {
      headers: {
        "x-nxopen-api-key": apiKey,
      },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    return NextResponse.json(
      { error: "invalid_nickname" },
      { status: 400 }
    );
  }

  const data = await res.json();

  if (!data?.ouid) {
    return NextResponse.json(
      { error: "invalid_nickname" },
      { status: 400 }
    );
  }

  // ✅ 2. DB 저장
  await prisma.user.upsert({
  where: { email: session.user.email },
  update: { fcNickname: nickname },
  create: {
    email: session.user.email,
    name: session.user.name ?? null,
    image: session.user.image ?? null,
    fcNickname: nickname,
  },
});

  return NextResponse.json({
    ok: true,
    fcNickname: nickname,
  });
}