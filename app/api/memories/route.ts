import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSlug } from "@/lib/utils";

const memorySchema = z.object({
  title: z.string().min(3).max(120),
  recipient: z.string().min(2).max(80),
  sender: z.string().min(2).max(80),
  occasion: z.string().min(2).max(40),
  message: z.string().min(12).max(2000),
  accentText: z.string().max(160).optional().nullable(),
  musicUrl: z.string().url().optional().or(z.literal("")),
  eventDate: z.string().optional().or(z.literal("")),
  theme: z.enum(["romantic", "dreamy", "elegant", "cute"]),
  coverImage: z.string().url(),
  gallery: z
    .array(
      z.object({
        imageUrl: z.string().url(),
        altText: z.string().max(120).optional().nullable()
      })
    )
    .max(8)
});

export async function GET() {
  const memories = await prisma.memoryProject.findMany({
    orderBy: { createdAt: "desc" },
    include: { gallery: { orderBy: { sortOrder: "asc" } } }
  });

  return NextResponse.json(memories);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = memorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid data." }, { status: 400 });
    }

    const payload = parsed.data;
    const baseSlug = createSlug(`${payload.recipient}-${payload.occasion}-${payload.title}`);

    const existingCount = await prisma.memoryProject.count({
      where: { slug: { startsWith: baseSlug } }
    });

    const slug = existingCount > 0 ? `${baseSlug}-${existingCount + 1}` : baseSlug;

    const project = await prisma.memoryProject.create({
      data: {
        title: payload.title,
        recipient: payload.recipient,
        sender: payload.sender,
        occasion: payload.occasion,
        message: payload.message,
        accentText: payload.accentText,
        musicUrl: payload.musicUrl || null,
        eventDate: payload.eventDate ? new Date(payload.eventDate) : null,
        theme: payload.theme,
        coverImage: payload.coverImage,
        slug,
        gallery: {
          create: payload.gallery.map((item: { imageUrl: string; altText?: string | null }, index: number) => ({
            imageUrl: item.imageUrl,
            altText: item.altText || null,
            sortOrder: index
          }))
        }
      }
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    return NextResponse.json({
      message: "Memory page created successfully.",
      slug: project.slug,
      shareUrl: `${appUrl}/p/${project.slug}`
    });
  } catch (error) {
    console.error("MEMORY_CREATE_ERROR", error);
    return NextResponse.json({ error: "Could not create memory page." }, { status: 500 });
  }
}
