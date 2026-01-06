"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getRecentNicknames } from "@/app/lib/recentSearch";

export default function RecentSearches({ limit = 3 }: { limit?: number }) {
  const [list, setList] = useState<string[]>([]);

  useEffect(() => {
    const refresh = () => setList(getRecentNicknames().slice(0, limit));

    refresh();

    const onChanged = () => refresh();
    window.addEventListener("recentNicknamesChanged", onChanged);

    const onStorage = (e: StorageEvent) => {
      if (e.key === "recent-nicknames") refresh();
    };
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("recentNicknamesChanged", onChanged);
      window.removeEventListener("storage", onStorage);
    };
  }, [limit]);

  if (list.length === 0) return null;

  return (
    <div className="flex gap-2 flex-wrap">
      {list.map((name) => (
        <Link
          key={name}
          href={`/search?nickname=${encodeURIComponent(name)}`}
          className="px-3 py-1 rounded-full text-sm border hover:opacity-80"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
            color: "var(--text-main)",
          }}
        >
          {name}
        </Link>
      ))}
    </div>
  );
}