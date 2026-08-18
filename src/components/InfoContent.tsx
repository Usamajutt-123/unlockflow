export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-2xl font-bold text-ink dark:text-white">{title}</h2>
      <div className="mt-3 space-y-3 text-slate-600 dark:text-slate-400">{children}</div>
    </section>
  );
}

export function P({ children }: { children: React.ReactNode }) {
  return <p className="leading-relaxed">{children}</p>;
}

export function List({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((it, i) => (
        <li key={i} className="flex items-start gap-2.5">
          <svg className="mt-0.5 h-5 w-5 shrink-0 text-brand-600 dark:text-brand-400" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}

export function Cards({ items }: { items: { title: string; desc: string }[] }) {
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2">
      {items.map((it, i) => (
        <div key={i} className="card p-5 dark:border-night-700 dark:bg-night-900">
          <h3 className="font-display text-base font-bold text-ink dark:text-white">{it.title}</h3>
          <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">{it.desc}</p>
        </div>
      ))}
    </div>
  );
}
