import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6)
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

    const name = parsed.data.name.trim();
    const email = parsed.data.email.trim().toLowerCase();
    const password = parsed.data.password;

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json(
        { error: "Account already exists. Please login." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: { name, email, passwordHash },
      select: { name: true, email: true }
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("SIGNUP_ERROR", error);
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}
