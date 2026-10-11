"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { isLoggedIn } from "@/lib/auth-client";

const highlights = ["3D romantic design", "Photos + messages", "Private share link"];

export function Hero() {
  const [loggedIn, setLoggedIn] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    setLoggedIn(isLoggedIn());
  }, []);

  const startCreatingHref = loggedIn
    ? "/create"
    : "/login?next=/create";

  return (
    <section className="relative overflow-hidden text-slate-950 [--art:min(92vw,430px)] sm:min-h-[calc(100svh-4rem)]">
      {/* Hero artwork: a band under the text on phones, the full background from tablets up */}
      <div className="absolute inset-x-0 bottom-0 h-[var(--art)] [mask-image:linear-gradient(to_bottom,transparent,black_26%)] sm:inset-0 sm:h-auto sm:[mask-image:none]">
        <Image
          src="/images/hero-bg.png"
          alt="LoveLink Studio romantic digital memory"
          fill
          priority
          sizes="(max-width: 1023px) 230vw, 130vw"
          className="object-cover object-[70%_center] sm:object-[72%_center]"
        />
      </div>

      {/* Text readability overlay, tablets and desktop */}
      <div className="absolute inset-0 hidden bg-gradient-to-r from-white/95 via-white/80 to-transparent sm:block lg:via-white/60" />

      {/* Soft lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(236,72,153,0.14),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(124,58,237,0.10),transparent_40%)]" />

      {/* Hero content */}
      <div className="container relative z-10 flex items-center pb-[calc(var(--art)-3.5rem)] pt-10 sm:min-h-[calc(100svh-4rem)] sm:py-16">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full sm:max-w-[30rem] lg:max-w-[36rem]"
        >
          <div className="mb-5 inline-flex max-w-full items-center gap-2 rounded-full border border-violet-200 bg-white/85 px-4 py-2 text-xs font-bold text-violet-900 shadow-sm backdrop-blur-md sm:text-sm">
            <Sparkles className="h-4 w-4 shrink-0 text-violet-600" />
            <span className="truncate">
              Cinematic animated surprise pages
            </span>
          </div>

          <h1 className="text-[clamp(2.25rem,9.5vw,3.25rem)] font-extrabold leading-[1.04] tracking-[-0.035em] sm:text-5xl lg:text-6xl xl:text-[4.5rem]">
            Turn your{" "}
            <span className="bg-gradient-to-r from-pink-500 via-fuchsia-500 to-violet-600 bg-clip-text text-transparent">
              love story
            </span>{" "}
            into an immersive digital memory.
          </h1>

          <p className="mt-5 max-w-xl text-base leading-7 text-slate-700 sm:text-lg sm:leading-8">
            Create a beautiful romantic page with your own photos,
            heartfelt text, soft motion, and one private link to share
            with someone special.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href={startCreatingHref} className="btn btn-lg btn-primary">
              Start creating
              <ArrowRight className="h-4 w-4" />
            </Link>

            <a href="#features" className="btn btn-lg btn-secondary bg-white/85 backdrop-blur-md">
              See features
            </a>
          </div>

          <ul className="mt-7 flex flex-wrap gap-2 text-sm font-medium text-slate-700 sm:mt-9">
            {highlights.map((highlight) => (
              <li
                key={highlight}
                className="rounded-full border border-white/80 bg-white/80 px-3.5 py-1.5 shadow-sm backdrop-blur-md"
              >
                {highlight}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
