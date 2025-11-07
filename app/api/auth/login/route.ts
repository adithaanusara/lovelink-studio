import { emailSchema } from "@/lib/validation";
import { readJson, invalidJsonResponse } from "@/lib/api";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";

const schema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(1024)
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
    const password = parsed.data.password;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { error: "Account not found. Please sign up first." },
        { status: 404 }
      );
    }

    const matches = await verifyPassword(password, user.passwordHash);
    if (!matches) {
      return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user: { name: user.name, email: user.email }
    });
  } catch (error) {
    const invalidJson = invalidJsonResponse(error);
    if (invalidJson) return invalidJson;
    console.error("LOGIN_ERROR", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
