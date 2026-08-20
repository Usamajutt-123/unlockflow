export default function Cta() {
  return (
    <section className="py-16 sm:py-20">
      <div className="container-x">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-600 via-brand-700 to-purple-700 px-6 py-14 text-center sm:px-12">
          <div className="absolute inset-0 bg-grid opacity-20" />
          <div className="absolute -left-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-10 -right-10 h-48 w-48 rounded-full bg-purple-400/30 blur-2xl" />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Ready to turn your audience into growth?
            </h2>
            <p className="mt-4 text-lg text-brand-100">
              Create your first premium unlock link in under a minute. Free, no login, no credit card.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <a
                href="#unlock-tasks"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-4 text-base font-bold text-brand-700 shadow-lg transition hover:scale-[1.02] active:scale-[0.98]"
              >
                Create Your Link
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
