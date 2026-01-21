export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 space-y-6">
      <h1 className="text-3xl font-extrabold">개인정보처리방침</h1>

      <p className="text-gray-300">
        FCON(이하 &quot;본 서비스&quot;)은 이용자의 개인정보를 중요하게 생각하며,
        관련 법령을 준수합니다.
      </p>

      <section className="space-y-2">
        <h2 className="text-xl font-bold">1. 수집하는 개인정보 항목</h2>
        <p className="text-gray-300">
          본 서비스는 Google OAuth 로그인을 통해 아래 정보를 수집합니다.
        </p>
        <ul className="list-disc list-inside text-gray-300">
          <li>이메일 주소</li>
          <li>프로필 이름</li>
          <li>프로필 이미지(URL)</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-bold">2. 개인정보의 이용 목적</h2>
        <ul className="list-disc list-inside text-gray-300">
          <li>사용자 로그인 및 인증</li>
          <li>서비스 이용 기록 관리</li>
          <li>좋아요 등 사용자 기능 제공</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-bold">3. 개인정보의 보관 및 파기</h2>
        <p className="text-gray-300">
          이용자의 개인정보는 서비스 이용 기간 동안 보관되며,
          탈퇴 시 지체 없이 파기됩니다.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-bold">4. 제3자 제공</h2>
        <p className="text-gray-300">
          본 서비스는 이용자의 개인정보를 제3자에게 제공하지 않습니다.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-bold">5. 문의</h2>
        <p className="text-gray-300">
          개인정보 관련 문의는 아래 이메일로 연락해 주세요.
        </p>
        <p className="text-gray-300 font-semibold">
          📧 foggservice12@gmail.com
        </p>
      </section>

      <p className="text-sm text-gray-400">
        시행일: 2026년 1월 1일
      </p>
    </div>
  );
}