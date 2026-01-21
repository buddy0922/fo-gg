export default function Footer() {
  return (
    <footer className="w-full border-t border-zinc-200 bg-zinc-50 py-4 text-center text-sm
                       text-black dark:text-white
                       dark:bg-zinc-950 dark:border-zinc-800">
                        <section className="mt-16 max-w-3xl mx-auto px-6 text-left space-y-4">
  <h2 className="text-2xl font-bold text-black dark:text-white">
    FCON.KR 서비스 안내
  </h2>

  <p className="text-zinc-700 dark:text-zinc-300">
    FCON.KR은 FC ONLINE 이용자를 위한 전적 조회 및 경기 분석 웹 서비스입니다.
    사용자는 닉네임을 입력하여 최근 경기 기록, 승률, 경기 상세 정보를
    로그인 없이 자유롭게 확인할 수 있습니다.
  </p>

  <p className="text-zinc-700 dark:text-zinc-300">
    Google 로그인을 사용하는 경우, 전적 즐겨찾기, 좋아요 등
    사용자 맞춤 기능을 이용할 수 있습니다.
    이 과정에서 Google 계정을 통한 최소한의 사용자 식별 정보가 사용됩니다.
  </p>

  <p className="text-zinc-700 dark:text-zinc-300">
    본 서비스는 fcon.kr 도메인에서 직접 호스팅되며,
    개인정보 처리에 관한 자세한 내용은 아래 개인정보처리방침을 통해 확인할 수 있습니다.
  </p>

  <a
    href="https://fcon.kr/privacy"
    className="inline-block text-sm underline underline-offset-4
               text-black dark:text-white hover:opacity-80"
  >
    개인정보처리방침 보기
  </a>
</section>
      <div className="flex justify-center gap-4">
        <a
          href="/privacy"
          className="underline underline-offset-4 hover:opacity-80"
        >
          개인정보처리방침
        </a>

        <span className="opacity-50">|</span>

        <a
          href="/terms"
          className="underline underline-offset-4 hover:opacity-80"
        >
          서비스 이용약관
        </a>
      </div>

      <p className="mt-2 text-xs opacity-60">
        © {new Date().getFullYear()} FCON.kr
      </p>
    </footer>
  );
}