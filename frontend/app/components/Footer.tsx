export default function Footer() {
  return (
    <footer className="w-full border-t border-zinc-200 bg-zinc-50 py-4 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex justify-center gap-4">
        <a
          href="/privacy"
          className="hover:text-zinc-800 dark:hover:text-zinc-200 underline underline-offset-4"
        >
          개인정보처리방침
        </a>

        <span className="text-zinc-400">|</span>

        <a
          href="/terms"
          className="hover:text-zinc-800 dark:hover:text-zinc-200 underline underline-offset-4"
        >
          서비스 이용약관
        </a>
      </div>

      <p className="mt-2 text-xs text-zinc-400">
        © {new Date().getFullYear()} FCON.kr
      </p>
    </footer>
  );
}