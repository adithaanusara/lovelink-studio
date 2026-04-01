"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, Sparkles, ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-black text-white">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/videos/hero-video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="absolute inset-0 bg-black/45" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-[#050816]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(236,72,153,0.18),transparent_32%),radial-gradient(circle_at_80%_20%,rgba(139,92,246,0.18),transparent_28%)]" />

      <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-pink-500/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 right-0 h-80 w-80 rounded-full bg-violet-500/20 blur-3xl" />

      <div className="relative z-10 container flex min-h-screen items-center px-6 py-16">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-pink-100 backdrop-blur-md">
              <Sparkles className="h-4 w-4" />
              Cinematic animated surprise pages
            </div>

            <h1 className="max-w-4xl text-5xl font-black leading-[0.95] tracking-tight md:text-7xl xl:text-8xl">
              Turn your{" "}
              <span className="bg-gradient-to-r from-pink-300 via-fuchsia-300 to-violet-300 bg-clip-text text-transparent">
                love story
              </span>{" "}
              into an immersive digital memory.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/80 md:text-xl">
              Create a beautiful romantic page with your own video, photos,
              heartfelt text, soft motion, and one private link to share with
              someone special.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/create"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 via-fuchsia-500 to-violet-600 px-7 py-4 text-base font-semibold text-white shadow-[0_20px_80px_rgba(217,70,239,0.35)] transition hover:scale-[1.02]"
              >
                Start creating
                <ArrowRight className="h-4 w-4" />
              </Link>

              <a
                href="#features"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 py-4 text-base font-semibold text-white/90 backdrop-blur-md transition hover:bg-white/10"
              >
                See features
              </a>
            </div>

            <div className="mt-10 flex flex-wrap gap-3 text-sm text-white/75">
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md">
                Video hero
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md">
                Photos + message
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md">
                Private share link
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.15 }}
            className="justify-self-end"
          >
            <div className="relative mx-auto w-full max-w-[420px] rounded-[2rem] border border-white/15 bg-white/8 p-4 shadow-[0_25px_100px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
              <div className="mb-3 flex items-center justify-between px-2 pt-1 text-sm text-white/75">
                <span>Live romantic preview</span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs">
                  Immersive
                </span>
              </div>

              <div className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-black/30">
                <video
                  className="h-[500px] w-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                >
                  <source src="/videos/hero-video.mp4" type="video/mp4" />
                </video>
              </div>

              <div className="absolute bottom-8 left-8 right-8 rounded-[1.5rem] border border-white/10 bg-black/35 p-5 backdrop-blur-xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-pink-500/15 px-3 py-1 text-xs uppercase tracking-[0.28em] text-pink-100">
                  <Heart className="h-3.5 w-3.5" />
                  For someone special
                </div>

                <h3 className="text-3xl font-bold leading-tight">
                  Happy Birthday, My Favorite Person
                </h3>

                <p className="mt-3 text-sm leading-7 text-white/80">
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