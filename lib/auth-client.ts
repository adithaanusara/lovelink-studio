import { getSession, signOut } from "next-auth/react";

const SESSION_KEY = "lovelink_session";

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function getSessionEmail() {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

export function isLoggedIn() {
  return Boolean(getSessionEmail());
}

export async function getAccountEmail() {
  const email = getSessionEmail();
  if (email) return email;
  try {
    const session = await getSession();
    return session?.user?.email || null;
  } catch {
    return null;
  }
}

export async function logout() {
  if (typeof window === "undefined") return;
  try {
    // End the OAuth session before reporting a successful logout.
    const session = await getSession();
    if (session) await signOut({ redirect: false });
  } catch {
    throw new Error("Could not log out. Please try again.");
  }
  try { window.localStorage.removeItem(SESSION_KEY); } catch { /* Storage may be disabled. */ }
  window.dispatchEvent(new Event("lovelink-session-change"));
}

type AuthSuccess = { success: true };
type AuthFailure = { success: false; message: string };

function setSession(email: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SESSION_KEY, normalizeEmail(email));
  } catch {
    throw new Error("Please allow browser storage to sign in.");
  }
  window.dispatchEvent(new Event("lovelink-session-change"));
}

async function requestJson<T>(url: string, payload: Record<string, unknown>) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        ok: false as const,
        message: data?.error || "Request failed"
      };
    }

    if (!data || data.success !== true) {
      return { ok: false as const, message: "Unexpected server response. Please try again." };
    }
    return { ok: true as const, data: data as T };
  } catch {
    return { ok: false as const, message: "Could not connect. Please check your connection and try again." };
  }
}

export async function signupAccount(
  name: string,
  email: string,
  password: string
): Promise<AuthSuccess | AuthFailure> {
  const cleanName = name.trim();
  const cleanEmail = normalizeEmail(email);
  const cleanPassword = password;

  if (!cleanName || !cleanEmail || !cleanPassword) {
    return { success: false, message: "Please fill all fields." };
  }

  const response = await requestJson<{ success: true }>("/api/auth/signup", {
    name: cleanName,
    email: cleanEmail,
    password: cleanPassword
  });

  if (!response.ok) {
    return { success: false, message: response.message };
  }

  try {
    setSession(cleanEmail);
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "Could not save session." };
  }

  return { success: true as const };
}

export async function loginAccount(
  email: string,
  password: string
): Promise<AuthSuccess | AuthFailure> {
  const cleanEmail = normalizeEmail(email);
  const cleanPassword = password;

  if (!cleanEmail || !cleanPassword) {
    return { success: false, message: "Please enter email and password." };
  }

  const response = await requestJson<{ success: true }>("/api/auth/login", {
    email: cleanEmail,
    password: cleanPassword
  });

  if (!response.ok) {
    return { success: false, message: response.message };
  }

  try {
    setSession(cleanEmail);
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "Could not save session." };
  }
  return { success: true as const };
}

export async function requestForgotPasswordOtp(email: string) {
  const cleanEmail = normalizeEmail(email);

  if (!cleanEmail) {
    return { success: false as const, message: "Please enter your email." };
  }

  const response = await requestJson<{ message?: string; otp?: string }>(
    "/api/auth/forgot-password",
    { email: cleanEmail }
  );

  if (!response.ok) {
    return { success: false as const, message: response.message };
  }

  return {
    success: true as const,
    message: response.data.message || "OTP sent.",
    otp: response.data.otp
  };
}

export async function verifyForgotPasswordOtp(email: string, otp: string) {
  const cleanEmail = normalizeEmail(email);
  const cleanOtp = otp.trim();

  if (!cleanEmail || !cleanOtp) {
    return {
      success: false as const,
      message: "Please enter email and OTP."
    };
  }

  const response = await requestJson<{ success: true }>("/api/auth/verify-otp", {
    email: cleanEmail,
    otp: cleanOtp
  });

  if (!response.ok) {
    return { success: false as const, message: response.message };
  }

  // Important:
  // Forgot password OTP verify වෙද්දි login session set කරන්න එපා.
  // Password reset කළාට පස්සේ user manually login වෙන්න ඕන.
  return { success: true as const };
}

export async function resetForgotPassword(
  email: string,
  otp: string,
  newPassword: string,
  confirmPassword: string
) {
  const cleanEmail = normalizeEmail(email);
  const cleanOtp = otp.trim();
  const cleanPassword = newPassword;
  const cleanConfirmPassword = confirmPassword;

  if (!cleanEmail || !cleanOtp || !cleanPassword || !cleanConfirmPassword) {
    return {
      success: false as const,
      message: "Please fill all fields."
    };
  }

  if (cleanPassword.length < 6) {
    return {
      success: false as const,
      message: "Password must be at least 6 characters."
    };
  }

  if (cleanPassword !== cleanConfirmPassword) {
    return {
      success: false as const,
      message: "Passwords do not match."
    };
  }

  const response = await requestJson<{ success: true; message?: string }>(
    "/api/auth/reset-password",
    {
      email: cleanEmail,
      otp: cleanOtp,
      newPassword: cleanPassword,
      confirmPassword: cleanConfirmPassword
    }
  );

  if (!response.ok) {
    return { success: false as const, message: response.message };
  }

  return {
    success: true as const,
    message: response.data.message || "Password reset successfully."
  };
}