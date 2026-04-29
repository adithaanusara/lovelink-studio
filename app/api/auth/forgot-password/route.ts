import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateOtpCode, hashOtpCode } from "@/lib/otp";
import { sendResetOtpEmail } from "@/lib/mailer";

export const runtime = "nodejs";

const schema = z.object({
  email: z.string().email()
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid data" },
        { status: 400 }
      );
    }

    const email = parsed.data.email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({
        success: true,
        message: "If the account exists, an OTP has been sent to your email."
      });
    }

    await prisma.passwordResetOtp.updateMany({
      where: { userId: user.id, consumedAt: null },
      data: { consumedAt: new Date() }
    });

    const otp = generateOtpCode();
    const codeHash = hashOtpCode(otp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const record = await prisma.passwordResetOtp.create({
      data: {
        userId: user.id,
        codeHash,
        expiresAt
      }
    });

    const mailResult = await sendResetOtpEmail(email, otp);

    if (!mailResult.success) {
      await prisma.passwordResetOtp.delete({ where: { id: record.id } });

      if (process.env.NODE_ENV !== "production") {
        return NextResponse.json({
          success: true,
          message: "Email delivery is unavailable. Development OTP generated.",
          otp
        });
      }

      return NextResponse.json(
        { error: "Email service failed to send OTP." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "OTP sent to your email."
    });
  } catch (error) {
    console.error("FORGOT_PASSWORD_ERROR", error);
    return NextResponse.json(
      { error: "Failed to send OTP" },
      { status: 500 }
    );
  }
}
