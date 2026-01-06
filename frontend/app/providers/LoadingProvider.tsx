"use client";

import { createContext, useContext, useMemo, useState } from "react";
import LoadingOverlay from "@/app/LoadingOverlay";

type LoadingCtx = {
  loading: boolean;
  setLoading: (v: boolean) => void;
};

const Ctx = createContext<LoadingCtx | null>(null);

export function useLoading() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useLoading must be used within LoadingProvider");
  return v;
}

export default function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(false);

  const value = useMemo(() => ({ loading, setLoading }), [loading]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <LoadingOverlay loading={loading} />
    </Ctx.Provider>
  );
}