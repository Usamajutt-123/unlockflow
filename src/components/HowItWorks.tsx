const steps = [
  {
    n: "01",
    title: "Build your link",
    desc: "Select 20+ smart tasks, add your destination reward link, and customize with optional advanced settings.",
  },
  {
    n: "02",
    title: "Share it anywhere",
    desc: "Copy the link or scan the QR code. Share on your website, bio, groups, or posts — anywhere your audience is.",
  },
  {
    n: "03",
    title: "Audience completes tasks",
    desc: "Each visitor taps through your tasks — subscribe, follow, like, join — and their progress is tracked.",
  },
  {
    n: "04",
    title: "Reward unlocked",
    desc: "Once every task is done, your visitor unlocks the destination link and gets their reward instantly.",
  },
];

export default function HowItWorks() {
  return (
    <section id="features" className="relative overflow-hidden bg-slate-50/40 py-20 sm:py-24 dark:bg-night-900/30">
      <div className="absolute inset-0 bg-grid opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
      <div className="container-x relative">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">How it works</span>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink dark:text-white sm:text-4xl">
            From task to reward in 4 simple steps
          </h2>
        </div>

        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <div key={s.n} className="relative">
              {i < steps.length - 1 && (
                <div className="absolute left-full top-8 hidden h-px w-8 border-t-2 border-dashed border-brand-300 lg:block dark:border-brand-500/40" />
              )}
              <div className="flex flex-col items-start">
                <span className="font-display text-5xl font-extrabold text-brand-500 dark:text-brand-400">{s.n}</span>
                <h3 className="mt-2 font-display text-lg font-bold text-ink dark:text-white">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
