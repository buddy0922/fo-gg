// app/music/_store/playerStore.ts
import { create } from "zustand";

export type QueueItem = {
  videoId: string;
  title?: string;
  artist?: string;
};

type PlayerState = {
  // ====== core ======
  activeVideoId: string;
  isPlaying: boolean;
  isOpen: boolean;

  // ====== options ======
  autoPlay: boolean;
  randomMode: boolean;

  // ====== queue ======
  queue: QueueItem[];
  queueIndex: number;

  // ====== setters (기존 유지) ======
  setActiveVideoId: (id: string) => void;
  setIsPlaying: (v: boolean) => void;
  setAutoPlay: (v: boolean) => void;
  setRandomMode: (v: boolean) => void;

  // ====== actions (추가) ======
  open: () => void;
  close: () => void; // ❌ 닫기: 상태 초기화 (실제 stopVideo는 GlobalPlayer에서)
  setQueue: (queue: QueueItem[], startVideoId?: string) => void;

  next: () => void;
  prev: () => void;

  syncFromVideoId: (videoId: string) => void;
  

    // ====== likes ======
  likesLoaded: boolean;
  likeSet: Set<string>;
  likeCounts: Record<string, number>;
  hydrateLikes: () => Promise<void>;
  toggleLike: (videoId: string) => Promise<void>;

  // (선택) 외부에서 재생/일시정지 토글 처리할 때 쓰기 좋음
  requestTogglePlayPause: () => void;
  toggleSignal: number; // 토글 요청 카운터 (GlobalPlayer가 감지)

  
};

export const usePlayerStore = create<PlayerState>((set, get) => ({
  // ====== initial ======
  activeVideoId: "",
  isPlaying: false,
  isOpen: false,

  autoPlay: true,
  randomMode: false,

  queue: [],
  queueIndex: 0,

  toggleSignal: 0,

  // ====== setters ======
  setActiveVideoId: (id) => set({ activeVideoId: id, isOpen: true }),
  setIsPlaying: (v) => set({ isPlaying: v }),
  setAutoPlay: (v) => set({ autoPlay: v }),
  setRandomMode: (v) => set({ randomMode: v }),

    // ====== likes (initial) ======
  likesLoaded: false,
  likeSet: new Set<string>(),
  likeCounts: {},

  hydrateLikes: async () => {
    const { likesLoaded } = get();
    if (likesLoaded) return;

    try {
      const res = await fetch("/api/music/likes");
      const json = await res.json();

      set({
        likesLoaded: true,
        likeSet: new Set<string>(json.likes ?? []),
        likeCounts: json.counts ?? {},
      });
    } catch {
      // 실패해도 앱은 돌아가야 함
      set({ likesLoaded: true });
    }
  },

  // app/music/_store/playerStore.ts
toggleLike: async (videoId: string) => {
  const prevSet = get().likeSet;
  const prevCounts = get().likeCounts;

  const wasLiked = prevSet.has(videoId);

  // ✅ optimistic update (불변 Set)
  const nextSet = new Set(prevSet);
  if (wasLiked) nextSet.delete(videoId);
  else nextSet.add(videoId);

  const cur = prevCounts[videoId] ?? 0;
  const nextCount = Math.max(0, cur + (wasLiked ? -1 : 1));

  set({
    likeSet: nextSet,
    likeCounts: { ...prevCounts, [videoId]: nextCount },
  });

  try {
    const res = await fetch("/api/music/likes", {
      method: wasLiked ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoId }),
      credentials: "same-origin",
    });

    // ✅ 실패하면 롤백
    if (!res.ok) {
      set({ likeSet: prevSet, likeCounts: prevCounts });

      // (선택) 401이면 로그인 풀린 거라서 여기서 signIn 유도하고 싶으면
      // if (res.status === 401) alert("로그인이 필요합니다");
      return;
    }

    const json = await res.json();
    // ✅ 서버 진실값으로 확정
    set((s) => {
      const fixed = new Set(s.likeSet);
      if (json.liked) fixed.add(videoId);
      else fixed.delete(videoId);

      return {
        likeSet: fixed,
        likeCounts: { ...s.likeCounts, [videoId]: json.count ?? s.likeCounts[videoId] ?? 0 },
      };
    });
  } catch {
    // 네트워크 실패도 롤백
    set({ likeSet: prevSet, likeCounts: prevCounts });
  }
},
  // ====== actions ======
  open: () => set({ isOpen: true }),

  close: () =>
    set({
      isOpen: false,
      isPlaying: false,
      activeVideoId: "",
      queue: [],
      queueIndex: 0,
    }),

  setQueue: (queue, startVideoId) => {
    const startIdx =
      startVideoId ? Math.max(0, queue.findIndex((q) => q.videoId === startVideoId)) : 0;

    const safeIdx = startIdx >= 0 ? startIdx : 0;
    const id = queue[safeIdx]?.videoId ?? "";

    set({
      queue,
      queueIndex: safeIdx,
      activeVideoId: id,
      isOpen: true,
      isPlaying: !!id, // 곡이 있으면 재생 상태로(실제 play는 GlobalPlayer가)
    });
  },

  next: () => {
    const { queue, queueIndex, randomMode, activeVideoId } = get();
    if (!queue.length) return;

    // 랜덤이면 현재랑 다른 곡을 고름(1곡이면 그대로)
    if (randomMode) {
      let nextIdx = queueIndex;
      while (queue.length > 1 && nextIdx === queueIndex) {
        nextIdx = Math.floor(Math.random() * queue.length);
      }
      set({ queueIndex: nextIdx, activeVideoId: queue[nextIdx].videoId, isOpen: true, isPlaying: true });
      return;
    }

    // 순차
    const nextIdx = (queueIndex + 1) % queue.length;
    set({ queueIndex: nextIdx, activeVideoId: queue[nextIdx].videoId, isOpen: true, isPlaying: true });
  },

  prev: () => {
    const { queue, queueIndex } = get();
    if (!queue.length) return;

    const prevIdx = (queueIndex - 1 + queue.length) % queue.length;
    set({ queueIndex: prevIdx, activeVideoId: queue[prevIdx].videoId, isOpen: true, isPlaying: true });
  },

    syncFromVideoId: (videoId: string) =>
    set((state) => {
      const idx = state.queue.findIndex((s) => s.videoId === videoId);
      if (idx === -1) return {};
      return {
        queueIndex: idx,
        activeVideoId: videoId,
        isOpen: true,
        isPlaying: true,
      };
    }),

  requestTogglePlayPause: () => set((s) => ({ toggleSignal: s.toggleSignal + 1 })),
}));