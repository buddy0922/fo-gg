export type CategoryKey = "worldcup" | "madmovie" | "chant" | "fifa";

export type Song = {
  id: string;        // "wc-1" 이런 식
  title: string;
  videoId: string;   // 유튜브 videoId
};

export type Category = {
  key: CategoryKey;
  label: string;     // 탭에 보이는 이름
  songs: Song[];
};


export const CATEGORIES: Category[] = [
      {
    key: "worldcup",
    label: "월드컵",
    songs: [
      { id: "wc-1", title: "Waka Waka", videoId: "pRpeEdMmmQ0" },
    ],
  },
      {
    key: "madmovie",
    label: "매드무비",
    songs: [
      { id: "mm-1", title: "…", videoId: "8gHKEhbQKHo" },
    ],
  },

  {
    key: "chant",
    label: "응원가",
    songs: [
      { id: "mm-1", title: "…", videoId: "8gHKEhbQKHo" },
    ],
  },
  {
    key: "fifa",
    label: "FC온라인/FIFA",
    songs: [
      { id: "mm-1", title: "…", videoId: "8gHKEhbQKHo" },
    ],
  },
];

export function getCategory(id: string) {
  return CATEGORIES.find((c) => c.id === id);
}

export function getPlaylist(categoryId: string, playlistId: string) {
  const cat = getCategory(categoryId);
  const pl = cat?.playlists.find((p) => p.id === playlistId);
  return { cat, pl };
}

export function ytThumb(videoId: string) {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export function ytWatchUrl(videoId: string) {
  return `https://www.youtube.com/watch?v=${videoId}`;
}