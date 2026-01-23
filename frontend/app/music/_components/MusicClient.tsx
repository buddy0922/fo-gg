// app/music/_components/MusicClient.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useSession, signIn } from "next-auth/react";
import { usePlayerStore } from "@/app/music/_store/playerStore";
import GlobalYouTubePlayer from "@/app/components/GlobalYouTubePlayer";

type CategoryKey = "tournament" | "sports" | "chants" | "game";
type PlaylistKey = "all" | "liked" | "hot" | CategoryKey;

type Song = {
  id: string;
  title: string;
  artist?: string;
  videoId: string;
  note?: string;
};

type Category = {
  key: CategoryKey;
  label: string;
  emoji: string;
  songs: Song[];
};

type Playlist =
  | Category
  | {
      key: "all" | "liked" | "hot";
      label: string;
      emoji: string;
      songs: Song[];
    };

const ytWatch = (videoId: string) => `https://www.youtube.com/watch?v=${videoId}`;
const ytThumb = (videoId: string) => `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
const ytEmbed = (videoId: string) =>
  `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1`;

const CATEGORIES: Category[] = [
  /* =========================
     🌍 국제대회 (월드컵 · UEFA)
  ========================= */
  {
  key: "game",
  label: "게임 OST",
  emoji: "🎮",
  songs: [
    { id: "gm-1", title: "Time Bomb", artist: "FIFA Online 3", videoId: "dEnA5Du7d9M" },
    { id: "gm-2", title: "It's Only Us", artist: "FIFA 2000", videoId: "ecrph82o6FU" },
    { id: "gm-3", title: "The Other Line", artist: "FIFA Online 3", videoId: "WFsgEZv5rKU" },
    { id: "gm-4", title: "THE PHOENIX", artist: "FIFA Online 3", videoId: "kfrdXhTiMJ4" },
    { id: "gm-5", title: "ICON BGM", artist: "FIFA Online 4", videoId: "df7ikTB3HGc" },
    { id: "gm-6", title: "Make Way", artist: "FIFA Online 4", videoId: "ri6RZVttf6A" },
    { id: "gm-7", title: "Dear Maria, Count Me In", artist: "FIFA Online 4", videoId: "CtMcbx_tENc" },
    { id: "gm-8", title: "Put You In Your Place", artist: "FIFA Online 3", videoId: "Pc_Fok6fTbA" },
    { id: "gm-9", title: "The Great Escape", artist: "FIFA Online 3", videoId: "Wg9LZMY9czk" },
    { id: "gm-10", title: "Love Me Again", artist: "FIFA Online 3", videoId: "z8VJcM1shaw" },
    { id: "gm-25", title: "집", artist: "FIFA Online 4", videoId: "RVPdKE-EsNA" },

    { id: "gm-11", title: "ON OUR WAY", artist: "FIFA 14", videoId: "CTue7yhHycQ" },
    { id: "gm-12", title: "Fly", artist: "Epik High (FIFA 07)", videoId: "_MbZXvMwtGQ" },
    { id: "gm-13", title: "Counting Stars", artist: "FIFA 14", videoId: "hT_nvWreIhg" },
    { id: "gm-14", title: "Dreaming", artist: "FIFA 14", videoId: "j0m2KOEKGyM" },
    { id: "gm-15", title: "Lived A Lie", artist: "FIFA 14", videoId: "r3oi1NVnseA" },

    { id: "gm-16", title: "Heat Waves", artist: "FIFA 21", videoId: "P4ei7mIbZrE" },
    { id: "gm-17", title: "Ticket To Ride", artist: "FIFA 21", videoId: "N3wZEFO5uMQ" },
    { id: "gm-18", title: "Genius", artist: "FIFA 19", videoId: "_Di-IxsmRXg" },
    { id: "gm-19", title: "Found What I've Been Looking For", artist: "FIFA 18", videoId: "E80hONQ-8a4" },

    { id: "gm-20", title: "Something Just Like This", artist: "Winning Eleven", videoId: "ktGj2irEN6U" },
    { id: "gm-21", title: "By Your Side", artist: "Winning Eleven", videoId: "0nZSuXoBb1Y" },
    { id: "gm-22", title: "Song 2", artist: "FIFA 98", videoId: "8w0X1bSrUHs" },
    { id: "gm-23", title: "Tubthumping", artist: "World Cup 98 / FIFA", videoId: "gaiollV9jz0" },
    { id: "gm-24", title: "Jerk It Out", artist: "FIFA 2004", videoId: "N7mDKTW-jMs" },
  ],
},
  {
    key: "tournament",
    label: "국제대회",
    emoji: "🏆",
    songs: [
  { id: "tour-1", title: "Champion", artist: "2002 Korea-Japan WC", videoId: "3s6GD0Eo5dA" },
  { id: "tour-2", title: "We Will Rock You", artist: "Queen", videoId: "tn7k-abwfbM" },
  { id: "tour-3", title: "Dreamers", artist: "Jung Kook", videoId: "stIFV5kXOXE" },
  { id: "tour-4", title: "Feel The Magic In The Air", artist: "Magic System", videoId: "jraYCQ0IRws" },
  { id: "tour-5", title: "C'est La Vie", artist: "Khaled", videoId: "7L9qE9WMrJY" },
  { id: "tour-6", title: "The Cup Of Life", artist: "Ricky Martin", videoId: "IzrI7LrTd2c" },
  { id: "tour-7", title: "Dreamers", artist: "FIFA WC 2022", videoId: "stIFV5kXOXE" },
  { id: "tour-8", title: "We Are The Champions", artist: "Queen", videoId: "OsmZY6u7m3k" },
  { id: "tour-9", title: "Ole Ole Ole", artist: "World Cup Song", videoId: "TGtWWb9emYI" },
  { id: "tour-10", title: "The Cup Of Life", artist: "1998 France WC", videoId: "IzrI7LrTd2c" },
  { id: "tour-11", title: "Waka Waka", artist: "Shakira", videoId: "h6nnt6PRHk4" },
  { id: "tour-12", title: "Wavin' Flag", artist: "K'naan", videoId: "WTJSt4wP2ME" },
  { id: "tour-13", title: "Live It Up", artist: "Nicky Jam", videoId: "J5eQvuQIt3s" },
  { id: "tour-14", title: "Hayya Hayya", artist: "FIFA WC 2022", videoId: "sQJaztbrErc" },
  { id: "tour-15", title: "Waka Waka (This Time for Africa)", artist: "Shakira", videoId: "h6nnt6PRHk4" },
  { id: "tour-16", title: "Colors", artist: "Jason Derulo", videoId: "QL0pSYO9yk8" },
  { id: "tour-17", title: "Wavin' Flag (Celebration Mix)", artist: "K'naan", videoId: "WTJSt4wP2ME" },
  { id: "tour-18", title: "The World Is Ours", artist: "Aloe Blacc", videoId: "240THRFkCd4" },
  { id: "tour-19", title: "Gloryland", artist: "World Cup 1994", videoId: "DxSKK5KQLoc" },
  { id: "tour-20", title: "UEFA Champions League Theme", artist: "Tony Britten", videoId: "8gHKEhbQKHo" },
],
  },

  /* =========================
     📺 스포츠 방송 · 매드무비
  ========================= */
  {
    key: "sports",
    label: "매드무비·중계",
    emoji: "🔥",
    songs: [
    {
      id: "mm-1",
      title: "The Nights",
      artist: "Avicii",
      videoId: "43qQV5MUFgI",
    },
    {
      id: "mm-2",
      title: "On Top Of The World",
      artist: "Imagine Dragons",
      videoId: "cxmMD5OvYRQ",
    },
    {
      id: "mm-3",
      title: "Counting Stars",
      artist: "OneRepublic",
      videoId: "9w33PUyfJHE",
    },
    {
      id: "mm-4",
      title: "Viva La Vida",
      artist: "Coldplay",
      videoId: "3MXsM8mFSFM",
    },
    {
      id: "mm-5",
      title: "Shut Up And Dance",
      artist: "WALK THE MOON",
      videoId: "fpSLPo-Kfwk",
    },
    {
      id: "mm-6",
      title: "Something Just Like This",
      artist: "The Chainsmokers & Coldplay",
      videoId: "9v_X-_nr9LY",
    },
    {
      id: "mm-7",
      title: "Heat Waves",
      artist: "Glass Animals",
      videoId: "C15X5N1Tpko",
    },
    {
      id: "mm-8",
      title: "The Last Of The Real Ones",
      artist: "Fall Out Boy",
      videoId: "APW_K48Vrtk",
    },
    {
      id: "mm-9",
      title: "Seven Nation Army",
      artist: "The White Stripes",
      videoId: "RDuzszjrdcc",
    },
    {
      id: "mm-10",
      title: "We Will Rock You",
      artist: "Queen",
      videoId: "-tJYN-eG1zk",
    },
    {
      id: "mm-11",
      title: "We Are The Champions",
      artist: "Queen",
      videoId: "04854XqcfCY",
    },
    {
      id: "mm-12",
      title: "Fire",
      artist: "Kasabian",
      videoId: "MQLPbd-RoSI",
    },
  ],
  },

  /* =========================
     📣 응원가 (클럽 · 선수 · 국가)
  ========================= */
  {
  key: "chants",
  label: "응원가",
  emoji: "📣",
  songs: [
    {
      id: "ch-1",
      title: "You'll Never Walk Alone",
      artist: "Liverpool FC",
      videoId: "Go-jJlGd1so",
    },
    {
      id: "ch-2",
      title: "Glory Glory Man United",
      artist: "Manchester United FC",
      videoId: "9ZyR5bFzFfQ",
    },
    {
      id: "ch-3",
      title: "Hala Madrid",
      artist: "Real Madrid CF",
      videoId: "4B2a6l6wM2k",
    },
    {
      id: "ch-4",
      title: "Vardy's On Fire",
      artist: "Leicester City FC",
      videoId: "Xb8yZk7ZJd0",
    },
    {
      id: "ch-5",
      title: "Blue Moon",
      artist: "Manchester City FC",
      videoId: "kL2ZtJbqvYQ",
    },
    {
      id: "ch-6",
      title: "Don't Look Back In Anger",
      artist: "Manchester City Fans",
      videoId: "cmpRLQZkTb8",
    },
    {
      id: "ch-7",
      title: "Seven Nation Army (Stadium Chant)",
      artist: "Football Fans",
      videoId: "0J2QdDbelmY",
    },
    {
      id: "ch-8",
      title: "Three Lions",
      artist: "England National Team",
      videoId: "RJqimlFcJsM",
    },
    {
      id: "ch-9",
      title: "Ole Ole Ole",
      artist: "World Cup Chant",
      videoId: "R7gR8z5ZqvI",
    },
    {
      id: "ch-10",
      title: "오 필승 코리아",
      artist: "대한민국 응원가",
      videoId: "0v6Z9y7Jk2A",
    },
    {
      id: "ch-11",
      title: "더 뜨겁게, 한국",
      artist: "대한민국 응원가",
      videoId: "xg7vU8yR9eI",
    },
    {
      id: "ch-12",
      title: "승리를 위하여",
      artist: "트랜스픽션",
      videoId: "y9pV3nZJZq8",
    },
    {
      id: "ch-13",
      title: "발로차",
      artist: "클론",
      videoId: "6QmR1E2x7Ks",
    },
    {
      id: "ch-14",
      title: "끝까지 달린다",
      artist: "울산 현대 응원가",
      videoId: "M2u8P4cLkZQ",
    },
  ],
}
];

const ALL: Playlist = {
  key: "all",
  label: "전체",
  emoji: "✨",
  songs: Array.from(
    new Map(CATEGORIES.flatMap((c) => c.songs).map((s) => [s.videoId, s])).values()
  ),
};

const LIKED = (likeSet: Set<string>): Playlist => ({
  key: "liked",
  label: "좋아요",
  emoji: "❤️",
  songs: ALL.songs.filter((s) => likeSet.has(s.videoId)),
});

const HOT10 = (hotSongs: Song[]): Playlist => ({
  key: "hot",
  label: "HOT10",
  emoji: "🔥",
  songs: hotSongs,
});


export default function MusicClient() {
  const { data: session } = useSession();

  const [query, setQuery] = useState("");
  const [activeCatKey, setActiveCatKey] = useState<PlaylistKey>("all");

  // ✅ likes 전역
  const hydrateLikes = usePlayerStore((s) => s.hydrateLikes);
  const likeSet = usePlayerStore((s) => s.likeSet);
  const likeCounts = usePlayerStore((s) => s.likeCounts);
  const toggleLikeStore = usePlayerStore((s) => s.toggleLike);

  // ✅ player 전역
  const activeVideoId = usePlayerStore((s) => s.activeVideoId);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const autoPlay = usePlayerStore((s) => s.autoPlay);
  const randomMode = usePlayerStore((s) => s.randomMode);

  const setAutoPlay = usePlayerStore((s) => s.setAutoPlay);
  const setRandomMode = usePlayerStore((s) => s.setRandomMode);

  const setQueue = usePlayerStore((s) => s.setQueue);
  const next = usePlayerStore((s) => s.next);
  const prev = usePlayerStore((s) => s.prev);
  const requestTogglePlayPause = usePlayerStore((s) => s.requestTogglePlayPause);

  // ✅ 좋아요 hydrate 1번만 실행 가드
const hydratedRef = useRef(false);

useEffect(() => {
  if (hydratedRef.current) return;
  hydratedRef.current = true;
  hydrateLikes();
}, [hydrateLikes]);

// ✅ TOP10 계산
const topLiked = useMemo(() => {
  return ALL.songs
    .map((s) => ({ ...s, count: likeCounts[s.videoId] ?? 0 }))
    .filter((s) => s.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}, [likeCounts]);

// ✅ HOT10 탭에서 쓸 Song 배열(=count 제거)
const hotSongs = useMemo(() => {
  return topLiked.map(({ count, ...song }) => song);
}, [topLiked]);

// ✅ HOT 뱃지용 Set
const hotSet = useMemo(() => {
  return new Set(topLiked.map((s) => s.videoId));
}, [topLiked]);

// ✅ playlists (ALL → HOT10 → LIKED → CATEGORIES)
const playlists = useMemo<Playlist[]>(() => {
  return [ALL, HOT10(hotSongs), LIKED(likeSet), ...CATEGORIES];
}, [likeSet, hotSongs]);

// ✅ activeCategory
const activeCategory = useMemo(() => {
  return playlists.find((c) => c.key === activeCatKey) ?? playlists[0];
}, [activeCatKey, playlists]);


  const onPickCategory = (key: PlaylistKey) => {
  setActiveCatKey(key);

  const picked = playlists.find((c) => c.key === key);
  const songs = picked?.songs ?? [];

  const queue = songs.map((s) => ({
    videoId: s.videoId,
    title: s.title,
    artist: s.artist,
  }));

  // 첫 곡으로 큐 세팅 (재생도 이어짐)
  setQueue(queue, queue[0]?.videoId);
};

  const filteredSongs = useMemo(() => {
  const q = query.trim().toLowerCase();
  if (!q) return activeCategory.songs;

  return activeCategory.songs.filter((s) =>
    `${s.title} ${s.artist ?? ""}`.toLowerCase().includes(q)
  );
}, [activeCategory.songs, query]);

  // ✅ 현재곡 찾기도 전체 포함해서 찾기
  const currentSong = useMemo(() => {
    return ALL.songs.find((s) => s.videoId === activeVideoId) ?? null;
  }, [activeVideoId]);


const activeQueue = useMemo(
  () =>
    activeCategory.songs.map((s) => ({
      videoId: s.videoId,
      title: s.title,
      artist: s.artist,
    })),
  [activeCategory.songs]
);

const onPickSong = (song: Song) => {
  setQueue(activeQueue, song.videoId);
};

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-24 pb-14">
      {/* 카테고리 탭 */}
      <div className="mb-6 flex flex-wrap gap-2">
        {playlists.map((cat) => {
          const active = cat.key === activeCatKey;
          return (
            <button
              key={cat.key}
              onClick={() => onPickCategory(cat.key)}
              className={[
                "rounded-full px-4 py-2 text-sm font-semibold transition border",
                active
                  ? "bg-[var(--surface-strong)] border-[var(--border)] text-[var(--text-main)]"
                  : "bg-[var(--surface)] border-[var(--border)] text-[var(--text-sub)] hover:text-[var(--text-main)]",
              ].join(" ")}
            >
              <span className="mr-1">{cat.emoji}</span>
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* 본문: 좌(곡 리스트) / 우(플레이어) */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* 곡 리스트 */}
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 md:p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base md:text-lg font-extrabold text-[var(--text-main)]">
              {activeCategory.emoji} {activeCategory.label}
            </h2>
            <span className="text-xs text-[var(--text-sub)]">{activeCategory.songs.length}곡</span>
          </div>

            {/* 검색창: HOT 탭에서는 숨김 */}
{activeCatKey !== "hot" && (
  <input
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    placeholder="노래 / 아티스트 검색"
    className="
      mb-3 w-full rounded-lg border border-[var(--border)]
      bg-[var(--surface)] px-3 py-2 text-sm
      text-[var(--text-main)]
      placeholder:text-[var(--text-sub)]
      focus:outline-none focus:border-[#5CC4FF]
    "
  />
)}

{/* HOT10 탭 UI */}
{activeCatKey === "hot" ? (
  <div className="grid grid-cols-1 gap-2">
    {topLiked.length === 0 ? (
      <div className="rounded-xl border border-[var(--border)] bg-white/5 p-4 text-sm text-[var(--text-sub)]">
        아직 좋아요가 없어요. 첫 좋아요를 눌러보세요 🤍
      </div>
    ) : (
      topLiked.map((s, idx) => {
        const selected = s.videoId === activeVideoId;
        return (
          <div
            key={s.videoId}
            onClick={() => {
  const q = topLiked.map((x) => ({
    videoId: x.videoId,
    title: x.title,
    artist: x.artist,
  }));
  setQueue(q, s.videoId);
}}
            role="button"
            tabIndex={0}
            className={[
              "group flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border p-3 text-left transition",
              selected
                ? "border-white/25 bg-white/10"
                : "border-[var(--border)] bg-transparent hover:bg-white/5",
            ].join(" ")}
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-[#FF6B6B]">#{idx + 1}</span>
                <div className="truncate text-sm md:text-base font-bold text-[var(--text-main)]">
                  {s.title}
                </div>
              </div>
              <div className="mt-0.5 truncate text-xs md:text-sm text-[var(--text-sub)]">
                {s.artist ?? "YouTube"}
              </div>
            </div>

            <div className="shrink-0 text-xs font-bold text-[#5CC4FF] tabular-nums">
              ❤️ {s.count}
            </div>
          </div>
        );
      })
    )}
  </div>
) : (
  <div className="grid grid-cols-1 gap-3">
    {activeCategory.songs.length === 0 ? (
      <div className="rounded-xl border border-[var(--border)] bg-white/5 p-4 text-sm text-[var(--text-sub)]">
        아직 좋아요한 곡이 없어요. 🤍 버튼을 눌러 저장해보세요.
      </div>
    ) : (
      filteredSongs.map((song) => (
        <div
          key={song.id}
          onClick={() => onPickSong(song)}
          role="button"
          tabIndex={0}
          className={[
            "group flex w-full cursor-pointer items-center gap-3 rounded-xl border p-3 text-left transition",
            song.videoId === activeVideoId
              ? "border-white/25 bg-white/10"
              : "border-[var(--border)] bg-transparent hover:bg-white/5",
          ].join(" ")}
        >
          {/* 썸네일 */}
          <div className="relative h-14 w-20 overflow-hidden rounded-lg">
            <Image
              src={ytThumb(song.videoId)}
              alt={song.title}
              fill
              className="object-cover"
              sizes="80px"
            />
          </div>

          {/* 제목 */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 truncate text-sm md:text-base font-bold text-[var(--text-main)]">
              <span className="truncate">{song.title}</span>

              {hotSet.has(song.videoId) && (
                <span className="shrink-0 rounded-full border border-red-400/40 bg-red-400/15 px-2 py-0.5 text-[10px] font-extrabold text-red-400">
                  HOT
                </span>
              )}
            </div>

            <div className="mt-0.5 truncate text-xs md:text-sm text-[var(--text-sub)]">
              {song.artist ?? "YouTube"}
            </div>
          </div>

          {/* 좋아요 */}
          <div
            onClick={async (e) => {
              e.stopPropagation();
              if (!session) {
                await signIn("google");
                return;
              }
              await toggleLikeStore(song.videoId);
            }}
            className={[
              "ml-2 shrink-0 rounded-full border px-2.5 py-1 text-xs font-bold transition cursor-pointer flex items-center gap-1",
              likeSet.has(song.videoId)
                ? "border-[#5CC4FF]/40 bg-[#5CC4FF]/15 text-[#5CC4FF]"
                : "border-[var(--border)] bg-white/5 text-[var(--text-sub)]",
            ].join(" ")}
          >
            <span>{likeSet.has(song.videoId) ? "❤️" : "🤍"}</span>
            <span className="tabular-nums">{likeCounts[song.videoId] ?? 0}</span>
          </div>
        </div>
      ))
    )}
  </div>
)}
                </section>

        {/* 오른쪽 칸: 비워둠 */}
        <div />

</div>

    </div>
  );
}