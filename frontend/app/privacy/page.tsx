export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 space-y-8">
      <h1 className="text-3xl font-extrabold text-black dark:text-white">
        개인정보처리방침
      </h1>

      <p className="text-zinc-700 dark:text-zinc-300">
        FCON.KR(이하 &quot;본 서비스&quot;)은 FC ONLINE 이용자를 위한 전적 조회 및
        경기 분석 서비스를 제공하는 웹 애플리케이션입니다.
        본 서비스는 이용자의 개인정보를 중요하게 생각하며,
        「개인정보 보호법」 및 관련 법령을 준수합니다.
      </p>

      <section className="space-y-2">
        <h2 className="text-xl font-bold text-black dark:text-white">
          1. 서비스의 기능 및 목적
        </h2>
        <p className="text-zinc-700 dark:text-zinc-300">
          본 서비스는 FC ONLINE 게임 이용자의 닉네임을 기반으로
          최근 경기 기록, 승률, 경기 분석 정보를 제공하는 것을 목적으로 합니다.
          사용자는 로그인하지 않아도 전적 검색 기능을 이용할 수 있으며,
          로그인 시 일부 사용자 맞춤 기능을 추가로 사용할 수 있습니다.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-bold text-black dark:text-white">
          2. 수집하는 개인정보 항목
        </h2>
        <p className="text-zinc-700 dark:text-zinc-300">
          본 서비스는 Google OAuth 로그인을 사용하는 경우에 한하여,
          아래의 개인정보를 수집합니다.
        </p>
        <ul className="list-disc list-inside text-zinc-700 dark:text-zinc-300">
          <li>이메일 주소</li>
          <li>프로필 이름</li>
          <li>프로필 이미지(URL)</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-bold text-black dark:text-white">
          3. 개인정보의 이용 목적
        </h2>
        <ul className="list-disc list-inside text-zinc-700 dark:text-zinc-300">
          <li>사용자 로그인 및 본인 인증</li>
          <li>서비스 이용 기록 관리</li>
          <li>좋아요 등 로그인 사용자 전용 기능 제공</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-bold text-black dark:text-white">
          4. 개인정보의 보관 및 파기
        </h2>
        <p className="text-zinc-700 dark:text-zinc-300">
          이용자의 개인정보는 서비스 이용 기간 동안 보관되며,
          회원 탈퇴 또는 계정 삭제 요청 시 지체 없이 파기됩니다.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-bold text-black dark:text-white">
          5. 개인정보의 제3자 제공
        </h2>
        <p className="text-zinc-700 dark:text-zinc-300">
          본 서비스는 이용자의 개인정보를 제3자에게 제공하지 않습니다.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-bold text-black dark:text-white">
          6. 개인정보처리방침의 공개 및 접근성
        </h2>
        <p className="text-zinc-700 dark:text-zinc-300">
          본 개인정보처리방침은 FCON.KR 도메인에서 직접 호스팅되며,
          사용자는 로그인 여부와 관계없이 언제든지 열람할 수 있습니다.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-bold text-black dark:text-white">
          7. 문의처
        </h2>
        <p className="text-zinc-700 dark:text-zinc-300">
          개인정보 보호와 관련한 문의 사항은 아래 이메일로 연락해 주시기 바랍니다.
        </p>
        <p className="text-zinc-700 dark:text-zinc-300 font-semibold">
          📧 foggservice12@gmail.com
        </p>
      </section>

      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        시행일: 2026년 1월 5일
      </p>
    </div>
  );
}