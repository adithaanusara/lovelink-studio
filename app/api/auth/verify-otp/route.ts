import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashOtpCode } from "@/lib/otp";

const schema = z.object({
  email: z.string().email(),
  otp: z.string().regex(/^\d{6}$/)
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
    const otp = parsed.data.otp.trim();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }

    const record = await prisma.passwordResetOtp.findFirst({
      where: {
        userId: user.id,
        consumedAt: null,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: "desc" }
    });

    if (!record) {
      return NextResponse.json(
        { error: "OTP expired or invalid. Please request a new code." },
        { status: 400 }
      );
    }

    if (record.attempts >= 5) {
      await prisma.passwordResetOtp.update({
        where: { id: record.id },
        data: { consumedAt: new Date() }
      });

      return NextResponse.json(
        { error: "Too many attempts. Request a new OTP." },
        { status: 429 }
      );
    }

    const matches = record.codeHash === hashOtpCode(otp);
    if (!matches) {
      await prisma.passwordResetOtp.update({
        where: { id: record.id },
        data: { attempts: { increment: 1 } }
      });

      return NextResponse.json({ error: "Invalid OTP code." }, { status: 401 });
    }

    await prisma.passwordResetOtp.update({
      where: { id: record.id },
      data: { consumedAt: new Date() }
    });

    return NextResponse.json({
      success: true,
      user: { name: user.name, email: user.email }
    });
  } catch (error) {
    console.error("VERIFY_OTP_ERROR", error);
    return NextResponse.json({ error: "OTP verification failed" }, { status: 500 });
  }
}
