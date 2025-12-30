"use client";

import { useRouter } from "next/navigation";
import { useGlobalLoading } from "@/app/providers/LoadingProvider";

export default function NicknameLink({ nickname }: { nickname: string }) {
  const router = useRouter();
  const { start } = useGlobalLoading();

  const onClick = () => {
    start(); // 🔥 즉시 글로벌 로딩 시작
    router.push(`/search?nickname=${encodeURIComponent(nickname)}`);
  };

  return (
    <button
      onClick={onClick}
      className="text-2xl font-extrabold hover:underline"
    >
      {nickname}
    </button>
  );
}