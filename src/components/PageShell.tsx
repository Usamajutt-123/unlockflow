import Background from "./Background";
import Footer from "./Footer";
import Logo from "./Logo";

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
          <a href="/" className="flex items-center gap-2" aria-label="UNLOCKFLOW home">
            <Logo />
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
