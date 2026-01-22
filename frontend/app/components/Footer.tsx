export default function Footer() {
  return (
    <footer className="w-full border-t border-zinc-200 bg-zinc-50 py-4 text-center text-sm
                       text-black dark:text-white
                       dark:bg-zinc-950 dark:border-zinc-800">
                        
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