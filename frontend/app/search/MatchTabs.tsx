"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

const TABS = [
  { key: "all", label: "전체", type: null },
  { key: "50", label: "공식경기", type: 50 },
  { key: "40", label: "커스텀매치", type: 40 },
  { key: "52", label: "감독모드", type: 52 },
  { key: "60", label: "친선경기", type: 60 },
] as const;

export default function MatchTabs({ nickname }: { nickname: string }) {
  const sp = useSearchParams();
  const cur = sp.get("type") ?? "all";

  return (
    <div className="flex gap-2 overflow-x-auto">
      {TABS.map((t) => {
        const nextHref =
          t.type === null
            ? `/search/${encodeURIComponent(nickname)}`
            : `/search/${encodeURIComponent(nickname)}?type=${t.type}`;

        const active = cur === (t.type === null ? "all" : String(t.type));

        return (
          <Link
            key={t.key}
            href={nextHref}
            scroll={false}
            className={[
              "px-3 py-1.5 rounded-full text-sm border whitespace-nowrap",
              active
                ? "bg-black text-white border-black"
                : "bg-transparent text-zinc-700 border-zinc-200",
            ].join(" ")}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}