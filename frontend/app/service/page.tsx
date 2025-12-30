export default function ServicePage() {
  return (
    <div className="max-w-3xl mx-auto p-6 text-white space-y-6">
      <h1 className="text-2xl font-extrabold">서비스 안내</h1>

      <section className="space-y-2">
        <h2 className="font-bold">데이터 출처</h2>
        <p className="text-sm text-gray-300 leading-relaxed">
          본 서비스는 넥슨 Open API(FC온라인)를 기반으로 공개된 데이터를 조회하여
          제공하는 비공식 전적 조회 서비스입니다.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-bold">데이터 정확성</h2>
        <p className="text-sm text-gray-300 leading-relaxed">
          제공되는 전적 및 경기 정보는 실시간 데이터가 아니며,
          넥슨 서버 상태, API 제한, 네트워크 환경에 따라
          일부 정보가 지연되거나 누락될 수 있습니다.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-bold">서비스 제한</h2>
        <p className="text-sm text-gray-300 leading-relaxed">
          넥슨 서버 점검 또는 일시적인 장애 발생 시
          전적 조회 및 경기 상세 정보 제공이 제한될 수 있습니다.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-bold">권리 고지</h2>
        <p className="text-sm text-gray-300 leading-relaxed">
          FC온라인 및 관련 데이터의 저작권은
          NEXON Korea Corporation에 귀속됩니다.
          본 서비스는 상업적 목적이 아닌 정보 제공을 목적으로 합니다.
        </p>
      </section>

      <p className="text-xs text-gray-500 pt-4">
        © FO.GG — Unofficial FC Online Statistics Service
      </p>
    </div>
  );
}