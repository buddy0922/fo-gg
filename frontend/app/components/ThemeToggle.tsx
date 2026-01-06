"use client";

import { useTheme } from "@/app/providers/ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      className="px-3 py-1.5 rounded-lg text-sm font-semibold
                 bg-white/10 hover:bg-white/15 border border-white/10
                 transition"
      aria-label="Toggle theme"
      title={theme === "dark" ? "라이트 모드" : "다크 모드"}
    >
      {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
    </button>
  );
}