import SearchBox from "@/app/components/SearchBox";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      {/* 히어로 컨테이너 */}
      <div className="w-full max-w-3xl text-center space-y-8">

        {/* 🔥 FO.GG 로고 */}
        <div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight">
            FO.GG
          </h1>
        </div>

        {/* 메인 문구 */}
        <div className="space-y-3">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">
            FC ONLINE 전적을{" "}
            <span className="text-[#34E27A]">한눈에</span>
          </h2>
          <p className="text-gray-400 text-base md:text-lg">
            최근 경기 · 승률 · 상세 경기 분석까지
          </p>
        </div>

        {/* 검색 박스 */}
        <div className="bg-[#0F1218] border border-[#1C2230] rounded-2xl p-4 shadow-xl">
          <SearchBox />
        </div>

        {/* 하단 힌트 */}
        <p className="text-xs text-gray-500">
          닉네임을 입력하면 최근 공식 경기 전적을 확인할 수 있습니다
        </p>
      </div>
    </main>
  );
}