import { NextResponse } from "next/server";
import { supabaseServer } from "@/app/lib/supabaseServer";
import { getUserEmail } from "@/app/lib/getUserEmail";

export async function GET() {
  const email = await getUserEmail();

  const { data } = await supabaseServer
    .from("user_settings")
    .select("*")
    .eq("user_email", email)
    .single();

  return NextResponse.json(data ?? {});
}

export async function POST(req: Request) {
  const email = await getUserEmail();
  const settings = await req.json(); // { autoplay, shuffle }

  const { error } = await supabaseServer
    .from("user_settings")
    .upsert({
      user_email: email,
      ...settings,
    });

  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json({ ok: true });
}