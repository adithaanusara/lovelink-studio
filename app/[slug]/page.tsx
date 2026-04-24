import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Music4 } from "lucide-react";
import { StorySceneViewer } from "@/components/StorySceneViewer";
import { BookPageMedia } from "@/components/MemoryBook";

type AnimationType =
  | "none"
  | "falling-hearts"
  | "falling-petals"
  | "sparkle-hearts";

type LayoutItem = {
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
};

type BookData = {
  enabled: boolean;
  pageCount: number;
  currentPage: number;
  pages: BookPageMedia[];
  x: number;
  y: number;
  w: number;
  h: number;
  title?: string;
};

type StoryScene = {
  id: string;
  name: string;
  background: string;
  backgroundImage?: string;
  items: LayoutItem[];
  book?: BookData;
};

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
        animation?: AnimationType;
        storyScenes?: StoryScene[];
      }
    | null;

  const animation = layout?.animation || "none";
  const storyScenes = layout?.storyScenes?.filter(
    (scene) => scene && Array.isArray(scene.items)
  );

  return (
    <main className="min-h-screen bg-sky-100 text-slate-900">
      {storyScenes && storyScenes.length > 0 ? (
        <StorySceneViewer scenes={storyScenes} animation={animation} />
      ) : (
        <section className="mx-auto flex min-h-screen max-w-[1400px] items-center justify-center px-6 text-center">
          <div className="rounded-[2rem] border border-sky-400/80 bg-sky-100/90 p-10 text-slate-700">
            This page has no scene data.
          </div>
        </section>
      )}

      {(project.musicUrl || project.gallery.length > 0) && (
        <section className="mx-auto flex w-full max-w-[1400px] flex-col gap-8 px-6 py-12 md:px-10">
          {project.musicUrl ? (
            <div className="rounded-[2rem] border border-sky-400/80 bg-sky-100/90 p-6 backdrop-blur-md">
              <div className="mb-4 flex items-center gap-3 text-sky-800">
                <Music4 className="h-5 w-5" />
                <p className="text-sm uppercase tracking-[0.3em]">Song for this page</p>
              </div>
              <audio controls className="w-full" src={project.musicUrl} />
            </div>
          ) : null}

          {project.gallery.length > 0 ? (
            <div className="rounded-[2rem] border border-sky-400/80 bg-sky-100/90 p-6 backdrop-blur-md">
              <p className="mb-5 text-sm uppercase tracking-[0.3em] text-sky-800">
                Gallery memories
              </p>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {project.gallery.map((image) => (
                  <div
                    key={image.id}
                    className="overflow-hidden rounded-[1.5rem] border border-sky-300/80 bg-sky-100/85"
                  >
                    <img
                      src={image.imageUrl}
                      alt={image.altText || "Gallery memory"}
                      className="h-72 w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      )}
    </main>
  );
}