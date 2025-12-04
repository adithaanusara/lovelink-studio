import { readJson, invalidJsonResponse } from "@/lib/api";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { memorySchema } from "@/lib/validation";
import { prisma } from "@/lib/prisma";
import { createSlug } from "@/lib/utils";
import { randomUUID } from "node:crypto";

export async function POST(request: Request) {
  try {
    const body = await readJson(request);
    const parsed = memorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid data" },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const requestedSlug = createSlug(
      data.customSlugBase ||
        `${data.recipient}-${data.occasion}-from-${data.sender}`
    );

    const reserved = new Set(["api", "create", "login", "signup", "favicon", "icon"]);
    const baseSlug = !requestedSlug ? `memory-${randomUUID().slice(0, 8)}`
      : reserved.has(requestedSlug) ? `memory-${requestedSlug}` : requestedSlug.slice(0, 180).replace(/-+$/, "");
    const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
    const appUrl = new URL(configuredUrl || new URL(request.url).origin);
    if (!["http:", "https:"].includes(appUrl.protocol)) {
      throw new Error("Invalid application URL configuration");
    }

    // Let the unique constraint arbitrate simultaneous requests for the same URL.
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const slug = attempt === 0 ? baseSlug : `${baseSlug}-${randomUUID().slice(0, 8)}`;
      try {
            const project = await prisma.memoryProject.create({
              data: {
                slug,
                title: data.title,
                recipient: data.recipient,
                sender: data.sender,
                occasion: data.occasion,
                message: data.message,
                accentText: data.accentText || null,
                musicUrl: data.musicUrl || null,
                eventDate: data.eventDate ? new Date(data.eventDate) : null,
                theme: data.theme,
                coverImage: data.coverImage,
                layoutJson: data.layoutJson == null ? Prisma.DbNull : data.layoutJson as Prisma.InputJsonObject,
                gallery: {
                  create: data.gallery.map((item, index) => ({
                    imageUrl: item.imageUrl,
                    altText: item.altText || null,
                    sortOrder: index
                  }))
                }
              }
            });

            return NextResponse.json({
              success: true,
              shareUrl: new URL(`/${project.slug}`, appUrl).toString()
            }, { status: 201 });
      } catch (error) {
        if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") throw error;
      }
    }
    return NextResponse.json({ error: "Could not allocate a share URL. Please retry." }, { status: 409 });
  } catch (error) {
    const invalidJson = invalidJsonResponse(error);
    if (invalidJson) return invalidJson;
    console.error(error);
    return NextResponse.json(
      { error: "Failed to publish page" },
      { status: 500 }
    );
  }
}