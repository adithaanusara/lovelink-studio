import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { FeatureGrid } from "@/components/FeatureGrid";
import { Footer } from "@/components/Footer";
import { MemoryCard } from "@/components/MemoryCard";

export default async function HomePage() {
  const recentProjects = await prisma.memoryProject.findMany({
    orderBy: { createdAt: "desc" },
    take: 3
  });

  return (
    <main>
      <Navbar />
      <Hero />
      <FeatureGrid />

      <section className="container py-12 lg:py-16">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-pink-200">Latest creations</p>
            <h2 className="mt-2 text-3xl font-bold">Recent public pages</h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-slate-300">
            After a user creates a memory page, it instantly appears under a shareable route like /p/your-slug.
          </p>
        </div>

        {recentProjects.length === 0 ? (
          <div className="glass rounded-[2rem] p-10 text-center text-slate-300">
            No public pages yet. Create the first one from the builder.
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-3">
            {recentProjects.map((project) => (
              <MemoryCard
                key={project.id}
                slug={project.slug}
                title={project.title}
                recipient={project.recipient}
                sender={project.sender}
                occasion={project.occasion}
                coverImage={project.coverImage}
                theme={project.theme}
                eventDate={project.eventDate?.toISOString()}
              />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
