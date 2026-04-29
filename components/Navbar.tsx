"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Sparkles } from "lucide-react";
import { getSessionEmail, isLoggedIn, logout } from "@/lib/auth-client";

export function Navbar() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    setLoggedIn(isLoggedIn());
    setEmail(getSessionEmail());
  }, []);

  const handleLogout = () => {
    logout();
    setLoggedIn(false);
    setEmail(null);
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-sky-400/80 bg-sky-200/90 backdrop-blur-xl">
      <div className="container flex items-center justify-between gap-4 py-4">
        <Link
          href="/"
          className="flex items-center gap-3 text-sm font-semibold tracking-wide text-slate-900"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-violet-600 text-white shadow-glow">
            <Heart className="h-5 w-5" />
          </div>

          <div className="hidden sm:block">
            <p className="text-base">LoveLink Studio</p>
            <p className="text-xs text-slate-600">
              Create animated love pages
            </p>
          </div>
        </Link>

        <nav className="flex flex-wrap items-center justify-end gap-2 md:gap-3">
          {mounted && loggedIn ? (
            <>
              {email ? (
                <span className="max-w-[210px] truncate rounded-full border border-sky-400 bg-sky-50 px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm md:max-w-[300px]">
                  {email}
                </span>
              ) : null}

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center rounded-full border border-sky-500 bg-sky-50 px-4 py-2 text-sm font-bold text-slate-800 shadow-sm transition hover:bg-sky-100"
              >
                Logout
              </button>

              <Link
                href="/create"
                className="inline-flex items-center gap-2 rounded-full border border-pink-300 bg-pink-50 px-4 py-2 text-sm font-bold text-pink-700 shadow-sm transition hover:scale-[1.02] hover:bg-pink-100"
              >
                <Sparkles className="h-4 w-4" />
                Start creating
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex items-center rounded-full border border-sky-500 bg-sky-50 px-5 py-2 text-sm font-bold text-slate-800 shadow-sm transition hover:bg-sky-100"
              >
                Login
              </Link>

              <Link
                href="/signup"
                className="inline-flex items-center rounded-full border border-violet-300 bg-violet-50 px-5 py-2 text-sm font-bold text-violet-700 shadow-sm transition hover:bg-violet-100"
              >
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}