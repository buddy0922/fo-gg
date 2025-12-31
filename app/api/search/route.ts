const idResp = await api.get("/id", {
  params: { nickname },
});

const user = idResp.data;
const ouid = user?.ouid;

// ⭐ 이 부분이 핵심
if (!ouid) {
  return NextResponse.json(
    { error: "user_not_found", nickname },
    { status: 404 }
  );
}

// ✅ ouid가 있을 때만 매치 조회
const matchesResp = await api.get("/user/match", {
  params: {
    ouid,
    matchtype: 50,
    offset: 0,
    limit: 10,
  },
});