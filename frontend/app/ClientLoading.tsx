"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useLoading } from "@/app/providers/LoadingProvider";

export default function ClientLoading() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { setLoading } = useLoading();

  useEffect(() => {
    // 라우트 이동이 “완료되어 렌더”되면 로딩 종료
    setLoading(false);
  }, [pathname, searchParams, setLoading]);

  return null;
}