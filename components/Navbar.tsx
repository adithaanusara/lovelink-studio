import Link from "next/link";
import { Heart, Sparkles } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-sky-400/80 bg-sky-200/80 backdrop-blur-xl">
      <div className="container flex items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-3 text-sm font-semibold tracking-wide text-slate-900">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-violet-600 shadow-glow">
            <Heart className="h-5 w-5" />
          </div>
          <div>
            <p className="text-base">LoveLink Studio</p>
            <p className="text-xs text-slate-600">Create animated love pages</p>
          </div>
        </Link>

        <nav className="flex items-center gap-2 md:gap-3">
          <Link
            href="/login"
            className="inline-flex items-center rounded-full border border-sky-500/60 bg-sky-100/95 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-sky-200"
          >
            Login
          </Link>

          <Link
            href="/signup"
            className="inline-flex items-center rounded-full border border-violet-300/60 bg-violet-100/80 px-4 py-2 text-sm font-semibold text-violet-700 transition hover:bg-violet-200/80"
          >
            Sign Up
          </Link>

          <Link
            href="/create"
            className="inline-flex items-center gap-2 rounded-full border border-pink-300/70 bg-pink-100/90 px-4 py-2 text-sm font-medium text-pink-700 transition hover:scale-[1.02] hover:bg-pink-200"
          >
            <Sparkles className="h-4 w-4" />
            Start creating
          </Link>
        </nav>
      </div>
    </header>
  );
}
