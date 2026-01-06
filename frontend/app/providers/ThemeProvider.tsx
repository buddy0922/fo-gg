"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type Theme = "light" | "dark";

type ThemeCtx = {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeCtx | null>(null);

function applyThemeToHtml(theme: Theme) {
  const html = document.documentElement;
  if (theme === "dark") html.classList.add("dark");
  else html.classList.remove("dark");
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark"); // 기본값: 다크(원하면 light로 바꿔)

  useEffect(() => {
    // 1) 저장값 우선
    const saved = (localStorage.getItem("fo_theme") as Theme | null);
    if (saved === "light" || saved === "dark") {
      setThemeState(saved);
      applyThemeToHtml(saved);
      return;
    }

    // 2) OS 설정 따라가기(저장값 없을 때만)
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
    const init = prefersDark ? "dark" : "light";
    setThemeState(init);
    applyThemeToHtml(init);
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    applyThemeToHtml(t);
    localStorage.setItem("fo_theme", t);
  };

  const toggle = () => setTheme(theme === "dark" ? "light" : "dark");

  const value = useMemo(() => ({ theme, setTheme, toggle }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}