"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { Heart, Lock, Mail, Sparkles } from "lucide-react";
import { resetPassword } from "@/lib/auth-client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = (searchParams.get("email") || "").trim().toLowerCase();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!email || !token) {
      router.replace("/login");
    }
  }, [email, token, router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    const result = await resetPassword(email, token, password);

    if (!result.success) {
      setError(result.message);
      setSubmitting(false);
      return;
    }

    setMessage(result.message || "Password updated successfully.");
    router.push(`/login?reset=success&email=${encodeURIComponent(email)}`);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-sky-100 px-4 py-10 text-slate-900">
      <div className="pointer-events-none absolute -left-16 top-16 h-72 w-72 rounded-full bg-sky-300/30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-pink-200/40 blur-3xl" />

      <div className="relative mx-auto w-full max-w-[1120px]">
        <div className="mb-6 flex items-center justify-between rounded-3xl border border-sky-400/80 bg-sky-100/90 px-5 py-4 backdrop-blur-xl">
          <Link href="/" className="inline-flex items-center gap-3 text-slate-800">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-violet-600 text-white">
              <Heart className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">LoveLink Studio</p>
              <p className="text-xs text-slate-600">Create a new password</p>
            </div>
          </Link>

          <Link
            href="/login"
            className="rounded-full border border-violet-300/70 bg-violet-100/80 px-4 py-2 text-sm font-semibold text-violet-700 transition hover:bg-violet-200/80"
          >
            Back to login
          </Link>
        </div>

        <section className="grid items-stretch gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] border border-sky-400/80 bg-sky-100/90 p-7 backdrop-blur-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200/80 bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.26em] text-sky-700">
              <Sparkles className="h-3.5 w-3.5" />
              Reset password
            </div>

            <h1 className="mt-5 text-4xl font-black leading-tight md:text-5xl">
              Set your new
              <span className="bg-gradient-to-r from-pink-500 via-fuchsia-500 to-violet-600 bg-clip-text text-transparent">
                password
              </span>
            </h1>

            <p className="mt-4 max-w-xl text-base leading-7 text-slate-700 md:text-lg">
              Enter a new password below. After saving, you will return to the login page.
            </p>

            <div className="mt-8 rounded-2xl border border-sky-300/80 bg-sky-100/80 px-4 py-3 text-sm text-slate-700">
              Resetting account for <span className="font-semibold">{email || "your email"}</span>
            </div>
          </div>

          <div className="rounded-[2rem] border border-sky-400/80 bg-sky-100/95 p-7 shadow-[0_20px_70px_rgba(59,130,246,0.2)]">
            <h2 className="text-2xl font-bold">Create new password</h2>
            <p className="mt-2 text-sm text-slate-600">Use a strong password you can remember.</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid gap-2">
                <span className="text-sm font-medium text-slate-700">Email</span>
                <div className="flex items-center gap-2 rounded-2xl border border-sky-400/70 bg-sky-100/95 px-3">
                  <Mail className="h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    readOnly
                    className="w-full bg-transparent py-3 text-slate-800 outline-none"
                  />
                </div>
              </div>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700">New password</span>
                <div className="flex items-center gap-2 rounded-2xl border border-sky-400/70 bg-sky-100/95 px-3">
                  <Lock className="h-4 w-4 text-slate-500" />
                  <input
                    type="password"
                    placeholder="New password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full bg-transparent py-3 text-slate-800 outline-none"
                  />
                </div>
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700">Confirm password</span>
                <div className="flex items-center gap-2 rounded-2xl border border-sky-400/70 bg-sky-100/95 px-3">
                  <Lock className="h-4 w-4 text-slate-500" />
                  <input
                    type="password"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="w-full bg-transparent py-3 text-slate-800 outline-none"
                  />
                </div>
              </label>

              {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}
              {message ? <p className="text-sm font-medium text-emerald-700">{message}</p> : null}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full bg-gradient-to-r from-pink-500 via-fuchsia-500 to-violet-600 px-5 py-3 font-semibold text-white transition hover:scale-[1.01]"
              >
                {submitting ? "Saving..." : "Save new password"}
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}