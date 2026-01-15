"use client";

import { useEffect } from "react";

export default function ParallaxBg() {
  useEffect(() => {
    let raf = 0;

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY || 0;

        // ✅ “미묘한” 패럴랙스: 0.03~0.06 사이가 안전
        const offsetY = Math.min(28, y * 0.04);

        // 아주 약간 대각선 느낌 (원하면 0으로)
        const offsetX = Math.min(16, y * 0.015);

        document.documentElement.style.setProperty("--parallax-y", `${-offsetY}px`);
        document.documentElement.style.setProperty("--parallax-x", `${-offsetX}px`);
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return null;
}