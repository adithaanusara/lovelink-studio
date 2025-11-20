import { emailSchema } from "@/lib/validation";
import { readJson, invalidJsonResponse } from "@/lib/api";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashOtpCode } from "@/lib/otp";

export const runtime = "nodejs";

const schema = z.object({
  email: emailSchema,
  otp: z.string().regex(/^\d{6}$/)
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

    // Important:
    // මෙතන consumedAt update කරන්න එපා.
    // Password reset route එකේදී තමයි OTP එක consume කරන්නේ.
    return NextResponse.json({
      success: true,
      message: "OTP verified successfully."
    });
  } catch (error) {
    const invalidJson = invalidJsonResponse(error);
    if (invalidJson) return invalidJson;
    console.error("VERIFY_OTP_ERROR", error);

    return NextResponse.json(
      { error: "OTP verification failed" },
      { status: 500 }
    );
  }
}