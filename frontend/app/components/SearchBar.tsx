"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar({ initial }: { initial?: string }) {
  const [nickname, setNickname] = useState(initial ?? "");
  const router = useRouter();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nickname.trim()) return;
    router.push(`/search?nickname=${encodeURIComponent(nickname)}`);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex gap-2 bg-gray-800 p-3 rounded-xl"
    >
      <input
        className="flex-1 bg-gray-900 text-white px-4 py-1 rounded outline-none"
        placeholder="닉네임 입력"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
      />
      <button
        className="bg-[#32D74B] hover:bg-[#28C840] text-black px-4 rounded font-semibold"
      >
        검색
      </button>
    </form>
  );
}