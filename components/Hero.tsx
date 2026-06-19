"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Heart, Sparkles, ArrowRight } from "lucide-react";
import { isLoggedIn } from "@/lib/auth-client";

export function Hero() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(isLoggedIn());
  }, []);

  const startCreatingHref = loggedIn ? "/create" : "/login?next=/create";

  return (
    <section className="relative overflow-hidden bg-sky-200 text-slate-900">
      <img
  src="/images/hero-bg.jpg"
  alt="Romantic digital memory"
  className="absolute inset-0 h-full w-full object-cover object-center"
/>

      <div className="absolute inset-0 bg-sky-100/62" />
      <div className="absolute inset-0 bg-gradient-to-b from-sky-100/80 via-sky-200/70 to-blue-300/78" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.22),transparent_34%),radial-gradient(circle_at_80%_20%,rgba(14,165,233,0.22),transparent_30%)]" />

      <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-sky-300/30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 right-0 h-80 w-80 rounded-full bg-blue-300/30 blur-3xl" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-76px)] w-full max-w-7xl items-center px-5 pb-10 pt-24 sm:px-6 sm:pb-14 sm:pt-28 lg:px-8">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <div className="mb-5 inline-flex max-w-full items-center gap-2 rounded-full border border-sky-400/80 bg-sky-100/90 px-4 py-2 text-xs font-bold text-sky-900 shadow-sm backdrop-blur-md sm:text-sm">
              <Sparkles className="h-4 w-4 shrink-0" />
              <span className="truncate">
                Cinematic animated surprise pages
              </span>
            </div>

            <h1 className="max-w-4xl text-[2.55rem] font-black leading-[0.98] tracking-[-0.045em] text-slate-950 sm:text-6xl md:text-7xl xl:text-8xl">
              Turn your{" "}
              <span className="bg-gradient-to-r from-pink-500 via-fuchsia-500 to-violet-600 bg-clip-text text-transparent">
                love story
              </span>{" "}
              into an immersive digital memory.
            </h1>

            <p className="mt-5 max-w-2xl text-base font-medium leading-8 text-slate-700 sm:mt-6 sm:text-lg md:text-xl">
              Create a beautiful romantic page with your own video, photos,
              heartfelt text, soft motion, and one private link to share with
              someone special.
            </p>

            <div className="mt-7 flex flex-col gap-4 sm:mt-8 sm:flex-row sm:flex-wrap">
              <Link
                href={startCreatingHref}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-pink-500 via-fuchsia-500 to-violet-600 px-7 py-4 text-base font-bold text-white shadow-[0_20px_80px_rgba(217,70,239,0.35)] transition hover:scale-[1.02]"
              >
                Start creating
                <ArrowRight className="h-4 w-4" />
              </Link>

              <a
                href="#features"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-sky-500 bg-sky-50/90 px-7 py-4 text-base font-bold text-slate-800 shadow-sm backdrop-blur-md transition hover:bg-sky-100"
              >
                See features
              </a>
            </div>

            <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-700 sm:mt-10">
              <span className="rounded-full border border-sky-400/80 bg-sky-100/90 px-4 py-2 backdrop-blur-md">
                Video hero
              </span>
              <span className="rounded-full border border-sky-400/80 bg-sky-100/90 px-4 py-2 backdrop-blur-md">
                Photos + message
              </span>
              <span className="rounded-full border border-sky-400/80 bg-sky-100/90 px-4 py-2 backdrop-blur-md">
                Private share link
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.15 }}
            className="hidden justify-self-end lg:block"
          >
            <div className="relative mx-auto w-full max-w-[420px] rounded-[2rem] border border-sky-400/80 bg-sky-100/90 p-4 shadow-[0_20px_70px_rgba(59,130,246,0.22)] backdrop-blur-2xl">
              <div className="mb-3 flex items-center justify-between px-2 pt-1 text-sm text-slate-600">
                <span>Live romantic preview</span>
                <span className="rounded-full bg-sky-200 px-3 py-1 text-xs text-sky-800">
                  Immersive
                </span>
              </div>

             <div className="overflow-hidden rounded-[1.6rem] border border-sky-300/70 bg-sky-100/60">
  <img
    src="/images/hero-bg.png"
    alt="Romantic preview"
    className="h-[500px] w-full object-cover object-center"
  />
</div>

<div className="absolute bottom-8 left-8 right-8 rounded-[1.5rem] border border-sky-400/80 bg-sky-100/90 p-5 backdrop-blur-xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-pink-100 px-3 py-1 text-xs uppercase tracking-[0.28em] text-pink-600">
                  <Heart className="h-3.5 w-3.5" />
                  For someone special
                </div>

                <h3 className="text-3xl font-bold leading-tight">
                  Happy Birthday, My Favorite Person
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-700">
                  A private page filled with your memories, your message, and a
                  cinematic first impression.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
