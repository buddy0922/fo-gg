export default function ServiceInfoPage() {
  return (
    <div className="max-w-2xl mx-auto p-6 text-gray-300">
      <h1 className="text-2xl font-bold mb-6 text-white">
        서비스 안내
      </h1>

      <p className="mb-4">
        본 서비스는 넥슨 Open API를 활용한 비공식 전적 조회 서비스입니다.
      </p>

      <ul className="list-disc pl-5 space-y-2 text-sm">
        <li>
          본 서비스는 EA SPORTS FC Online 또는 넥슨과 직접적인
          제휴 관계가 없습니다.
        </li>
        <li>
          모든 경기 데이터 및 티어 정보는 넥슨 Open API를 통해
          제공받으며, 서버 상태에 따라 조회가 제한될 수 있습니다.
        </li>
        <li>
          실시간 데이터가 아니며, 일부 정보는 지연 또는 누락될 수 있습니다.
        </li>
        <li>
          본 서비스는 개인 프로젝트 및 정보 제공 목적이며,
          상업적 용도로 사용되지 않습니다.
        </li>
      </ul>

      <p className="mt-6 text-sm text-gray-400">
        © 2025. This site is not affiliated with NEXON Korea.
      </p>
    </div>
  );
}