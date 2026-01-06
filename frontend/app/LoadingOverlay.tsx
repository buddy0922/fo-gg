"use client";

import { useEffect, useState } from "react";
import { TIPS } from "@/app/lib/tips";
import { QUOTES } from "@/app/lib/quotes";

export default function LoadingOverlay({ loading }: { loading: boolean }) {

  const [tip] = useState(
    () => TIPS[Math.floor(Math.random() * TIPS.length)]
  );
  const [quote] = useState(
    () => QUOTES[Math.floor(Math.random() * QUOTES.length)]
  );

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
      <div className="text-center max-w-md px-6 text-gray-200">
        {/* 로딩 원 */}
        <div className="mb-4 flex justify-center">
          <div className="h-8 w-8 rounded-full border-4 border-gray-300 border-t-[#34E27A] animate-spin" />
        </div>

        <p className="text-xs font-semibold mb-2">TIP</p>
        <p className="text-sm font-medium mb-4">{tip}</p>

        <p className="text-xs text-gray-400 italic">{quote}</p>
      </div>
    </div>
  );
}