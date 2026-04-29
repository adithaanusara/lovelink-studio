"use client";

import Link from "next/link";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthTiltCard } from "@/components/AuthTiltCard";
import { isLoggedIn, signupAccount } from "@/lib/auth-client";

function SignupContent() {
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
    <AuthTiltCard
  mode="signup"
  title="Create Account"
  subtitle="Start building your first romantic memory page"
  imageTitle="DREAM. LOVE. SHARE."
  imageSubtitle="Design a private surprise page with photos, videos, memories, and animations."
>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="grid gap-2">
          <span className="text-sm font-bold text-slate-800">Your name</span>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-950 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-bold text-slate-800">Email</span>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-950 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-bold text-slate-800">Password</span>
          <input
            type="password"
            placeholder="Create a strong password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-950 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
          />
        </label>

        {error ? (
          <p className="text-sm font-semibold text-rose-600">{error}</p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-lg transition hover:scale-[1.01] hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Creating account..." : "Sign up"}
        </button>
      </form>

      <button
        type="button"
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
      >
        <span className="text-lg">G</span>
        Sign up with Google
      </button>

      <p className="mt-6 text-center text-sm font-medium text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="font-black text-slate-950 hover:text-violet-700">
          Login
        </Link>
      </p>
    </AuthTiltCard>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-sky-100 text-slate-900">
          <div className="rounded-3xl border border-sky-200 bg-white px-8 py-6 text-center shadow-sm">
            <p className="text-sm font-bold">Loading signup page...</p>
          </div>
        </main>
      }
    >
      <SignupContent />
    </Suspense>
  );
}