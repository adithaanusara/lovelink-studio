import { BookOpen, Gamepad2, Layers, Link2, MousePointerClick, Sparkles } from "lucide-react";

const features = [
  {
    icon: Layers,
    title: "A story in four scenes",
    description: "Build your page as full-screen scenes, each with its own background, that play one after another."
  },
  {
    icon: MousePointerClick,
    title: "Drag-and-drop editor",
    description: "Place text, emoji, and photos exactly where you want them, then resize and restyle until it feels right."
  },
  {
    icon: BookOpen,
    title: "Flip-through photo album",
    description: "Add an album of 4, 6, or 8 pages with your photos and video clips, complete with page-turn animation."
  },
  {
    icon: Sparkles,
    title: "Hearts, petals, and sparkle",
    description: "Pick falling hearts, falling petals, or sparkling hearts to drift across your scenes."
  },
  {
    icon: Gamepad2,
    title: "Two built-in mini games",
    description: "Set a tap-to-fly bird challenge and turn one of your photos into a timed sliding puzzle."
  },
  {
    icon: Link2,
    title: "One private link",
    description: "Name your link after the person and the occasion, publish, and send it to anyone."
  }
];

export function FeatureGrid() {
  return (
    <section id="features" className="container scroll-mt-20 py-16 lg:py-24">
      <div className="mb-10 max-w-2xl space-y-3">
        <p className="eyebrow">Why it works</p>
        <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
          A premium surprise experience, not just another photo gallery.
        </h2>
        <p className="text-base leading-7 text-slate-600">
          Everything you need to turn a few photos and a message into a page that feels personal.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="surface p-6 transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(124,58,237,0.12)]"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-100 to-violet-100 text-violet-700">
              <feature.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-bold">{feature.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
