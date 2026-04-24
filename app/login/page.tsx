"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Heart, Lock, Mail, Sparkles } from "lucide-react";
import {
  isLoggedIn,
  loginAccount,
  requestForgotPasswordOtp,
  verifyForgotPasswordOtp
} from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpMessage, setOtpMessage] = useState("");
  const [devOtpPreview, setDevOtpPreview] = useState("");

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

    const result = await loginAccount(email, password);
    if (!result.success) {
      setError(result.message);
      setIsSubmitting(false);
      return;
    }

    router.push(nextPath);
  };

  const handleRequestOtp = async () => {
    setOtpError("");
    setOtpMessage("");
    setDevOtpPreview("");
    setOtpLoading(true);

    const result = await requestForgotPasswordOtp(otpEmail || email);

    if (!result.success) {
      setOtpError(result.message);
      setOtpLoading(false);
      return;
    }

    setOtpSent(true);
    setOtpMessage(result.message);
    if (result.otp) {
      setDevOtpPreview(result.otp);
    }
    setOtpLoading(false);
  };

  const handleVerifyOtp = async () => {
    setOtpError("");
    setOtpMessage("");
    setOtpLoading(true);

    const result = await verifyForgotPasswordOtp(otpEmail || email, otpCode);

    if (!result.success) {
      setOtpError(result.message);
      setOtpLoading(false);
      return;
    }

    router.push(nextPath);
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
              <p className="text-xs text-slate-600">Welcome back to your love stories</p>
            </div>
          </Link>

          <Link
            href="/signup"
            className="rounded-full border border-violet-300/70 bg-violet-100/80 px-4 py-2 text-sm font-semibold text-violet-700 transition hover:bg-violet-200/80"
          >
            Create account
          </Link>
        </div>

        <section className="grid items-stretch gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] border border-sky-400/80 bg-sky-100/90 p-7 backdrop-blur-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200/80 bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.26em] text-sky-700">
              <Sparkles className="h-3.5 w-3.5" />
              For Couples
            </div>

            <h1 className="mt-5 text-4xl font-black leading-tight md:text-5xl">
              Continue where your
              <span className="bg-gradient-to-r from-pink-500 via-fuchsia-500 to-violet-600 bg-clip-text text-transparent">
                {" "}
                memories paused
              </span>
            </h1>

            <p className="mt-4 max-w-xl text-base leading-7 text-slate-700 md:text-lg">
              Sign in to edit your surprise pages, update photos, and keep every
              special moment ready to share.
            </p>

            <div className="mt-8 grid gap-3 text-sm text-slate-700 md:grid-cols-3">
              <div className="rounded-2xl border border-sky-300/80 bg-sky-100/80 px-4 py-3">Private links</div>
              <div className="rounded-2xl border border-sky-300/80 bg-sky-100/80 px-4 py-3">Animated pages</div>
              <div className="rounded-2xl border border-sky-300/80 bg-sky-100/80 px-4 py-3">Albums + games</div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-sky-400/80 bg-sky-100/95 p-7 shadow-[0_20px_70px_rgba(59,130,246,0.2)]">
            <h2 className="text-2xl font-bold">Login</h2>
            <p className="mt-2 text-sm text-slate-600">Use your email and password to access your dashboard.</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
                    placeholder="••••••••"
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
                {isSubmitting ? "Logging in..." : "Login to LoveLink"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword((prev) => !prev);
                  setOtpEmail(email);
                  setOtpError("");
                  setOtpMessage("");
                }}
                className="w-full text-sm font-semibold text-sky-700 hover:text-sky-900"
              >
                Forgot password?
              </button>
            </form>

            {showForgotPassword ? (
              <div className="mt-5 space-y-3 rounded-2xl border border-sky-400/70 bg-sky-100/95 p-4">
                <p className="text-sm font-semibold text-slate-800">
                  Reset with OTP
                </p>

                <div className="grid gap-2">
                  <span className="text-sm text-slate-700">Email</span>
                  <input
                    type="email"
                    value={otpEmail}
                    onChange={(event) => setOtpEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-sky-400/70 bg-sky-100 px-3 py-3 text-sm text-slate-800 outline-none"
                  />
                </div>

                <button
                  type="button"
                  disabled={otpLoading}
                  onClick={() => void handleRequestOtp()}
                  className="w-full rounded-xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-600"
                >
                  {otpLoading ? "Sending OTP..." : "Send OTP to email"}
                </button>

                {otpSent ? (
                  <>
                    <div className="grid gap-2">
                      <span className="text-sm text-slate-700">Enter OTP</span>
                      <input
                        type="text"
                        maxLength={6}
                        value={otpCode}
                        onChange={(event) =>
                          setOtpCode(event.target.value.replace(/\D/g, "").slice(0, 6))
                        }
                        placeholder="6-digit OTP"
                        className="w-full rounded-xl border border-sky-400/70 bg-sky-100 px-3 py-3 text-sm text-slate-800 outline-none"
                      />
                    </div>

                    <button
                      type="button"
                      disabled={otpLoading}
                      onClick={() => void handleVerifyOtp()}
                      className="w-full rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-700"
                    >
                      {otpLoading ? "Verifying..." : "Verify OTP and Login"}
                    </button>
                  </>
                ) : null}

                {otpMessage ? <p className="text-sm text-emerald-700">{otpMessage}</p> : null}
                {devOtpPreview ? (
                  <p className="text-xs font-semibold tracking-[0.14em] text-violet-700">
                    DEV OTP: {devOtpPreview}
                  </p>
                ) : null}
                {otpError ? <p className="text-sm font-medium text-rose-600">{otpError}</p> : null}
              </div>
            ) : null}

            <p className="mt-4 text-center text-sm text-slate-700">
              New here?{" "}
              <Link href="/signup" className="font-semibold text-violet-700 hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
