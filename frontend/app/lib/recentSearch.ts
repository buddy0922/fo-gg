const KEY = "recent-nicknames";
const LIMIT = 3;

export function getRecentNicknames(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addRecentNickname(nickname: string) {
  if (typeof window === "undefined") return;

  const clean = nickname.trim();
  if (!clean) return;

  const prev = getRecentNicknames();

  const next = [
    clean,
    ...prev.filter((n) => n.toLowerCase() !== clean.toLowerCase()),
  ].slice(0, LIMIT);

  localStorage.setItem(KEY, JSON.stringify(next));

  // ✅ 같은 탭에서도 RecentSearches가 즉시 갱신되도록 이벤트 발생
  window.dispatchEvent(new Event("recentNicknamesChanged"));
}