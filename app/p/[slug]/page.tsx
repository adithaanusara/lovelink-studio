import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Music4 } from "lucide-react";

async function getProject(slug: string) {
  return prisma.memoryProject.findUnique({
    where: { slug },
    include: { gallery: { orderBy: { sortOrder: "asc" } } }
  });
}

export default async function MemoryPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project) notFound();

  const layout = project.layoutJson as
    | {
        background?: string;
        items?: Array<{
          id: string;
          type: "text" | "image";
          x: number;
          y: number;
          w: number;
          h: number;
          content?: string;
          src?: string;
          fontSize?: number;
          color?: string;
          fontWeight?: number;
          z?: number;
        }>;
      }
    | null;

  return (
    <main className="min-h-screen bg-black text-white">
      <section
        className="relative mx-auto min-h-screen max-w-[1400px] overflow-hidden"
        style={{ background: layout?.background || "linear-gradient(135deg,#12071f,#08122c)" }}
      >
        <div className="absolute inset-0 bg-black/20" />

        {layout?.items?.map((item) => (
          <div
            key={item.id}
            className="absolute"
            style={{
              left: item.x,
              top: item.y,
              width: item.w,
              height: item.h,
              zIndex: item.z ?? 1
            }}
          >
            {item.type === "text" ? (
              <div
                className="whitespace-pre-wrap"
                style={{
                  color: item.color || "#fff",
                  fontSize: item.fontSize || 24,
                  fontWeight: item.fontWeight || 600
                }}
              >
                {item.content}
              </div>
            ) : item.src ? (
              <img
                src={item.src}
                alt=""
                className="h-full w-full rounded-[1.5rem] object-cover shadow-2xl"
              />
            ) : null}
          </div>
        ))}

        {project.musicUrl ? (
          <a
            href={project.musicUrl}
            target="_blank"
            rel="noreferrer"
            className="absolute bottom-8 left-8 inline-flex items-center gap-2 rounded-full bg-pink-500/15 px-5 py-3 text-pink-100 backdrop-blur-md"
          >
            <Music4 className="h-4 w-4" />
            Play our song
          </a>
        ) : null}
      </section>
    </main>
  );
}