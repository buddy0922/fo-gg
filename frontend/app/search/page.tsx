import SearchClient from "./SearchClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function SearchPage({
  searchParams,
}: {
  searchParams: { nickname?: string | string[] };
}) {
  const raw = searchParams?.nickname;
  const nickname = Array.isArray(raw) ? raw[0] : raw;

  return <SearchClient nickname={(nickname ?? "").toString()} />;
}