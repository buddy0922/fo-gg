"use client";

import { useTheme } from "@/app/providers/ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      className="px-3 py-1.5 rounded-lg text-sm font-semibold
           bg-gray-200 hover:bg-gray-300 border border-gray-300
           dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600
           text-black dark:text-white
           transition"
      aria-label="Toggle theme"
      title={theme === "dark" ? "라이트 모드" : "다크 모드"}
    >
      {theme === "dark" ? "☀️ " : "🌙"}
    </button>
  );
}