"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { isLoggedIn } from "@/lib/auth-client";

export function Hero() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(isLoggedIn());
  }, []);

  const startCreatingHref = loggedIn
    ? "/create"
    : "/login?next=/create";

  return (
    <section className="relative min-h-[calc(100svh-76px)] overflow-hidden bg-sky-100 text-slate-950">
      {/* Full hero background image */}
      <img
        src="/images/hero-bg.png"
        alt="LoveLink Studio romantic digital memory"
        className="absolute inset-0 h-full w-full object-cover object-[68%_center]"
      />

      {/* Left-side overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/78 to-white/10" />

      {/* Mobile overlay */}
      <div className="absolute inset-0 bg-white/25 lg:bg-transparent" />

      {/* Soft romantic lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(236,72,153,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(124,58,237,0.14),transparent_42%)]" />

      <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-pink-300/20 blur-3xl" />

      <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-violet-300/20 blur-3xl" />

      {/* Hero content */}
      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-76px)] w-full max-w-7xl items-center px-5 pb-12 pt-24 sm:px-6 sm:pb-16 sm:pt-28 lg:px-8">
        <motion.div
          initial={{
            opacity: 0,
            y: 28,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.8,
          }}
          className="w-full max-w-3xl"
        >
          {/* Badge */}
          <div className="mb-5 inline-flex max-w-full items-center gap-2 rounded-full border border-sky-300/80 bg-white/80 px-4 py-2 text-xs font-bold text-sky-900 shadow-sm backdrop-blur-md sm:text-sm">
            <Sparkles className="h-4 w-4 shrink-0 text-violet-600" />

            <span className="truncate">
              Cinematic animated surprise pages
            </span>
          </div>

          {/* Heading */}
          <h1 className="max-w-4xl text-[2.65rem] font-black leading-[0.96] tracking-[-0.05em] sm:text-6xl md:text-7xl xl:text-8xl">
            Turn your{" "}
            <span className="bg-gradient-to-r from-pink-500 via-fuchsia-500 to-violet-600 bg-clip-text text-transparent">
              love story
            </span>{" "}
            into an immersive digital memory.
          </h1>

          {/* Description */}
          <p className="mt-6 max-w-2xl text-base font-medium leading-8 text-slate-700 sm:text-lg md:text-xl">
            Create a beautiful romantic page with your own photos,
            heartfelt text, soft motion, and one private link to share
            with someone special.
          </p>

          {/* Buttons */}
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
            <Link
              href={startCreatingHref}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-pink-500 via-fuchsia-500 to-violet-600 px-7 py-4 text-base font-bold text-white shadow-[0_20px_60px_rgba(217,70,239,0.32)] transition duration-300 hover:scale-[1.02]"
            >
              Start creating
              <ArrowRight className="h-4 w-4" />
            </Link>

            <a
              href="#features"
              className="inline-flex items-center justify-center rounded-full border border-sky-400 bg-white/80 px-7 py-4 text-base font-bold text-slate-800 shadow-sm backdrop-blur-md transition duration-300 hover:bg-white"
            >
              See features
            </a>
          </div>

          {/* Feature chips */}
          <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-700 sm:mt-10">
            <span className="rounded-full border border-sky-300/80 bg-white/75 px-4 py-2 backdrop-blur-md">
              3D romantic design
            </span>

            <span className="rounded-full border border-sky-300/80 bg-white/75 px-4 py-2 backdrop-blur-md">
              Photos + messages
            </span>

            <span className="rounded-full border border-sky-300/80 bg-white/75 px-4 py-2 backdrop-blur-md">
              Private share link
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}