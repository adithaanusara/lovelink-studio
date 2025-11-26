import { emailSchema, passwordSchema } from "@/lib/validation";
import { readJson, invalidJsonResponse } from "@/lib/api";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashOtpCode } from "@/lib/otp";
import { hashPassword } from "@/lib/password";

export const runtime = "nodejs";

const schema = z.object({
  email: emailSchema,
  otp: z.string().regex(/^\d{6}$/),
  newPassword: passwordSchema,
  confirmPassword: passwordSchema
});

export async function POST(request: Request) {
  try {
    const body = await readJson(request);
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid data" },
        { status: 400 }
      );
    }

    const email = parsed.data.email.trim().toLowerCase();
    const otp = parsed.data.otp.trim();
    const newPassword = parsed.data.newPassword;
    const confirmPassword = parsed.data.confirmPassword;

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json(
        { error: "Account not found." },
        { status: 404 }
      );
    }

    const record = await prisma.passwordResetOtp.findFirst({
      where: {
        userId: user.id,
        consumedAt: null
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    if (!record) {
      return NextResponse.json(
        { error: "OTP expired or invalid. Please request a new code." },
        { status: 400 }
      );
    }

    if (record.expiresAt <= new Date()) {
      await prisma.passwordResetOtp.update({
        where: { id: record.id },
        data: { consumedAt: new Date() }
      });

      return NextResponse.json(
        { error: "OTP expired. Please request a new code." },
        { status: 400 }
      );
    }

    if (record.attempts >= 5) {
      await prisma.passwordResetOtp.update({
        where: { id: record.id },
        data: { consumedAt: new Date() }
      });

      return NextResponse.json(
        { error: "Too many attempts. Please request a new OTP." },
        { status: 429 }
      );
    }

    const matches = record.codeHash === hashOtpCode(otp);

    if (!matches) {
      await prisma.passwordResetOtp.updateMany({
        where: { id: record.id, consumedAt: null, expiresAt: { gt: new Date() }, attempts: { lt: 5 } },
        data: { attempts: { increment: 1 } }
      });

      return NextResponse.json(
        { error: "Invalid OTP code." },
        { status: 401 }
      );
    }

    const passwordHash = await hashPassword(newPassword);

    const reset = await prisma.$transaction(async (tx) => {
      const now = new Date();
      const claimed = await tx.passwordResetOtp.updateMany({
        where: { id: record.id, consumedAt: null, expiresAt: { gt: now }, attempts: { lt: 5 } },
        data: { consumedAt: now }
      });
      if (claimed.count !== 1) return false;
      await tx.user.update({ where: { id: user.id }, data: { passwordHash } });
      await tx.passwordResetOtp.updateMany({
        where: { userId: user.id, consumedAt: null },
        data: { consumedAt: now }
      });
      await tx.passwordResetToken.updateMany({
        where: { userId: user.id, consumedAt: null },
        data: { consumedAt: now }
      });
      return true;
    });
    if (!reset) {
      return NextResponse.json({ error: "OTP expired or already used. Request a new code." }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Password reset successfully. Please login with your new password."
    });
  } catch (error) {
    const invalidJson = invalidJsonResponse(error);
    if (invalidJson) return invalidJson;
    console.error("RESET_PASSWORD_ERROR", error);

    return NextResponse.json(
      { error: "Password reset failed" },
      { status: 500 }
    );
  }
}