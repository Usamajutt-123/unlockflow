import Logo from "./Logo";

const cols = [
  {
    title: "Product",
    links: [
      { label: "Link Generator", href: "/#unlock-tasks" },
      { label: "Task Library", href: "/task-library" },
      { label: "QR Codes", href: "/qr-codes" },
      { label: "Advanced Options", href: "/advanced-options" },
      { label: "Analytics", href: "/analytics" },
    ],
  },
  {
    title: "Platforms",
    links: [
      { label: "YouTube", href: "https://www.youtube.com" },
      { label: "Instagram", href: "https://www.instagram.com" },
      { label: "Facebook", href: "https://www.facebook.com" },
      { label: "Telegram", href: "https://telegram.org" },
      { label: "TikTok", href: "https://www.tiktok.com" },
      { label: "Discord", href: "https://discord.com" },
      { label: "Twitter", href: "https://twitter.com" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Help Center", href: "/help" },
      { label: "API", href: "/api" },
      { label: "Blog", href: "/blog" },
      { label: "Documentation", href: "/docs" },
      { label: "Changelog", href: "/changelog" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50/60 dark:border-night-700 dark:bg-night-900/40">
      <div className="container-x py-14">
        <div className="grid gap-10 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              The premium link-unlock platform. Help your audience engage, and unlock rewards — fully automated, no
              login required.
            </p>
            <div className="mt-5 flex items-center gap-3">
              {["#FF0000", "#E4405F", "#1877F2", "#26A5E4", "#0f0f0f", "#5865F2"].map((c, i) => (
                <span key={i} className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-slate-200 dark:bg-night-800 dark:ring-night-700" style={{ color: c }}>
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                    <circle cx="12" cy="12" r="9" opacity="0.25" />
                  </svg>
                </span>
              ))}
            </div>
          </div>

          {cols.map((col) => (
            <div key={col.title}>
              <h4 className="font-display text-sm font-bold uppercase tracking-wide text-slate-800 dark:text-slate-200">{col.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => {
                  const external = l.href.startsWith("http");
                  return (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        target={external ? "_blank" : undefined}
                        rel={external ? "noreferrer" : undefined}
                        className="text-sm text-slate-500 transition hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400"
                      >
                        {l.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-6 sm:flex-row dark:border-night-700">
          <p className="text-sm text-slate-500 dark:text-slate-400">© {new Date().getFullYear()} UNLOCKFLOW. All rights reserved.</p>
          <p className="text-sm text-slate-400 dark:text-slate-500">Made with care for creators worldwide.</p>
        </div>
      </div>
    </footer>
  );
}
