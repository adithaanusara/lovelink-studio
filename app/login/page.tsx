"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { signIn } from "next-auth/react";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { safeNextPath } from "@/lib/navigation";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthTiltCard } from "@/components/AuthTiltCard";
import { GoogleIcon } from "@/components/GoogleIcon";
import { PasswordInput } from "@/components/PasswordInput";
import {
  getAccountEmail,
  loginAccount,
  requestForgotPasswordOtp,
  resetForgotPassword,
  verifyForgotPasswordOtp,
} from "@/lib/auth-client";

type ForgotStep = "email" | "otp" | "password";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState<ForgotStep>("email");

  const [otpEmail, setOtpEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpMessage, setOtpMessage] = useState("");
  const [devOtpPreview, setDevOtpPreview] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const nextPath = safeNextPath(searchParams.get("next"));

  useEffect(() => {
    let cancelled = false;
    void getAccountEmail().then((email) => {
      if (email && !cancelled) router.replace(nextPath);
    });
    return () => { cancelled = true; };
  }, [nextPath, router]);

  const resetForgotState = () => {
    setForgotStep("email");
    setOtpCode("");
    setNewPassword("");
    setConfirmPassword("");
    setOtpError("");
    setOtpMessage("");
    setDevOtpPreview("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    setError("");
    setSuccessMessage("");
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
    if (otpLoading) return;
    setOtpError("");
    setOtpMessage("");
    setDevOtpPreview("");
    setSuccessMessage("");
    setOtpLoading(true);

    const targetEmail = otpEmail || email;
    const result = await requestForgotPasswordOtp(targetEmail);

    if (!result.success) {
      setOtpError(result.message);
      setOtpLoading(false);
      return;
    }

    setOtpEmail(targetEmail.trim().toLowerCase());
    setForgotStep("otp");
    setOtpMessage(result.message);

    if (result.otp) {
      setDevOtpPreview(result.otp);
    }

    setOtpLoading(false);
  };

  const handleVerifyOtp = async () => {
    if (otpLoading) return;
    setOtpError("");
    setOtpMessage("");
    setSuccessMessage("");
    setOtpLoading(true);

    const result = await verifyForgotPasswordOtp(otpEmail || email, otpCode);

    if (!result.success) {
      setOtpError(result.message);
      setOtpLoading(false);
      return;
    }

    setForgotStep("password");
    setOtpMessage("OTP verified. Now create your new password.");
    setOtpLoading(false);
  };

  const handleResetPassword = async () => {
    if (otpLoading) return;
    setOtpError("");
    setOtpMessage("");
    setSuccessMessage("");
    setOtpLoading(true);

    const result = await resetForgotPassword(
      otpEmail || email,
      otpCode,
      newPassword,
      confirmPassword,
    );

    if (!result.success) {
      setOtpError(result.message);
      setOtpLoading(false);
      return;
    }

    setEmail((otpEmail || email).trim().toLowerCase());
    setPassword("");
    setShowForgotPassword(false);
    resetForgotState();
    setSuccessMessage(result.message);
    setOtpLoading(false);
  };

  const forgotSteps: ForgotStep[] = ["email", "otp", "password"];
  const forgotStepIndex = forgotSteps.indexOf(forgotStep);

  return (
    <AuthTiltCard
      mode="login"
      title={showForgotPassword ? "Reset Password" : "Welcome Back"}
      subtitle={
        showForgotPassword
          ? "We will email you a 6-digit OTP to confirm it is you"
          : "Enter your email and password to access your account"
      }
      imageTitle="EXPLORE. LOVE. CREATE."
      imageSubtitle="Continue building your romantic memory pages with cinematic animations."
    >
      {showForgotPassword ? (
        <div>
          <div className="mb-5 flex items-center justify-between gap-3">
            <p className="text-sm font-bold text-slate-900">
              Step {forgotStepIndex + 1} of 3
            </p>

            <div className="flex gap-1.5" aria-hidden="true">
              {forgotSteps.map((step, index) => (
                <span
                  key={step}
                  className={`h-1.5 w-8 rounded-full transition ${
                    index <= forgotStepIndex ? "bg-violet-600" : "bg-slate-200"
                  }`}
                />
              ))}
            </div>
          </div>

          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();

              if (forgotStep === "email") void handleRequestOtp();
              if (forgotStep === "otp") void handleVerifyOtp();
              if (forgotStep === "password") void handleResetPassword();
            }}
          >
            <label className="grid gap-2">
              <span className="field-label">Email</span>

              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                inputMode="email"
                value={otpEmail}
                disabled={forgotStep !== "email"}
                onChange={(event) => setOtpEmail(event.target.value)}
                placeholder="Enter your email"
                className="field"
              />
            </label>

            {forgotStep === "email" ? (
              <button
                type="submit"
                disabled={otpLoading}
                className="btn btn-dark w-full rounded-xl"
              >
                {otpLoading ? "Sending OTP..." : "Send OTP to email"}
              </button>
            ) : null}

            {forgotStep === "otp" ? (
              <>
                <label className="grid gap-2">
                  <span className="field-label">Enter OTP</span>

                  <input
                    type="text"
                    name="otp"
                    required
                    pattern="[0-9]{6}"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={otpCode}
                    onChange={(event) =>
                      setOtpCode(
                        event.target.value.replace(/\D/g, "").slice(0, 6),
                      )
                    }
                    placeholder="6-digit OTP"
                    className="field text-center text-lg font-bold tracking-[0.4em] placeholder:text-base placeholder:tracking-normal"
                  />
                </label>

                <button
                  type="submit"
                  disabled={otpLoading}
                  className="btn btn-dark w-full rounded-xl"
                >
                  {otpLoading ? "Verifying..." : "Verify OTP"}
                </button>

                <button
                  type="button"
                  disabled={otpLoading}
                  onClick={() => void handleRequestOtp()}
                  className="btn btn-secondary w-full rounded-xl"
                >
                  Resend OTP
                </button>
              </>
            ) : null}

            {forgotStep === "password" ? (
              <>
                <label className="grid gap-2">
                  <span className="field-label">Create New Password</span>

                  <PasswordInput
                    name="new-password"
                    required
                    minLength={6}
                    maxLength={1024}
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    placeholder="Create new password"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="field-label">Confirm Password</span>

                  <PasswordInput
                    name="confirm-password"
                    required
                    minLength={6}
                    maxLength={1024}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Confirm new password"
                  />
                </label>

                <button
                  type="submit"
                  disabled={otpLoading}
                  className="btn btn-dark w-full rounded-xl"
                >
                  {otpLoading ? "Updating password..." : "Update Password"}
                </button>
              </>
            ) : null}

            <div aria-live="polite" className="space-y-3">
              {otpMessage ? (
                <p className="notice notice-success">{otpMessage}</p>
              ) : null}

              {devOtpPreview ? (
                <p className="notice border border-violet-200 bg-violet-50 text-xs font-black tracking-[0.2em] text-violet-700">
                  DEV OTP: {devOtpPreview}
                </p>
              ) : null}

              {otpError ? (
                <p className="notice notice-error">{otpError}</p>
              ) : null}
            </div>
          </form>

          <button
            type="button"
            disabled={otpLoading}
            onClick={() => {
              setShowForgotPassword(false);
              resetForgotState();
            }}
            className="btn btn-ghost mt-4 w-full rounded-xl"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </button>
        </div>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="grid gap-2">
              <span className="field-label">Email</span>

              <input
                type="email"
                name="email"
                required
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
                required
                maxLength={1024}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>

            <div className="flex flex-wrap items-center justify-between gap-x-3 text-sm">
              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(true);
                  setOtpEmail(email);
                  resetForgotState();
                }}
                className="min-h-[44px] font-bold text-violet-700 transition hover:text-violet-900"
              >
                Forgot password?
              </button>
            </div>

            <div aria-live="polite" className="space-y-3">
              {successMessage ? (
                <p className="notice notice-success">{successMessage}</p>
              ) : null}

              {error ? <p className="notice notice-error">{error}</p> : null}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-dark w-full rounded-xl"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
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
              void signIn("google", { callbackUrl: nextPath });
            }}
            className="btn btn-secondary w-full rounded-xl"
          >
            <GoogleIcon />
            Sign in with Google
          </button>

          <p className="mt-6 text-center text-sm font-medium text-slate-500">
            Don&apos;t have an account?{" "}
            <Link
              href={`/signup?next=${encodeURIComponent(nextPath)}`}
              className="-my-3 inline-block py-3 font-black text-slate-950 transition hover:text-violet-700"
            >
              Sign up
            </Link>
          </p>
        </>
      )}
    </AuthTiltCard>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center px-4 text-slate-900">
          <div className="surface px-8 py-6 text-center">
            <p className="text-sm font-bold">Loading login page...</p>
          </div>
        </main>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
