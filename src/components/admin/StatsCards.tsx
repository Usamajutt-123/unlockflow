"use client";

interface Totals {
  links: number;
  views: number;
  clicks: number;
  completions: number;
  tasks: number;
}

export default function StatsCards({ totals }: { totals?: Totals }) {
  const cards = [
    { label: "Total Links", value: totals?.links ?? 0, icon: "🔗", color: "from-brand-500 to-blue-600" },
    { label: "Total Views", value: totals?.views ?? 0, icon: "👁", color: "from-purple-500 to-indigo-600" },
    { label: "Total Clicks", value: totals?.clicks ?? 0, icon: "🖱", color: "from-cyan-500 to-sky-600" },
    { label: "Completions", value: totals?.completions ?? 0, icon: "✅", color: "from-emerald-500 to-green-600" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <div key={c.label} className="card relative overflow-hidden p-5 dark:border-night-700 dark:bg-night-900">
          <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${c.color} opacity-10 blur-2xl`} />
          <div className="flex items-center justify-between">
            <span className="text-2xl">{c.icon}</span>
            <span className="font-display text-3xl font-extrabold text-ink dark:text-white">
              {typeof c.value === "number" ? c.value.toLocaleString() : c.value}
            </span>
          </div>
          <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">{c.label}</p>
        </div>
      ))}
    </div>
  );
}
