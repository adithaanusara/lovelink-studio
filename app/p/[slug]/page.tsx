import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDate, getThemeClasses } from "@/lib/utils";
import { Heart, Music4 } from "lucide-react";

async function getProject(slug: string) {
  return prisma.memoryProject.findUnique({
    where: { slug },
    include: {
      gallery: {
        orderBy: { sortOrder: "asc" }
      }
    }
  });
}

export default async function MemoryPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project) {
    notFound();
  }

  return (
    <main className={`min-h-screen bg-gradient-to-br ${getThemeClasses(project.theme)} text-white`}>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-slate-950/60" />
        <img
          src={project.coverImage}
          alt={project.title}
          className="h-[72vh] w-full object-cover opacity-45"
        />

        <div className="absolute inset-0 flex items-center">
          <div className="container relative py-10">
            <div className="max-w-3xl rounded-[2rem] border border-white/10 bg-slate-950/45 p-6 backdrop-blur-xl md:p-10">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-pink-300/30 bg-pink-400/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-pink-100">
                <Heart className="h-4 w-4" />
                {project.occasion} surprise
              </div>

              <h1 className="text-4xl font-black leading-tight md:text-6xl">
                {project.title}
              </h1>

              {project.accentText ? (
                <p className="mt-4 text-lg leading-8 text-slate-200">
                  {project.accentText}
                </p>
              ) : null}

              <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-200">
                <span className="rounded-full bg-white/10 px-4 py-2">
                  For {project.recipient}
                </span>

                {project.sender ? (
                  <span className="rounded-full bg-white/10 px-4 py-2">
                    From {project.sender}
                  </span>
                ) : null}

                {project.eventDate ? (
                  <span className="rounded-full bg-white/10 px-4 py-2">
                    {formatDate(project.eventDate.toISOString())}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-14">
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="rounded-[2rem] border border-white/10 bg-slate-950/50 p-6 backdrop-blur-xl md:p-8">
            <p className="text-sm uppercase tracking-[0.35em] text-pink-200">
              Message
            </p>

            <p className="mt-5 whitespace-pre-line text-lg leading-9 text-slate-100">
              {project.message}
            </p>

            {project.musicUrl ? (
              <a
                href={project.musicUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-pink-500/15 px-4 py-2 text-sm text-pink-100"
              >
                <Music4 className="h-4 w-4" />
                Play our song
              </a>
            ) : null}
          </div>

          {project.gallery.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2">
              {project.gallery.map(
                (item: { id: string; imageUrl: string; altText: string | null }) => (
                  <div
                    key={item.id}
                    className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-950/40 shadow-2xl"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.altText ?? project.title}
                      className="h-80 w-full object-cover transition duration-700 hover:scale-105"
                    />

                    {item.altText ? (
                      <p className="p-4 text-sm text-slate-200">{item.altText}</p>
                    ) : null}
                  </div>
                )
              )}
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}