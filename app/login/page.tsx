"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthTiltCard } from "@/components/AuthTiltCard";
import {
  isLoggedIn,
  loginAccount,
  requestForgotPasswordOtp,
  resetForgotPassword,
  verifyForgotPasswordOtp,
} from "@/lib/auth-client";

type ForgotStep = "email" | "otp" | "password";

export default function LoginPage() {
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

  const nextPath = searchParams.get("next") || "/create";

  useEffect(() => {
    if (isLoggedIn()) {
      router.replace(nextPath);
    }
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

  return (
    <AuthTiltCard
      mode="login"
      title="Welcome Back"
      subtitle="Enter your email and password to access your account"
      imageTitle="EXPLORE. LOVE. CREATE."
      imageSubtitle="Continue building your romantic memory pages with cinematic animations."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="grid gap-2">
          <span className="text-sm font-bold text-slate-800">Email</span>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-bold text-slate-800">Password</span>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
          />
        </label>

        <div className="flex items-center justify-between gap-3 text-sm">
          <label className="flex items-center gap-2 font-medium text-slate-600">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 accent-slate-950"
            />
            Remember me
          </label>

          <button
            type="button"
            onClick={() => {
              setShowForgotPassword(true);
              setOtpEmail(email);
              resetForgotState();
            }}
            className="font-bold text-slate-900 transition hover:text-violet-700"
          >
            Forgot Password
          </button>
        </div>

        {successMessage ? (
          <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            {successMessage}
          </p>
        ) : null}

        {error ? (
          <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-lg transition hover:scale-[1.01] hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => {
          window.location.href = "/api/auth/signin/google?callbackUrl=/create";
        }}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
      >
        <span className="text-lg font-black">G</span>
        Sign in with Google
      </button>

      <p className="mt-6 text-center text-sm font-medium text-slate-500">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-black text-slate-950 transition hover:text-violet-700"
        >
          Sign up
        </Link>
      </p>

      {showForgotPassword ? (
        <div className="mt-6 rounded-2xl border border-sky-200 bg-sky-50 p-4 shadow-sm">
          <div className="mb-4">
            <p className="text-sm font-black text-slate-900">
              Reset password with OTP
            </p>

            <p className="mt-1 text-xs font-semibold text-slate-500">
              Step{" "}
              {forgotStep === "email"
                ? "1 of 3"
                : forgotStep === "otp"
                  ? "2 of 3"
                  : "3 of 3"}
            </p>
          </div>

          <div className="space-y-3">
            <label className="grid gap-2">
              <span className="text-sm font-bold text-slate-800">Email</span>

              <input
                type="email"
                value={otpEmail}
                disabled={forgotStep !== "email"}
                onChange={(event) => setOtpEmail(event.target.value)}
                placeholder="Enter your email"
                className="w-full rounded-xl border border-sky-200 bg-white px-4 py-3 text-sm font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
              />
            </label>

            {forgotStep === "email" ? (
              <button
                type="button"
                disabled={otpLoading}
                onClick={() => void handleRequestOtp()}
                className="w-full rounded-xl bg-sky-500 px-4 py-3 text-sm font-black text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {otpLoading ? "Sending OTP..." : "Send OTP to email"}
              </button>
            ) : null}

            {forgotStep === "otp" ? (
              <>
                <label className="grid gap-2">
                  <span className="text-sm font-bold text-slate-800">
                    Enter OTP
                  </span>

                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(event) =>
                      setOtpCode(
                        event.target.value.replace(/\D/g, "").slice(0, 6),
                      )
                    }
                    placeholder="6-digit OTP"
                    className="w-full rounded-xl border border-sky-200 bg-white px-4 py-3 text-sm font-semibold tracking-[0.25em] text-slate-950 outline-none transition placeholder:tracking-normal placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                  />
                </label>

                <button
                  type="button"
                  disabled={otpLoading}
                  onClick={() => void handleVerifyOtp()}
                  className="w-full rounded-xl bg-violet-600 px-4 py-3 text-sm font-black text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {otpLoading ? "Verifying..." : "Verify OTP"}
                </button>

                <button
                  type="button"
                  disabled={otpLoading}
                  onClick={() => void handleRequestOtp()}
                  className="w-full rounded-xl border border-sky-300 bg-white px-4 py-3 text-sm font-black text-sky-700 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Resend OTP
                </button>
              </>
            ) : null}

            {forgotStep === "password" ? (
              <>
                <label className="grid gap-2">
                  <span className="text-sm font-bold text-slate-800">
                    Create New Password
                  </span>

                  <input
                    type="password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    placeholder="Create new password"
                    className="w-full rounded-xl border border-sky-200 bg-white px-4 py-3 text-sm font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-bold text-slate-800">
                    Confirm Password
                  </span>

                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Confirm new password"
                    className="w-full rounded-xl border border-sky-200 bg-white px-4 py-3 text-sm font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                  />
                </label>

                <button
                  type="button"
                  disabled={otpLoading}
                  onClick={() => void handleResetPassword()}
                  className="w-full rounded-xl bg-violet-600 px-4 py-3 text-sm font-black text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {otpLoading ? "Updating password..." : "Update Password"}
                </button>
              </>
            ) : null}

            {otpMessage ? (
              <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                {otpMessage}
              </p>
            ) : null}

            {devOtpPreview ? (
              <p className="rounded-xl bg-violet-50 px-4 py-3 text-xs font-black tracking-[0.2em] text-violet-700">
                DEV OTP: {devOtpPreview}
              </p>
            ) : null}

            {otpError ? (
              <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">
                {otpError}
              </p>
            ) : null}

            <button
              type="button"
              onClick={() => {
                setShowForgotPassword(false);
                resetForgotState();
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50"
            >
              Back to login
            </button>
          </div>
        </div>
      ) : null}
    </AuthTiltCard>
  );
}
