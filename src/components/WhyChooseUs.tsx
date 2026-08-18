const points = [
  {
    icon: <path d="M12 2 3 7v10l9 5 9-5V7l-9-5z" />,
    title: "20+ Premium Tasks",
    desc: "YouTube, Instagram, Facebook, Telegram, WhatsApp, TikTok, Discord, Twitter & more — every platform in one tool.",
    color: "#FF0000",
  },
  {
    icon: <path d="M4 12h16m-6-6 6 6-6 6" />,
    title: "Instant Unlock Links",
    desc: "Generate a shareable link and QR code in seconds. No coding, no hassle, no monthly fees.",
    color: "#1d4ff0",
  },
  {
    icon: <path d="M12 2a10 10 0 1 0 10 10M12 12l5-5" />,
    title: "Smart Automation",
    desc: "Visitors complete tasks, the reward opens automatically. Fully hands-free once you build the link.",
    color: "#7c3aed",
  },
  {
    icon: <path d="M12 2v4m0 16v-4M2 12h4m16 0h-4M5 5l3 3m8 8 3 3M19 5l-3 3M8 16l-3 3" />,
    title: "Fully Customizable",
    desc: "Custom title, description, banner, icon, password protection, expiry date and custom slug — all optional.",
    color: "#f59e0b",
  },
  {
    icon: <path d="M9 12l2 2 4-4m5.6 2A9 9 0 1 1 11 3a9 9 0 0 1 9 9z" />,
    title: "No Login Required",
    desc: "Your visitors don't need an account. Open the link, complete tasks, unlock the reward. That's it.",
    color: "#10b981",
  },
  {
    icon: <path d="M3 3v18h18M8 17v-5m5 5V8m5 9v-3" />,
    title: "Actionable Analytics",
    desc: "Track completions and engagement so you know exactly how your unlock links are performing.",
    color: "#06b6d4",
  },
];

function Icon({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}14` }}>
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {children}
      </svg>
    </span>
  );
}

export default function WhyChooseUs() {
  return (
    <section id="why-us" className="py-20 sm:py-24">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">Why UNLOCKFLOW</span>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink dark:text-white sm:text-4xl">
            A premium experience worth $10,000+
          </h2>
          <p className="mt-4 text-slate-600 dark:text-slate-400">
            Everything you need to grow your audience — beautifully designed, blazing fast, and effortless to use.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {points.map((p) => (
            <div key={p.title} className="card group p-6 transition hover:-translate-y-1 hover:shadow-glow dark:hover:shadow-[0_8px_40px_-10px_rgba(51,112,255,0.4)]">
              <Icon color={p.color}>{p.icon}</Icon>
              <h3 className="mt-4 font-display text-lg font-bold text-ink dark:text-white">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
