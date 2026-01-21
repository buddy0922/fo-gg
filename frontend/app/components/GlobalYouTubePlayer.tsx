"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import YouTube, { YouTubeProps } from "react-youtube";
import { usePathname } from "next/navigation";
import { usePlayerStore } from "@/app/music/_store/playerStore";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";

export default function GlobalYouTubePlayer() {
  const pathname = usePathname();
  const isMusicPage = useMemo(() => pathname?.startsWith("/music"), [pathname]);

  const playerRef = useRef<any>(null);

  const activeVideoId = usePlayerStore((s) => s.activeVideoId);
  const isOpen = usePlayerStore((s) => s.isOpen);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const autoPlay = usePlayerStore((s) => s.autoPlay);
  const randomMode = usePlayerStore((s) => s.randomMode);
  const toggleSignal = usePlayerStore((s) => s.toggleSignal);

  const close = usePlayerStore((s) => s.close);
  const next = usePlayerStore((s) => s.next);
  const prev = usePlayerStore((s) => s.prev);
  const setIsPlaying = usePlayerStore((s) => s.setIsPlaying);
  const requestTogglePlayPause = usePlayerStore((s) => s.requestTogglePlayPause);

    const { data: session } = useSession();

  const hydrateLikes = usePlayerStore((s) => s.hydrateLikes);
  const likeSet = usePlayerStore((s) => s.likeSet);
  const toggleLike = usePlayerStore((s) => s.toggleLike);

  const setAutoPlay = usePlayerStore((s) => s.setAutoPlay);
const setRandomMode = usePlayerStore((s) => s.setRandomMode);

const queue = usePlayerStore((s) => s.queue);
const queueIndex = usePlayerStore((s) => s.queueIndex);

const currentSong = queue[queueIndex];

const [pos, setPos] = useState({ x: 16, y: 16 }); // right/bottom 대신 px
const draggingRef = useRef(false);
const offsetRef = useRef({ x: 0, y: 0 });
const wrapperRef = useRef<HTMLDivElement | null>(null);
const initRef = useRef(false);

  // ✅ Hook은 무조건 위에서 다 선언
  const prevToggleRef = useRef<number>(toggleSignal);

  useEffect(() => {
    if (!playerRef.current) return;
    if (prevToggleRef.current === toggleSignal) return;

    prevToggleRef.current = toggleSignal;

    const p = playerRef.current;
    const state = p.getPlayerState?.(); // 1 playing, 2 paused

    if (state === 1) {
      p.pauseVideo();
      setIsPlaying(false);
    } else {
      p.playVideo();
      setIsPlaying(true);
    }
  }, [toggleSignal, setIsPlaying]);

  useEffect(() => {
    if (!playerRef.current) return;
    if (isOpen) return;
    playerRef.current.stopVideo?.();
  }, [isOpen]);

    useEffect(() => {
    hydrateLikes();
  }, [hydrateLikes]);

  useEffect(() => {
  if (isMusicPage) return;

  const onMove = (e: MouseEvent) => {
  if (!draggingRef.current) return;

  const rect = wrapperRef.current?.getBoundingClientRect();
  const width = rect?.width ?? 360;
  const height = rect?.height ?? 260;
  const margin = 8;

  let x = e.clientX - offsetRef.current.x;
  let y = e.clientY - offsetRef.current.y;

  x = Math.min(window.innerWidth - width - margin, Math.max(margin, x));
  y = Math.min(window.innerHeight - height - margin, Math.max(margin, y));

  setPos({ x, y });
};

  const onUp = () => {
    draggingRef.current = false;
  };

  window.addEventListener("mousemove", onMove);
  window.addEventListener("mouseup", onUp);

  return () => {
    window.removeEventListener("mousemove", onMove);
    window.removeEventListener("mouseup", onUp);
  };
}, [isMusicPage]);

  const onReady: YouTubeProps["onReady"] = (e) => {
    playerRef.current = e.target;
  };

  const onStateChange: YouTubeProps["onStateChange"] = (e) => {
    if (e.data === 1) setIsPlaying(true);
    if (e.data === 2) setIsPlaying(false);
    if (e.data === 0) {
      setIsPlaying(false);
      if (autoPlay) next();
    }
  };

  useEffect(() => {
  // 음악 페이지에서는 pos 로직 안 씀
  if (isMusicPage) {
    initRef.current = false;
    return;
  }

  // 플레이어가 열렸을 때만 초기 위치 계산
  if (!isOpen) {
    initRef.current = false;
    return;
  }
  if (initRef.current) return;

  const margin = 16;

  // ✅ 실제 크기 기반으로 계산 (핵심)
  const rect = wrapperRef.current?.getBoundingClientRect();
  const width = rect?.width ?? 360;
  const height = rect?.height ?? 260;

  const x = Math.max(margin, window.innerWidth - width - margin);
  const y = Math.max(margin, window.innerHeight - height - margin);

  setPos({ x, y });
  initRef.current = true;
}, [isMusicPage, isOpen]);

  // ✅ 여기서부터 조건 return (Hook 다 호출된 뒤)
  if (!activeVideoId) return null;
  if (!isOpen) return null;

  const wrapperClass = isMusicPage
  ? `
      fixed top-55.5 right-50 z-[9999]
      w-[560px] max-w-[calc(100vw-2rem)]
      rounded-2xl border border-[var(--border)]
      bg-[var(--surface)] p-3 shadow-lg
    `
  : `
      z-[9999]
      w-[360px] max-w-[calc(100vw-2rem)]
      rounded-2xl border border-[var(--border)]
      bg-[var(--surface)] p-3 shadow-lg
    `;

    const wrapperStyle = !isMusicPage
  ? {
      position: "fixed" as const,
      left: pos.x,
      top: pos.y,
      width: 360,
      zIndex: 9999,
    }
  : undefined;


  return (
  <div
    ref={wrapperRef}
    className={wrapperClass}
    style={wrapperStyle}
  >
      <div
  className="mb-2 flex items-center justify-between gap-2 cursor-move"
  onMouseDown={(e) => {
    if (isMusicPage) return;
    draggingRef.current = true;
    offsetRef.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    };
  }}
>
        
        <div className="min-w-0">
  <div className="text-xs font-extrabold text-[var(--text-main)]">
    {currentSong?.title ?? "재생중"}
    {currentSong?.artist && (
    <div className="truncate text-[10px] text-[var(--text-sub)]">
      {currentSong.artist}
    </div>
  )}
  </div>
</div>


      <div className="flex items-center gap-2 shrink-0">
    {/* 🎵 music 이동 */}
    <Link
      href="/music"
      className="rounded-lg border border-[var(--border)] px-2 py-1 text-xs font-bold text-[var(--text-main)] hover:border-[#34E27A] transition"
      title="음악 탭으로"
    >
      🎵
    </Link>

    {/* ❤️ 좋아요 */}
    <button
      type="button"
      onClick={async () => {
        if (!activeVideoId) return;
        if (!session) {
          await signIn("google");
          return;
        }
        await toggleLike(activeVideoId);
      }}
      className={[
        "rounded-lg border px-2 py-1 text-xs font-bold transition",
        likeSet.has(activeVideoId)
          ? "border-[#FF4D6D]/40 bg-[#FF4D6D]/15 text-[#FF4D6D]"
          : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-main)] hover:border-[#FF4D6D]",
      ].join(" ")}
      title="좋아요"
      disabled={!activeVideoId}
    >
      {likeSet.has(activeVideoId) ? "❤️" : "🤍"}
    </button>

    {/* ❌ 닫기 */}
    <button
      type="button"
      onClick={close}
      className="rounded-lg border border-[var(--border)] px-2 py-1 text-xs font-bold text-[var(--text-main)] hover:border-red-400 transition"
      title="닫기"
    >
      ❌
    </button>
  </div>
</div>

      <div className="relative aspect-video overflow-hidden rounded-xl bg-black/30">
        <YouTube
          
          videoId={activeVideoId}
          onReady={onReady}
          onStateChange={onStateChange}
          opts={{
            width: "100%",
            height: "100%",
            playerVars: { autoplay: 1, rel: 0, modestbranding: 1 },
          }}
          className="absolute inset-0 h-full w-full"
          iframeClassName="absolute inset-0 h-full w-full"
        />
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
  {/* 왼쪽: 이전/재생/다음 */}
  <div className="flex items-center gap-1">
    <button
      type="button"
      onClick={prev}
      className="rounded-lg border border-[var(--border)] px-2 py-1.5 text-xs font-bold text-[var(--text-main)] hover:border-[#5CC4FF] transition"
    >
      ◀ 이전
    </button>

    <button
      type="button"
      onClick={requestTogglePlayPause}
      className="rounded-lg border border-[var(--border)] px-2 py-1.5 text-xs font-bold text-[var(--text-main)] hover:border-[#34E27A] transition"
      title={isPlaying ? "일시정지" : "재생"}
    >
      {isPlaying ? "⏸" : "▶"}
    </button>

    <button
      type="button"
      onClick={next}
      className="rounded-lg border border-[var(--border)] px-2 py-1.5 text-xs font-bold text-[var(--text-main)] hover:border-[#5CC4FF] transition"
    >
      다음 ▶
    </button>
  </div>

  {/* 오른쪽: 나머지 컨트롤 (네가 준 블록) */}
  <div className="flex items-center gap-1 flex-wrap">
    <button
      type="button"
      onClick={() => setAutoPlay(!autoPlay)}
      className={[
        "rounded-lg px-2 py-1.5 text-xs font-bold border transition",
        autoPlay
          ? "border-[#34E27A]/40 bg-[#34E27A]/15 text-[#34E27A]"
          : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-main)]",
      ].join(" ")}
    >
      {autoPlay ? "자동재생 ON" : "자동재생 OFF"}
    </button>

    <button
      type="button"
      onClick={() => setRandomMode(!randomMode)}
      className={[
        "rounded-lg px-2 py-1.5 text-xs font-bold border transition",
        randomMode
          ? "border-[#A78BFA]/40 bg-[#A78BFA]/15 text-[#A78BFA]"
          : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-main)]",
      ].join(" ")}
    >
      {randomMode ? "랜덤재생 ON" : "랜덤재생 OFF"}
    </button>
  </div>
</div>
    </div>
  );
}