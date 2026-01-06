import SearchPageClient from "./SearchPageClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function SearchPage() {
  return <SearchPageClient />;
}