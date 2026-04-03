import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Music4 } from "lucide-react";
import { MemoryBook } from "@/components/MemoryBook";

type AnimationType =
  | "none"
  | "falling-hearts"
  | "falling-petals"
  | "sparkle-hearts";

type BookData = {
  enabled: boolean;
  pageCount: number;
  currentPage: number;
  pages: string[];
  x: number;
  y: number;
  w: number;
  h: number;
};

function FallingLayer({ type }: { type: AnimationType }) {
  const particles = Array.from({ length: 42 }, (_, i) => ({
    id: i,
    left: `${(i * 17) % 100}%`,
    delay: `${(i % 12) * 0.25}s`,
    duration: `${4.2 + (i % 5) * 0.55}s`,
    size: 14 + (i % 6) * 5,
    drift: -40 + (i % 9) * 10,
    rotate: 90 + (i % 8) * 35,
    opacity: 0.35 + (i % 4) * 0.12,
    symbol: type === "falling-petals" ? "✿" : "♥"
  }));

  if (type !== "falling-hearts" && type !== "falling-petals") return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <style>{`
        @keyframes romantic-fall-public-dense {
          0% {
            transform: translate3d(0, -14vh, 0) rotate(0deg) scale(0.85);
            opacity: 0;
          }
          8% {
            opacity: 1;
          }
          50% {
            opacity: 0.95;
          }
          100% {
            transform: translate3d(var(--drift), 118vh, 0) rotate(var(--rotate)) scale(1.08);
            opacity: 0;
          }
        }
      `}</style>

      {particles.map((item) => (
        <span
          key={item.id}
          className="absolute select-none"
          style={{
            left: item.left,
            top: "-16%",
            fontSize: `${item.size}px`,
            color: type === "falling-petals" ? "#f9a8d4" : "#fb7185",
            opacity: item.opacity,
            animationName: "romantic-fall-public-dense",
            animationDuration: item.duration,
            animationDelay: item.delay,
            animationIterationCount: "infinite",
            animationTimingFunction: "linear",
            filter:
              type === "falling-petals"
                ? "drop-shadow(0 0 10px rgba(249,168,212,0.35))"
                : "drop-shadow(0 0 10px rgba(251,113,133,0.35))",
            ["--drift" as string]: `${item.drift}px`,
            ["--rotate" as string]: `${item.rotate}deg`
          }}
        >
          {item.symbol}
        </span>
      ))}
    </div>
  );
}

function SparkleHeartsLayer() {
  const hearts = Array.from({ length: 28 }, (_, i) => ({
    id: i,
    left: `${3 + ((i * 11) % 94)}%`,
    top: `${4 + ((i * 9) % 88)}%`,
    delay: `${(i % 8) * 0.18}s`,
    size: 10 + (i % 5) * 5
  }));

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <style>{`
        @keyframes sparkle-heart-public-dense {
          0%, 100% {
            transform: scale(0.7);
            opacity: 0.12;
          }
          50% {
            transform: scale(1.35);
            opacity: 1;
          }
        }
      `}</style>

      {hearts.map((item) => (
        <span
          key={item.id}
          className="absolute select-none"
          style={{
            left: item.left,
            top: item.top,
            fontSize: `${item.size}px`,
            color: "#fb7185",
            animationName: "sparkle-heart-public-dense",
            animationDuration: "1.5s",
            animationDelay: item.delay,
            animationIterationCount: "infinite",
            animationTimingFunction: "ease-in-out",
            filter: "drop-shadow(0 0 12px rgba(251,113,133,0.5))"
          }}
        >
          ♥
        </span>
      ))}
    </div>
  );
}

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
        animation?: AnimationType;
        book?: BookData;
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

  const animation = layout?.animation || "none";
  const book = layout?.book;

  return (
    <main className="min-h-screen bg-black text-white">
      <section
        className="relative mx-auto min-h-screen max-w-[1400px] overflow-hidden"
        style={{
          background:
            layout?.background || "linear-gradient(135deg, #12071f 0%, #08122c 100%)"
        }}
      >
        {project.coverImage ? (
          <>
            <img
              src={project.coverImage}
              alt="Cover background"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-slate-950/45" />
          </>
        ) : null}

        {animation === "falling-hearts" ? <FallingLayer type="falling-hearts" /> : null}
        {animation === "falling-petals" ? <FallingLayer type="falling-petals" /> : null}
        {animation === "sparkle-hearts" ? <SparkleHeartsLayer /> : null}

        {book?.enabled ? (
          <div
            className="absolute z-[70]"
            style={{
              left: book.x,
              top: book.y,
              width: book.w
            }}
          >
            <MemoryBook
              pageCount={book.pageCount}
              pages={book.pages}
              currentPage={book.currentPage}
              width={book.w}
              height={book.h}
            />
          </div>
        ) : null}

        <div className="absolute inset-0 bg-black/10" />

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