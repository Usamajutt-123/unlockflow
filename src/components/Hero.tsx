import Image from "next/image";

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-32 pb-24">
      {/* backgrounds */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-50/50 via-transparent to-transparent dark:from-night-900/40 dark:via-transparent dark:to-transparent" />
      <div className="absolute inset-0 -z-10 bg-grid [mask-image:radial-gradient(ellipse_at_top,black_35%,transparent_75%)]" />
      <div className="absolute -top-24 left-1/2 -z-10 hidden h-80 w-[44rem] -translate-x-1/2 rounded-full bg-brand-400/25 blur-3xl md:block dark:bg-brand-600/20" />
      <div className="absolute right-0 top-1/3 -z-10 hidden h-64 w-64 rounded-full bg-purple-400/20 blur-3xl md:block dark:bg-purple-600/10" />

      {/* premium floating accents */}
      <div className="pointer-events-none absolute left-[6%] top-32 -z-10 hidden h-14 w-14 animate-float rounded-2xl border border-brand-200/60 bg-white/40 backdrop-blur lg:block dark:border-night-700 dark:bg-night-800/40">
        <span className="flex h-full w-full items-center justify-center text-lg">🔒</span>
      </div>
      <div className="pointer-events-none absolute right-[8%] top-44 -z-10 hidden h-14 w-14 animate-float rounded-2xl border border-purple-200/60 bg-white/40 backdrop-blur [animation-delay:1.2s] lg:block dark:border-night-700 dark:bg-night-800/40">
        <span className="flex h-full w-full items-center justify-center text-lg">⚡</span>
      </div>

      <div className="container-x grid items-center gap-14 lg:grid-cols-2">
        <div>
          <span className="chip border-brand-200 bg-white/70 text-brand-700 shadow-sm dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500" />
            </span>
            The premium link-unlock engine
          </span>

          <h1 className="mt-6 font-display text-4xl font-extrabold leading-tight tracking-tight text-ink dark:text-white sm:text-5xl lg:text-6xl">
            Create an <span className="text-gradient">Unlock Link</span> in{" "}
            <span className="gradient-gold">30 Seconds</span> — No Signup Required
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600 dark:text-slate-400">
            Turn your audience into engaged fans. Visitors complete your selected tasks —
            subscribe, follow, like &amp; join — and instantly unlock their reward. Fully
            automated, beautifully designed, no login required.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a href="#generator" className="btn-primary !px-7 !py-4 !text-base">
              Create Your Link — Free
            </a>
            <a href="#generator" className="btn-ghost !px-7 !py-4 !text-base">
              Explore Tasks
            </a>
          </div>

          <div className="mt-10 flex items-center gap-8">
            {[
              ["20+", "Smart Tasks"],
              ["100%", "Automated"],
              ["0", "Login Required"],
            ].map(([n, l]) => (
              <div key={l} className="border-l-2 border-brand-200 pl-4 dark:border-night-700">
                <div className="font-display text-2xl font-extrabold text-ink dark:text-white">{n}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* premium demo card — hidden on mobile, shown on lg+ */}
        <div className="relative hidden lg:block">
          <div className="absolute inset-0 -z-10 rounded-[2.5rem] bg-gradient-to-br from-brand-500 to-purple-600 opacity-15 blur-2xl dark:opacity-30" />
          <div className="card relative overflow-hidden !rounded-[2rem] p-6 dark:border-night-700 dark:bg-night-900/80 dark:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]">
            {/* shine sweep */}
            <div className="pointer-events-none absolute inset-0 -translate-x-full overflow-hidden bg-gradient-to-r from-transparent via-white/5 to-transparent">
              <div className="h-full w-full animate-shimmer" />
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 dark:bg-night-800">
              <div className="flex items-center gap-3">
                <Image src="/logo.webp" alt="" width={34} height={34} unoptimized className="rounded-lg" />
                <div>
                  <div className="text-xs text-slate-400 dark:text-slate-500">unlock.flow</div>
                  <div className="text-sm font-semibold text-ink dark:text-white">Your reward is ready</div>
                </div>
              </div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">Live</span>
            </div>

            <div className="mt-5 space-y-3">
              {[
                ["youtube", "Subscribe @Creator", "done"],
                ["instagram", "Follow @creator", "done"],
                ["discord", "Join Discord Server", "done"],
                ["telegram", "Join Telegram", "pending"],
              ].map(([brand, label, state]) => (
                <div
                  key={label}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 dark:border-night-700 dark:bg-night-800/50"
                >
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${state === "done" ? "bg-emerald-50 dark:bg-emerald-500/10" : "bg-slate-100 dark:bg-night-700"
                      }`}
                  >
                    {brand === "youtube" && (
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="#FF0000">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                      </svg>
                    )}
                    {brand === "instagram" && (
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="#E4405F">
                        <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
                      </svg>
                    )}
                    {brand === "discord" && (
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="#5865F2">
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 5.994-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                      </svg>
                    )}
                    {brand === "telegram" && (
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="#26A5E4">
                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                      </svg>
                    )}
                  </span>
                  <span className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
                  {state === "done" ? (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white">
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                        <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  ) : (
                    <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">Tap</span>
                  )}
                </div>
              ))}
            </div>

            <button className="btn-primary mt-5 w-full !py-3.5">Unlock Reward</button>
          </div>
        </div>
      </div>
    </section>
  );
}
