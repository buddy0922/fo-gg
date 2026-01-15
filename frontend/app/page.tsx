import SearchBox from "@/app/components/SearchBox";
import { Suspense } from "react";
import { fcLogoFont } from "./fonts/fcLogoFont";


export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      {/* 히어로 컨테이너 */}
      <div className="w-full max-w-3xl text-center space-y-8">

        {/* 🔥 FO.GG 로고 */}
        <div>
          <h1 className="text-4xl text-shadow-logo md:text-5xl font-extrabold tracking-[0.03em] fc-logo-font">
  FO.GG
</h1>
        </div>

        {/* 메인 문구 */}
        <div className="space-y-3">
          <h2 className="inline-flex items-baseline">
  {/* ✅ 여기만 fc-logo-font 적용 */}
  <span className="fc-logo-font text-shadow-logo text-3xl md:text-4xl tracking-[0.01em] mr-10 scale-[1.05] inline-block origin-left">
    FC ONLINE
  </span>

  {/* ✅ 한글은 기본 폰트 유지 */}
  <span className="text-4xl md:text-5xl text-shadow-logo font-extrabold mr-3">
    전적을
  </span>
  <span
  className="
    text-4xl md:text-5xl font-extrabold
    text-[#5AFF8A]
    dark:text-[#34E27A]

    /* 기본 깊이 그림자 */
    drop-shadow-[0_2px_4px_rgba(0,0,0,0.09)]

    /* 네온 느낌 */
    drop-shadow-[0_0_6px_rgba(90,255,138,0.40)]
    dark:drop-shadow-[0_0_6px_rgba(52,226,122,0.35)]
  "
>
  한눈에
</span>
</h2>
          <p className="text-gray-400 text-shadow-logo text-base md:text-lg">
            최근 경기 · 승률 · 상세 경기 분석까지
          </p>
        </div>

        {/* 검색 박스 */}
        <Suspense fallback={null}>
          
            <SearchBox />
          
        </Suspense>

        {/* 하단 힌트 */}
        <p className="text-xs text-gray-500">
          닉네임을 입력하면 최근 공식 경기 전적을 확인할 수 있습니다
        </p>
      </div>
    </main>
  );
}