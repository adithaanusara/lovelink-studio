"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, Menu, Sparkles, X } from "lucide-react";
import { Logo } from "@/components/Logo";
import { getSessionEmail, isLoggedIn, logout } from "@/lib/auth-client";

const links = [
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How it works" }
];

export function Navbar() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    setLoggedIn(isLoggedIn());
    setEmail(getSessionEmail());
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    // The menu is phone-only, so close it if the window grows past that layout.
    const desktop = window.matchMedia("(min-width: 768px)");
    const onDesktop = () => {
      if (desktop.matches) setMenuOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    desktop.addEventListener("change", onDesktop);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", onDesktop);
    };
  }, [menuOpen]);

  const handleLogout = () => {
    logout();
    setLoggedIn(false);
    setEmail(null);
    setMenuOpen(false);
    router.push("/");
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between gap-3">
        <Logo tagline="Create animated love pages" />

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-900/5 hover:text-slate-950"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Session lives in the browser, so hold the actions back until it has been read. */}
        <div className={`flex shrink-0 items-center gap-2 ${mounted ? "" : "invisible"}`}>
          {loggedIn ? (
            <>
              {email ? (
                <span
                  title={email}
                  className="hidden max-w-[220px] truncate rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 lg:block"
                >
                  {email}
                </span>
              ) : null}

              <button
                type="button"
                onClick={handleLogout}
                className="btn btn-ghost hidden md:inline-flex"
              >
                Log out
              </button>

              <Link href="/create" className="btn btn-primary shrink-0 whitespace-nowrap px-4 sm:px-5">
                <Sparkles className="h-4 w-4" />
                <span className="hidden min-[380px]:inline">Start creating</span>
                <span className="min-[380px]:hidden">Create</span>
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost hidden md:inline-flex">
                Log in
              </Link>

              <Link href="/signup" className="btn btn-dark shrink-0 whitespace-nowrap px-4 sm:px-5">
                Sign up
              </Link>
            </>
          )}

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-800 shadow-sm transition hover:bg-slate-50 md:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen ? (
          <>
            {/* Absolute, not fixed: the header's backdrop blur would trap a fixed child inside it. */}
            <motion.button
              type="button"
              aria-label="Close menu"
              tabIndex={-1}
              onClick={closeMenu}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-x-0 top-full z-40 h-[100svh] cursor-default bg-slate-950/25 md:hidden"
            />

            <motion.div
              id="mobile-menu"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="absolute inset-x-0 top-full z-50 max-h-[calc(100svh-4rem)] overflow-y-auto border-b border-slate-200 bg-white shadow-xl md:hidden"
            >
              <div className="container flex flex-col gap-1 py-4">
                {loggedIn && email ? (
                  <p className="mb-2 truncate rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    Signed in as{" "}
                    <span className="font-semibold text-slate-900">{email}</span>
                  </p>
                ) : null}

                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMenu}
                    className="flex min-h-[48px] items-center rounded-2xl px-4 text-base font-semibold text-slate-800 transition hover:bg-slate-50"
                  >
                    {link.label}
                  </Link>
                ))}

                <div className="mt-3 grid gap-2 border-t border-slate-100 pt-4">
                  {loggedIn ? (
                    <>
                      <Link href="/create" onClick={closeMenu} className="btn btn-primary btn-lg">
                        <Sparkles className="h-4 w-4" />
                        Start creating
                      </Link>

                      <button type="button" onClick={handleLogout} className="btn btn-secondary btn-lg">
                        <LogOut className="h-4 w-4" />
                        Log out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/signup" onClick={closeMenu} className="btn btn-primary btn-lg">
                        Sign up
                      </Link>

                      <Link href="/login" onClick={closeMenu} className="btn btn-secondary btn-lg">
                        Log in
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
