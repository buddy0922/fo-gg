import { Suspense } from "react";
import SearchPageClient from "./SearchPageClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="max-w-3xl mx-auto p-6 text-white">로딩 중…</div>}>
      <SearchPageClient />
    </Suspense>
  );
}