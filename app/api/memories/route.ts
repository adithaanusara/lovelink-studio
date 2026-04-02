import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSlug } from "@/lib/utils";

const memorySchema = z.object({
  title: z.string().min(1),
  recipient: z.string().min(1),
  sender: z.string().min(1),
  occasion: z.string().min(1),
  message: z.string().min(1),
  accentText: z.string().optional().nullable(),
  musicUrl: z.string().optional().nullable(),
  eventDate: z.string().optional().nullable(),
  theme: z.string(),
  coverImage: z.string().url(),
  gallery: z.array(
    z.object({
      imageUrl: z.string().url(),
      altText: z.string().optional().nullable()
    })
  ),
  layoutJson: z.any().optional()
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = memorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid data" },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const slug = createSlug(`${data.recipient}-${data.occasion}-${data.title}-${Date.now()}`);

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
        layoutJson: data.layoutJson ?? null,
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
      shareUrl: `${process.env.NEXT_PUBLIC_APP_URL}/p/${project.slug}`
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to publish page" }, { status: 500 });
  }
}