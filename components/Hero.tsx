"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, HeartHandshake, ImageIcon, Link2 } from "lucide-react";

const steps = [
  {
    title: "Upload memories",
    description: "Add cover photo, gallery images, names, and your custom message.",
    icon: ImageIcon
  },
  {
    title: "Style the page",
    description: "Pick a beautiful theme, animation mood, and personalize the event date.",
    icon: HeartHandshake
  },
  {
    title: "Share one link",
    description: "Copy the generated URL and send it to your special person instantly.",
    icon: Link2
  }
];

export function Hero() {
  return (
    <section className="container grid gap-10 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300"
        >
          <span className="h-2 w-2 rounded-full bg-pink-400" />
          Perfect for birthdays, anniversaries, and Valentine surprises
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="space-y-5"
        >
          <h1 className="max-w-3xl text-5xl font-black leading-tight tracking-tight md:text-6xl">
            Turn your <span className="gradient-text">love story</span> into a stunning animated page.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-300">
            Build a beautiful personalized surprise with photos, heartfelt text, gentle motion, and a shareable URL.
            No coding needed for the user experience — just love, memories, and design.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.2 }}
          className="flex flex-wrap items-center gap-4"
        >
          <Link
            href="/create"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-violet-600 px-6 py-3.5 text-sm font-semibold text-white shadow-glow transition hover:translate-y-[-1px]"
          >
            Create your page
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="#features"
            className="rounded-full border border-white/10 px-6 py-3.5 text-sm font-semibold text-slate-200 transition hover:bg-white/5"
          >
            See features
          </a>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.15 }}
        className="glass relative overflow-hidden rounded-[2rem] p-6 shadow-glow"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-transparent to-violet-500/10" />
        <div className="relative grid gap-4">
          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
            <div className="mb-5 flex items-center justify-between text-sm text-slate-300">
              <span>Live surprise preview</span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs">Animated</span>
            </div>
            <div className="rounded-[1.5rem] bg-gradient-to-br from-pink-500/25 via-slate-900 to-violet-500/20 p-5">
              <div className="overflow-hidden rounded-[1.5rem] border border-white/10">
                <img
                  src="https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1200&q=80"
                  alt="Couple surprise"
                  className="h-64 w-full object-cover"
                />
              </div>
              <div className="mt-4 space-y-3">
                <p className="text-sm uppercase tracking-[0.3em] text-pink-200">For My Favorite Person</p>
                <h2 className="text-3xl font-bold">Happy Birthday, Nethmi ✨</h2>
                <p className="text-sm leading-7 text-slate-200">
                  Every photo with you feels like a memory worth framing forever.
                </p>
              </div>
            </div>
          </div>

          <div id="features" className="grid gap-3 sm:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                    <Icon className="h-5 w-5 text-pink-200" />
                  </div>
                  <p className="mb-1 text-sm text-slate-400">0{index + 1}</p>
                  <h3 className="font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
