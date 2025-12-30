"use client";

import { createContext, useContext, useState } from "react";

const LoadingContext = createContext<{
  start: () => void;
  stop: () => void;
}>({
  start: () => {},
  stop: () => {},
});

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(false);

  return (
    <LoadingContext.Provider
      value={{
        start: () => setLoading(true),
        stop: () => setLoading(false),
      }}
    >
      {children}
      {loading && <div id="global-loading-flag" />}
    </LoadingContext.Provider>
  );
}

export const useGlobalLoading = () => useContext(LoadingContext);