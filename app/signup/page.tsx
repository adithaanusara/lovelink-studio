"use client";

import Link from "next/link";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { AuthTiltCard } from "@/components/AuthTiltCard";
import { GoogleIcon } from "@/components/GoogleIcon";
import { PasswordInput } from "@/components/PasswordInput";
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
          <span className="field-label">Your name</span>
          <input
            type="text"
            name="name"
            autoComplete="name"
            placeholder="Enter your name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="field"
          />
        </label>

        <label className="grid gap-2">
          <span className="field-label">Email</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            inputMode="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="field"
          />
        </label>

        <label className="grid gap-2">
          <span className="field-label">Password</span>
          <PasswordInput
            name="password"
            autoComplete="new-password"
            placeholder="Create a strong password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        <div aria-live="polite">
          {error ? <p className="notice notice-error">{error}</p> : null}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-dark w-full rounded-xl"
        >
          {isSubmitting ? "Creating account..." : "Sign up"}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        or
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <button
        type="button"
        onClick={() => {
          void signIn("google", { callbackUrl: "/create" });
        }}
        className="btn btn-secondary w-full rounded-xl"
      >
        <GoogleIcon />
        Sign up with Google
      </button>

      <p className="mt-6 text-center text-sm font-medium text-slate-500">
        Already have an account?{" "}
        <Link
          href="/login"
          className="-my-3 inline-block py-3 font-black text-slate-950 transition hover:text-violet-700"
        >
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
        <main className="flex min-h-screen items-center justify-center px-4 text-slate-900">
          <div className="surface px-8 py-6 text-center">
            <p className="text-sm font-bold">Loading signup page...</p>
          </div>
        </main>
      }
    >
      <SignupContent />
    </Suspense>
  );
}