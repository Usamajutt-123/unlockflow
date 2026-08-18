import Background from "./Background";
import Footer from "./Footer";

interface PageShellProps {
  title: string;
  subtitle?: string;
  badge?: string;
  children: React.ReactNode;
}

export default function PageShell({ title, subtitle, badge, children }: PageShellProps) {
  return (
    <div className="relative min-h-screen bg-white text-ink dark:bg-night-950 dark:text-slate-100">
      <Background />
      {/* top bar */}
      <div className="relative z-10">
        <div className="container-x flex items-center justify-between py-4">
          <a href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-purple-600 shadow-glow">
              <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                <path d="M13.19 4.39a3.36 3.36 0 0 1 4.75 0l1.67 1.67a3.36 3.36 0 0 1 0 4.75l-3.3 3.3a3.36 3.36 0 0 1-4.75 0M10.81 19.61a3.36 3.36 0 0 1-4.75 0l-1.67-1.67a3.36 3.36 0 0 1 0-4.75l3.3-3.3a3.36 3.36 0 0 1 4.75 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
            <span className="font-display text-lg font-extrabold tracking-tight text-ink dark:text-white">
              UNLOCK<span className="text-brand-600 dark:text-brand-400">FLOW</span>
            </span>
          </a>
          <a href="/" className="btn-primary !py-2 !text-xs">← Back to Home</a>
        </div>
      </div>

      {/* hero */}
      <header className="relative z-10 pb-10 pt-8">
        <div className="container-x mx-auto max-w-4xl text-center">
          {badge && (
            <span className="chip border-brand-200 bg-white/70 text-brand-700 shadow-sm dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-300">
              {badge}
            </span>
          )}
          <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-ink dark:text-white sm:text-5xl">
            {title}
          </h1>
          {subtitle && <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-400">{subtitle}</p>}
        </div>
      </header>

      {/* content */}
      <main className="relative z-10 pb-20">
        <div className="container-x mx-auto max-w-4xl">{children}</div>
      </main>

      <Footer />
    </div>
  );
}
