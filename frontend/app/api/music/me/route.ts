import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // 너 프로젝트에 있는 authOptions 경로에 맞춰
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email ?? null;

  if (!email) {
    // 로그인 안 한 경우: 빈 값만 반환 (제한 UX 없음)
    return NextResponse.json({
      email: null,
      favorites: [],
      likes: [],
      settings: { autoplay: false, shuffle: false, lastVideoId: null },
    });
  }

  const [favRes, likeRes, setRes] = await Promise.all([
    supabaseAdmin.from("favorites").select("video_id").eq("user_email", email),
    supabaseAdmin.from("likes").select("video_id").eq("user_email", email),
    supabaseAdmin.from("user_settings").select("*").eq("user_email", email).maybeSingle(),
  ]);

  return NextResponse.json({
    email,
    favorites: (favRes.data ?? []).map((x) => x.video_id),
    likes: (likeRes.data ?? []).map((x) => x.video_id),
    settings: setRes.data
      ? { autoplay: setRes.data.autoplay, shuffle: setRes.data.shuffle, lastVideoId: setRes.data.last_video_id ?? null }
      : { autoplay: false, shuffle: false, lastVideoId: null },
  });
}