"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Heart, Lock, Mail, Sparkles, User } from "lucide-react";
import { isLoggedIn, signupAccount } from "@/lib/auth-client";

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nextPath = searchParams.get("next") || "/create";

  useEffect(() => {
    if (isLoggedIn()) {
      router.replace(nextPath);
    }
  }, [nextPath, router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const result = await signupAccount(name, email, password);
    if (!result.success) {
      setError(result.message);
      setIsSubmitting(false);
      return;
    }

    router.push(nextPath);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-sky-100 px-4 py-10 text-slate-900">
      <div className="pointer-events-none absolute -left-20 top-24 h-72 w-72 rounded-full bg-violet-200/40 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-sky-300/30 blur-3xl" />

      <div className="relative mx-auto w-full max-w-[1120px]">
        <div className="mb-6 flex items-center justify-between rounded-3xl border border-sky-400/80 bg-sky-100/90 px-5 py-4 backdrop-blur-xl">
          <Link href="/" className="inline-flex items-center gap-3 text-slate-800">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-violet-600 text-white">
              <Heart className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">LoveLink Studio</p>
              <p className="text-xs text-slate-600">Start your first romantic experience</p>
            </div>
          </Link>

          <Link
            href="/login"
            className="rounded-full border border-sky-400/70 bg-sky-100/95 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-sky-200"
          >
            Login
          </Link>
        </div>

        <section className="grid items-stretch gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2rem] border border-sky-400/80 bg-sky-100/95 p-7 shadow-[0_20px_70px_rgba(59,130,246,0.2)]">
            <h2 className="text-2xl font-bold">Create your account</h2>
            <p className="mt-2 text-sm text-slate-600">Join and start building unforgettable pages for your special person.</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700">Your name</span>
                <div className="flex items-center gap-2 rounded-2xl border border-sky-400/70 bg-sky-100/95 px-3">
                  <User className="h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="w-full bg-transparent py-3 text-slate-800 outline-none"
                  />
                </div>
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700">Email</span>
                <div className="flex items-center gap-2 rounded-2xl border border-sky-400/70 bg-sky-100/95 px-3">
                  <Mail className="h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full bg-transparent py-3 text-slate-800 outline-none"
                  />
                </div>
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700">Password</span>
                <div className="flex items-center gap-2 rounded-2xl border border-sky-400/70 bg-sky-100/95 px-3">
                  <Lock className="h-4 w-4 text-slate-500" />
                  <input
                    type="password"
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full bg-transparent py-3 text-slate-800 outline-none"
                  />
                </div>
              </label>

              {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-full bg-gradient-to-r from-pink-500 via-fuchsia-500 to-violet-600 px-5 py-3 font-semibold text-white transition hover:scale-[1.01]"
              >
                {isSubmitting ? "Creating account..." : "Create account"}
              </button>
            </form>

            <p className="mt-4 text-center text-sm text-slate-700">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-violet-700 hover:underline">
                Login now
              </Link>
            </p>
          </div>

          <div className="rounded-[2rem] border border-sky-400/80 bg-sky-100/90 p-7 backdrop-blur-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200/80 bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.26em] text-sky-700">
              <Sparkles className="h-3.5 w-3.5" />
              Couple-first vibe
            </div>

            <h1 className="mt-5 text-4xl font-black leading-tight md:text-5xl">
              Build a page that
              <span className="bg-gradient-to-r from-pink-500 via-fuchsia-500 to-violet-600 bg-clip-text text-transparent">
                {" "}
                touches hearts
              </span>
            </h1>

            <p className="mt-4 max-w-xl text-base leading-7 text-slate-700 md:text-lg">
              Add your story, photos, videos, and surprise interactions to create
              a dreamy page that your partner will never forget.
            </p>

            <div className="mt-8 grid gap-3 text-sm text-slate-700 md:grid-cols-3">
              <div className="rounded-2xl border border-sky-300/80 bg-sky-100/80 px-4 py-3">Romantic templates</div>
              <div className="rounded-2xl border border-sky-300/80 bg-sky-100/80 px-4 py-3">Memory albums</div>
              <div className="rounded-2xl border border-sky-300/80 bg-sky-100/80 px-4 py-3">Shareable private links</div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
