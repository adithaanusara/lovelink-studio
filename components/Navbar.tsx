import Link from "next/link";
import { Heart, Sparkles } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
      <div className="container flex items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-3 text-sm font-semibold tracking-wide">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-violet-600 shadow-glow">
            <Heart className="h-5 w-5" />
          </div>
          <div>
            <p className="text-base">LoveLink Studio</p>
            <p className="text-xs text-slate-400">Create animated love pages</p>
          </div>
        </Link>

        <nav className="flex items-center gap-3">
          <Link
            href="/create"
            className="inline-flex items-center gap-2 rounded-full border border-pink-400/40 bg-pink-500/10 px-4 py-2 text-sm font-medium text-pink-100 transition hover:scale-[1.02] hover:bg-pink-500/20"
          >
            <Sparkles className="h-4 w-4" />
            Start creating
          </Link>
        </nav>
      </div>
    </header>
  );
}
