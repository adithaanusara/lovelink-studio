import { z } from "zod";

export const emailSchema = z.string().trim().toLowerCase().email().max(254);
export const passwordSchema = z.string().min(6).max(1024);
export const nameSchema = z.string().trim().min(1).max(200);

export const mediaUrlSchema = z.string().url().refine((value) => {
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password;
  } catch {
    return false;
  }
}, "Use an HTTP or HTTPS media URL.");

const optionalMediaUrl = z.union([mediaUrlSchema, z.literal("")]).nullable().optional();

const eventDateSchema = z.string().refine((value) => {
  if (value === "") return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}, "Enter a valid event date.").nullable().optional();

const itemSchema = z.object({
  id: z.string().min(1),
  type: z.enum(["text", "image"]),
  x: z.number().finite(), y: z.number().finite(),
  w: z.number().positive(), h: z.number().positive(),
  content: z.string().optional(), src: optionalMediaUrl
}).passthrough();

const bookSchema = z.object({
  enabled: z.boolean(),
  pageCount: z.number().int().min(1).max(100),
  currentPage: z.number().int(),
  x: z.number().finite(), y: z.number().finite(),
  w: z.number().positive(), h: z.number().positive(),
  pages: z.array(z.object({
    layoutId: z.number().int().min(0).max(3).optional(),
    slots: z.array(z.object({
      type: z.enum(["image", "video"]), url: mediaUrlSchema,
      poster: optionalMediaUrl
    }).nullable()).max(4)
  })).max(100)
}).passthrough();

export const layoutSchema = z.object({
  animation: z.enum(["none", "falling-hearts", "falling-petals", "sparkle-hearts"]).optional(),
  storyScenes: z.array(z.object({
    id: z.string().min(1), name: z.string(), background: z.string(),
    backgroundImage: optionalMediaUrl,
    items: z.array(itemSchema).max(500),
    book: bookSchema.optional(),
    gameChallengeTarget: z.number().int().positive().nullable().optional(),
    puzzleTimeLimit: z.number().int().positive().optional(),
    puzzleImage: optionalMediaUrl
  }).passthrough()).max(50).optional()
}).passthrough();

export const memorySchema = z.object({
  title: z.string().trim().min(1).max(300),
  recipient: nameSchema,
  sender: nameSchema,
  occasion: nameSchema,
  message: z.string().trim().min(1).max(20000),
  accentText: z.string().max(2000).nullable().optional(),
  musicUrl: optionalMediaUrl,
  eventDate: eventDateSchema,
  theme: z.enum(["romantic", "dreamy", "elegant", "cute"]),
  coverImage: mediaUrlSchema,
  customSlugBase: z.string().trim().min(1).max(200).optional(),
  gallery: z.array(z.object({
    imageUrl: mediaUrlSchema,
    altText: z.string().max(1000).nullable().optional()
  })).max(500),
  layoutJson: layoutSchema.nullable().optional()
});
