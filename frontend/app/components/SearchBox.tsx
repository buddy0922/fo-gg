"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLoading } from "@/app/providers/LoadingProvider";

const STORAGE_KEY = "fc_recent_searches";
const MAX_RECENTS = 8;

function readRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}

function saveRecentSearches(items: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_RECENTS)));
}

export default function SearchBox({ initialValue = "" }: { initialValue?: string }) {
  const router = useRouter();
  const pathname = usePathname();
const searchParams = useSearchParams();
  const { setLoading } = useLoading();

  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const [nickname, setNickname] = useState(initialValue);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setNickname(initialValue);
  }, [initialValue]);

  useEffect(() => {
    setRecentSearches(readRecentSearches());
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredRecents = useMemo(() => {
    const q = nickname.trim().toLowerCase();
    if (!q) return recentSearches;
    return recentSearches.filter((item) => item.toLowerCase().includes(q));
  }, [nickname, recentSearches]);

  const goSearch = (value: string) => {
    const v = value.trim();
    if (!v) return;

    const next = [v, ...recentSearches.filter((item) => item !== v)].slice(0, MAX_RECENTS);
    setRecentSearches(next);
    saveRecentSearches(next);

    const target = `/search?nickname=${encodeURIComponent(v)}&type=50`;
const current = `${pathname}?${searchParams.toString()}`;

setOpen(false);

if (current === target) {
  return;
}

setLoading(true);
router.push(target);
  };

  return (
    <div ref={wrapperRef} className="relative flex gap-2 justify-center">
      <div className="relative flex-1">
        <input
          value={nickname}
          onChange={(e) => {
            setNickname(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") goSearch(nickname);
            if (e.key === "Escape") setOpen(false);
          }}
          className="w-full px-4 py-2 rounded text-sm disabled:opacity-50"
          style={{
            background: "var(--input-bg)",
            border: `1px solid var(--input-border)`,
            color: "var(--input-text)",
          }}
          placeholder="닉네임 입력"
        />

        {open && filteredRecents.length > 0 ? (
          <div
            className="absolute left-0 right-0 mt-2 overflow-hidden rounded-xl border shadow-lg z-30"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
            }}
          >
            <div
              className="px-3 py-2 text-xs font-semibold"
              style={{ color: "var(--text-sub)" }}
            >
              최근 검색
            </div>

            <div className="max-h-64 overflow-y-auto">
              {filteredRecents.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => goSearch(item)}
                  className="block w-full px-3 py-2 text-left text-sm hover:bg-white/5"
                  style={{ color: "var(--text-main)" }}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <button
        onClick={() => goSearch(nickname)}
        className="px-4 py-2 w-24 rounded text-sm font-semibold transition bg-[#34E27A] text-black hover:opacity-90 cursor-pointer"
      >
        검색
      </button>
    </div>
  );
}