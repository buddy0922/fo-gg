"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function FcNicknameGate() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [me, setMe] = useState<{ fcNickname?: string | null } | null>(null);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  useEffect(() => {
    if (status !== "authenticated") return;

    (async () => {
      const res = await fetch("/api/me", { cache: "no-store" });
      const json = await res.json().catch(() => null);
      const fc = json?.user?.fcNickname ?? null;
      setMe({ fcNickname: fc });

      if (!fc) setOpen(true);
    })();
  }, [status]);

  useEffect(() => {
    const openGate = () => {
      setOpen(true);
    };

    window.addEventListener("open-fc-nickname-gate", openGate);

    return () => {
      window.removeEventListener("open-fc-nickname-gate", openGate);
    };
  }, []);

  if (status !== "authenticated") return null;
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <div className="text-lg font-extrabold text-[var(--text-main)]">
          구단주 등록
        </div>
        <div className="mt-1 text-sm text-[var(--text-sub)]">
          로그인하신 계정에 FC온라인 구단주명을 등록할까요?
        </div>

        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="구단주명(닉네임)"
          className="mt-4 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-main)]"
        />

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-bold text-[var(--text-sub)]"
          >
            나중에
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={async () => {
              const nick = value.trim();
              if (!nick) return;

              setLoading(true);
              try {
                const res = await fetch("/api/me/fc-nickname", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ fcNickname: nick }),
                });
                if (!res.ok) return;

                setMe({ fcNickname: nick });
                setOpen(false);
                router.refresh();
              } finally {
                setLoading(false);
              }
            }}
            className="cursor-pointer rounded-lg bg-[#34E27A] px-3 py-2 text-sm font-extrabold text-black hover:opacity-90 disabled:opacity-60"
          >
            등록
          </button>
        </div>
      </div>
    </div>
  );
}