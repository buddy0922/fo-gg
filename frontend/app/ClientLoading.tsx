"use client";

import { usePathname} from "next/navigation";
import { useEffect, useRef, useState } from "react";
import LoadingOverlay from "@/app/LoadingOverlay";

const SHOW_DELAY = 300;   // 이보다 빠르면 안 뜸
const MIN_VISIBLE = 600; // 뜨면 최소 유지

export default function ClientLoading() {
  const pathname = usePathname();

  const [loading, setLoading] = useState(false);

  const showTimer = useRef<NodeJS.Timeout | null>(null);
  const hideTimer = useRef<NodeJS.Timeout | null>(null);
  const shownAt = useRef<number | null>(null);

  useEffect(() => {
    // ✅ 검색 버튼에서 온 이동이면 전역 로딩 스킵
    const skip = sessionStorage.getItem("skipGlobalLoading");
    if (skip === "1") {
      sessionStorage.removeItem("skipGlobalLoading");
      return;
    }

    // 타이머 초기화
    if (showTimer.current) clearTimeout(showTimer.current);
    if (hideTimer.current) clearTimeout(hideTimer.current);

    // 🔹 일정 시간 지나야 로딩 표시
    showTimer.current = setTimeout(() => {
      shownAt.current = Date.now();
      setLoading(true);
    }, SHOW_DELAY);

    // ✅ 페이지 변경 완료 시 로딩 종료 예약
    hideTimer.current = setTimeout(() => {
      if (!shownAt.current) return;

      const elapsed = Date.now() - shownAt.current;
      const remain = Math.max(MIN_VISIBLE - elapsed, 0);

      setTimeout(() => {
        setLoading(false);
        shownAt.current = null;
      }, remain);
    }, SHOW_DELAY + 1);

    return () => {
      if (showTimer.current) clearTimeout(showTimer.current);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [pathname]);

  return <LoadingOverlay loading={loading} />;
}