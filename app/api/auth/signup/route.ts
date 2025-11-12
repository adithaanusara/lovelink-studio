import { emailSchema, nameSchema, passwordSchema } from "@/lib/validation";
import { readJson, invalidJsonResponse } from "@/lib/api";
import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";

const schema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema
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
    const invalidJson = invalidJsonResponse(error);
    if (invalidJson) return invalidJson;
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Account already exists. Please login." }, { status: 409 });
    }
    console.error("SIGNUP_ERROR", error);
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}
