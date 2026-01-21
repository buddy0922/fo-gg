export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 space-y-6">
      <h1 className="text-3xl font-extrabold">서비스 이용약관</h1>

      <p className="text-gray-300">
        본 약관은 FCON(이하 &quot;본 서비스&quot;)이 제공하는 서비스의
        이용과 관련하여 필요한 사항을 규정합니다.
      </p>

      <section className="space-y-2">
        <h2 className="text-xl font-bold">1. 서비스의 목적</h2>
        <p className="text-gray-300">
          본 서비스는 FC 온라인 이용자를 위한 전적 검색 및 분석 정보를 제공합니다.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-bold">2. 회원 가입 및 이용</h2>
        <p className="text-gray-300">
          이용자는 Google 계정을 통해 로그인할 수 있으며,
          로그인 후 일부 기능(좋아요 등)을 사용할 수 있습니다.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-bold">3. 이용자의 의무</h2>
        <ul className="list-disc list-inside text-gray-300">
          <li>타인의 계정을 무단으로 사용하지 않아야 합니다.</li>
          <li>서비스의 정상적인 운영을 방해해서는 안 됩니다.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-bold">4. 서비스 제공의 중단</h2>
        <p className="text-gray-300">
          시스템 점검, 장애, 운영상 필요에 따라 서비스 제공이 일시 중단될 수 있습니다.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-bold">5. 책임의 제한</h2>
        <p className="text-gray-300">
          본 서비스는 제공되는 정보의 정확성에 대해 법적 책임을 지지 않습니다.
        </p>
      </section>

      <p className="text-sm text-gray-400">
        시행일: 2026년 1월 1일
      </p>
    </div>
  );
}