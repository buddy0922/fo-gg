export type CategoryKey = "worldcup" | "madmovie" | "chant" | "fifa";

export type Song = {
  id: string;      // "wc-1"
  title: string;
  videoId: string; // YouTube videoId
};

export type Category = {
  key: CategoryKey; // ✅ 카테고리 식별자는 key
  label: string;    // 탭 이름
  songs: Song[];
};

export const CATEGORIES: Category[] = [
  {
    key: "worldcup",
    label: "월드컵",
    songs: [{ id: "wc-1", title: "Waka Waka", videoId: "pRpeEdMmmQ0" }],
  },
  {
    key: "madmovie",
    label: "매드무비",
    songs: [{ id: "mm-1", title: "…", videoId: "8gHKEhbQKHo" }],
  },
  {
    key: "chant",
    label: "응원가",
    songs: [{ id: "ch-1", title: "…", videoId: "8gHKEhbQKHo" }],
  },
  {
    key: "fifa",
    label: "FC온라인/FIFA",
    songs: [{ id: "fi-1", title: "…", videoId: "8gHKEhbQKHo" }],
  },
];

// ✅ (기존 getCategory는 c.id를 찾고 있어서 오류) → key로 찾기
export function getCategory(key: CategoryKey) {
  return CATEGORIES.find((c) => c.key === key);
}

// ✅ playlists 구조를 안 쓰면 이 함수는 삭제하거나 "song 찾기"로 대체
export function getSong(categoryKey: CategoryKey, songId: string) {
  const cat = getCategory(categoryKey);
  const song = cat?.songs.find((s) => s.id === songId);
  return { cat, song };
}

export function ytThumb(videoId: string) {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export function ytWatchUrl(videoId: string) {
  return `https://www.youtube.com/watch?v=${videoId}`;
}