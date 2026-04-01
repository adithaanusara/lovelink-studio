const features = [
  {
    title: "Personalized event pages",
    description: "Create a unique page for a birthday, Valentine surprise, anniversary, or apology message."
  },
  {
    title: "Rich visual storytelling",
    description: "Cover image, gallery section, timeline feel, animated text, and emotional reveal moments."
  },
  {
    title: "One-click sharing",
    description: "Every creation gets its own slug and public page URL that you can send to anyone."
  },
  {
    title: "Scalable architecture",
    description: "The project is organized for GitHub, deployment, and future mobile app expansion."
  }
];

export function FeatureGrid() {
  return (
    <section className="container py-10 lg:py-16">
      <div className="mb-8 max-w-2xl space-y-3">
        <p className="text-sm uppercase tracking-[0.3em] text-pink-200">Why this product works</p>
        <h2 className="text-3xl font-bold md:text-4xl">A premium surprise experience, not just another photo gallery.</h2>
        <p className="text-slate-300">
          This app helps users express emotion through design. It feels premium, personal, and highly shareable.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {features.map((feature) => (
          <div key={feature.title} className="glass rounded-[1.75rem] p-6">
            <h3 className="text-lg font-semibold">{feature.title}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-300">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
