import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Music4 } from "lucide-react";
import { StorySceneViewer } from "@/components/StorySceneViewer";
import { BookPageMedia } from "@/components/MemoryBook";
import { StageSize } from "@/lib/stage";

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
        stage?: StageSize;
      }
    | null;

  const animation = layout?.animation || "none";
  const storyScenes = layout?.storyScenes?.filter(
    (scene) => scene && Array.isArray(scene.items)
  );

  return (
    <main className="min-h-screen w-full overflow-x-hidden text-slate-900">
      {storyScenes && storyScenes.length > 0 ? (
        <StorySceneViewer scenes={storyScenes} animation={animation} stage={layout?.stage} />
      ) : (
        <section className="mx-auto flex min-h-screen max-w-[1400px] items-center justify-center px-4 text-center">
          <div className="surface p-8 text-slate-700 sm:p-10">
            This page has no scene data.
          </div>
        </section>
      )}

      {(project.musicUrl || project.gallery.length > 0) && (
        <section className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-4 pb-[max(3rem,env(safe-area-inset-bottom))] pt-10 sm:gap-8 sm:px-6 md:px-10">
          {project.musicUrl ? (
            <div className="surface p-4 sm:p-6">
              <div className="mb-4 flex items-center gap-3 text-violet-700">
                <Music4 className="h-5 w-5" />
                <p className="eyebrow">Song for this page</p>
              </div>
              <audio controls className="w-full" src={project.musicUrl} />
            </div>
          ) : null}

          {project.gallery.length > 0 ? (
            <div className="surface p-4 sm:p-6">
              <p className="eyebrow mb-5">Gallery memories</p>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
                {project.gallery.map((image) => (
                  <div
                    key={image.id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 sm:rounded-[1.5rem]"
                  >
                    <img
                      src={image.imageUrl}
                      alt={image.altText || "Gallery memory"}
                      loading="lazy"
                      className="aspect-square w-full object-cover sm:aspect-[4/3]"
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