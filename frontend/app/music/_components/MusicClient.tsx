// app/music/_components/MusicClient.tsx
"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

type CategoryKey = "tournament" | "sports" | "chants" | "game";
type PlaylistKey = CategoryKey | "all";

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
      key: "all";
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
    { id: "gm-1", title: "Time Bomb", artist: "FIFA Online 3", videoId: "8gHKEhbQKHo" },
    { id: "gm-2", title: "It's Only Us", artist: "FIFA 2000", videoId: "y6cH6zKp9eA" },
    { id: "gm-3", title: "The Other Line", artist: "FIFA Online 3", videoId: "vW9t7wX9K7E" },
    { id: "gm-4", title: "THE PHOENIX", artist: "FIFA Online 3", videoId: "fXkqQzQ9XwE" },
    { id: "gm-5", title: "ICON BGM", artist: "FIFA Online 4", videoId: "3p6m6kzF8Fs" },
    { id: "gm-6", title: "Make Way", artist: "FIFA Online 4", videoId: "mGJ3X0V7p9k" },
    { id: "gm-7", title: "집", artist: "FIFA Online 4", videoId: "0pMZKXz8m1Q" },
    { id: "gm-8", title: "Put You In Your Place", artist: "FIFA Online 3", videoId: "2Z7Wc6KxH8E" },
    { id: "gm-9", title: "The Great Escape", artist: "FIFA Online 3", videoId: "9Xk8Vf7p2wE" },
    { id: "gm-10", title: "Love Me Again", artist: "FIFA Online 3", videoId: "CfihYWRWRTQ" },

    { id: "gm-11", title: "ON OUR WAY", artist: "FIFA 14", videoId: "KX5R7Q3p4kA" },
    { id: "gm-12", title: "Fly", artist: "Epik High (FIFA 07)", videoId: "b0vZ2F8Nq4Q" },
    { id: "gm-13", title: "Counting Stars", artist: "FIFA 14", videoId: "hT_nvWreIhg" },
    { id: "gm-14", title: "Dreaming", artist: "FIFA 14", videoId: "zZxJ7n5q6Gg" },
    { id: "gm-15", title: "Lived A Lie", artist: "FIFA 14", videoId: "Yy7Xk1YxF6k" },

    { id: "gm-16", title: "Heat Waves", artist: "FIFA 21", videoId: "mRD0-GxqHVo" },
    { id: "gm-17", title: "Ticket To Ride", artist: "FIFA 21", videoId: "4NRXx6U8ABQ" },
    { id: "gm-18", title: "Genius", artist: "FIFA 19", videoId: "f_s6i5D2L2c" },
    { id: "gm-19", title: "Found What I've Been Looking For", artist: "FIFA 18", videoId: "yKNxeF4KMsY" },

    { id: "gm-20", title: "Something Just Like This", artist: "Winning Eleven", videoId: "FM7MFYoylVs" },
    { id: "gm-21", title: "By Your Side", artist: "Winning Eleven", videoId: "3Kxf2dHlDpQ" },
    { id: "gm-22", title: "Song 2", artist: "FIFA 98", videoId: "SSbBvKaM6sk" },
    { id: "gm-23", title: "Tubthumping", artist: "World Cup 98 / FIFA", videoId: "2H5uWRjFsGc" },
    { id: "gm-24", title: "Jerk It Out", artist: "FIFA 2004", videoId: "NIGMUAMevH0" },
  ],
},
  {
    key: "tournament",
    label: "국제대회",
    emoji: "🏆",
    songs: [
  { id: "tour-1", title: "Champion", artist: "2002 Korea-Japan WC", videoId: "r0G9pYF4J7M" },
  { id: "tour-2", title: "We Will Rock You", artist: "Queen", videoId: "iRW2j0rJ6LE" },
  { id: "tour-3", title: "Dreamers", artist: "Jung Kook", videoId: "IwzkfMmNMpM" },
  { id: "tour-4", title: "Feel The Magic In The Air", artist: "Magic System", videoId: "BAkqJT_sMKQ" },
  { id: "tour-5", title: "C'est La Vie", artist: "Khaled", videoId: "5S4Y2z0AqI4" },
  { id: "tour-6", title: "The Cup Of Life", artist: "Ricky Martin", videoId: "8BkYKwHLXiU" },
  { id: "tour-7", title: "Dreamers", artist: "FIFA WC 2022", videoId: "IwzkfMmNMpM" },
  { id: "tour-8", title: "We Are The Champions", artist: "Queen", videoId: "04854XqcfCY" },
  { id: "tour-9", title: "Ole Ole Ole", artist: "World Cup Song", videoId: "1b3J6nG2N8M" },
  { id: "tour-10", title: "The Cup Of Life", artist: "1998 France WC", videoId: "8BkYKwHLXiU" },
  { id: "tour-11", title: "Waka Waka", artist: "Shakira", videoId: "pRpeEdMmmQ0" },
  { id: "tour-12", title: "Wavin' Flag", artist: "K'naan", videoId: "WTJSt4wP2ME" },
  { id: "tour-13", title: "Live It Up", artist: "Nicky Jam", videoId: "YQHsXMglC9A" },
  { id: "tour-14", title: "Hayya Hayya", artist: "FIFA WC 2022", videoId: "vyDjFVZgJoo" },
  { id: "tour-15", title: "Waka Waka (This Time for Africa)", artist: "Shakira", videoId: "pRpeEdMmmQ0" },
  { id: "tour-16", title: "Colors", artist: "Jason Derulo", videoId: "B_0pH8pIh5E" },
  { id: "tour-17", title: "Wavin' Flag (Celebration Mix)", artist: "K'naan", videoId: "WTJSt4wP2ME" },
  { id: "tour-18", title: "The World Is Ours", artist: "Aloe Blacc", videoId: "8gHKEhbQKHo" },
  { id: "tour-19", title: "Gloryland", artist: "World Cup 1994", videoId: "0yXr7n0tS4I" },
  { id: "tour-20", title: "UEFA Champions League Theme", artist: "Tony Britten", videoId: "zwV3h1vqU0A" },
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
      videoId: "UtF6Jej8yb4",
    },
    {
      id: "mm-2",
      title: "On Top Of The World",
      artist: "Imagine Dragons",
      videoId: "w5tWYmIOWGk",
    },
    {
      id: "mm-3",
      title: "Counting Stars",
      artist: "OneRepublic",
      videoId: "hT_nvWreIhg",
    },
    {
      id: "mm-4",
      title: "Viva La Vida (Live)",
      artist: "Coldplay",
      videoId: "dvgZkm1xWPE",
    },
    {
      id: "mm-5",
      title: "Shut Up And Dance",
      artist: "WALK THE MOON",
      videoId: "6JCLY0Rlx6Q",
    },
    {
      id: "mm-6",
      title: "Something Just Like This",
      artist: "The Chainsmokers & Coldplay",
      videoId: "FM7MFYoylVs",
    },
    {
      id: "mm-7",
      title: "Heat Waves",
      artist: "Glass Animals",
      videoId: "mRD0-GxqHVo",
    },
    {
      id: "mm-8",
      title: "The Last Of The Real Ones",
      artist: "Fall Out Boy",
      videoId: "7K3z6M8E3wY",
    },
    {
      id: "mm-9",
      title: "Seven Nation Army",
      artist: "The White Stripes",
      videoId: "0J2QdDbelmY",
    },
    {
      id: "mm-10",
      title: "We Will Rock You",
      artist: "Queen",
      videoId: "04854XqcfCY",
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
      videoId: "agVpq_XXRmU",
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

const PLAYLISTS: Playlist[] = [ALL, ...CATEGORIES];

export default function MusicClient() {
  const [activeCatKey, setActiveCatKey] = useState<PlaylistKey>("tournament");

  // ✅ 이제 PLAYLISTS에서 찾기 (전체 포함)
  const activeCategory = useMemo(() => {
    return PLAYLISTS.find((c) => c.key === activeCatKey) ?? PLAYLISTS[0];
  }, [activeCatKey]);

  // ✅ activeCategory가 바뀔 때도 첫 곡 안정적으로 잡기
  const [activeVideoId, setActiveVideoId] = useState<string>(
    activeCategory.songs[0]?.videoId ?? ""
  );

  const onPickCategory = (key: PlaylistKey) => {
    setActiveCatKey(key);
    const next = PLAYLISTS.find((c) => c.key === key);
    if (next?.songs?.[0]?.videoId) setActiveVideoId(next.songs[0].videoId);
  };

  // ✅ 현재곡 찾기도 전체 포함해서 찾기
  const currentSong = useMemo(() => {
    return ALL.songs.find((s) => s.videoId === activeVideoId) ?? null;
  }, [activeVideoId]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-24 pb-14">
      {/* 카테고리 탭 */}
      <div className="mb-6 flex flex-wrap gap-2">
        {PLAYLISTS.map((cat) => {
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

          <div className="grid grid-cols-1 gap-3">
            {activeCategory.songs.map((song) => {
              const selected = song.videoId === activeVideoId;
              return (
                <button
                  key={song.id}
                  onClick={() => setActiveVideoId(song.videoId)}
                  className={[
                    "group flex w-full items-center gap-3 rounded-xl border p-3 text-left transition",
                    selected
                      ? "border-white/25 bg-white/10"
                      : "border-[var(--border)] bg-transparent hover:bg-white/5",
                  ].join(" ")}
                >
                  <div className="relative h-14 w-20 overflow-hidden rounded-lg">
                    <Image
                      src={ytThumb(song.videoId)}
                      alt={song.title}
                      fill
                      className="object-cover"
                      sizes="80px"
                      priority={false}
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm md:text-base font-bold text-[var(--text-main)]">
                      {song.title}
                    </div>
                    <div className="mt-0.5 truncate text-xs md:text-sm text-[var(--text-sub)]">
                      {song.artist ?? "YouTube"}
                      {song.note ? ` · ${song.note}` : ""}
                    </div>
                  </div>

                  <div
                    className={[
                      "shrink-0 rounded-full px-3 py-1 text-xs font-bold",
                      selected ? "bg-[#34E27A]/20 text-[#34E27A]" : "bg-white/10 text-[var(--text-sub)]",
                    ].join(" ")}
                  >
                    {selected ? "재생중" : "재생"}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* 유튜브 플레이어 */}
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 md:p-5">
          <div className="mb-3 flex items-start justify-between gap-3">
  <div>
    <h2 className="text-base md:text-lg font-extrabold text-[var(--text-main)]">
      지금 재생중인 노래
    </h2>
    <p className="mt-1 text-xs md:text-sm text-[var(--text-sub)]">
      {currentSong
        ? `${currentSong.title}${currentSong.artist ? ` · ${currentSong.artist}` : ""}`
        : "곡을 선택해줘"}
    </p>
  </div>

  {/* 🔗 유튜브 새 탭 버튼 */}
  {activeVideoId && (
    <a
      href={ytWatch(activeVideoId)}
      target="_blank"
      rel="noopener noreferrer"
      className="
        shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold
        border border-[var(--border)]
        bg-[var(--surface)]
        text-[var(--text-main)]
        hover:text-[#34E27A]
        hover:border-[#34E27A]
        transition
      "
      title="유튜브에서 열기"
    >
      YouTube ↗
    </a>
  )}
</div>
          

          <div className="relative aspect-video overflow-hidden rounded-xl border border-[var(--border)] bg-black/30">
            {activeVideoId ? (
              <iframe
                key={activeVideoId}
                className="absolute inset-0 h-full w-full"
                src={ytEmbed(activeVideoId)}
                title="YouTube player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-[var(--text-sub)]">
                곡을 선택해줘
              </div>
            )}
          </div>

          {/* 작은 안내 */}
          <div className="mt-3 text-xs text-[var(--text-sub)]">
            * 영상을 우클릭 후 '연속재생'을 누르면 연속으로 들을 수 있습니다.
          </div>
        </section>
      </div>
    </div>
  );
}