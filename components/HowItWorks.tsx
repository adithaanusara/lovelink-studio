const steps = [
  {
    title: "Pick a look",
    description: "Start from a template and give each scene its own background photo."
  },
  {
    title: "Make it yours",
    description: "Add your words, photos, an album, an animation, and the mini games."
  },
  {
    title: "Publish and share",
    description: "Choose a custom link, publish, and send it to your someone special."
  }
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 border-y border-white/70 bg-white/50 py-16 lg:py-24">
      <div className="container">
        <div className="mb-10 max-w-2xl space-y-3">
          <p className="eyebrow">How it works</p>
          <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
            From blank page to shared link in three steps.
          </h2>
        </div>

        <ol className="grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.title} className="relative rounded-3xl border border-slate-200/70 bg-white p-6 shadow-soft">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-sm font-extrabold text-white shadow-brand">
                {index + 1}
              </span>
              <h3 className="mt-4 text-lg font-bold">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
