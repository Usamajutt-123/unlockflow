"use client";
import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { getTaskOption, verifyPassword } from "@/lib/tasks";
import type { UnlockLink, Task } from "@/lib/types";
import { BrandIcon } from "@/components/brandIcons";
import ThemeToggle from "@/components/ThemeToggle";
import Background from "@/components/Background";
import { getTheme } from "@/lib/themes";
import { parseVideoUrl } from "@/lib/thumbnail";
import Head from "next/head";

export default function UnlockPage({ params }: { params: { slug: string } }) {
  const slug = params.slug;
  const [link, setLink] = useState<UnlockLink | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [rewardOpen, setRewardOpen] = useState(false);
  const [passValue, setPassValue] = useState("");
  const [passError, setPassError] = useState("");
  const [copied, setCopied] = useState(false);
  const [processing, setProcessing] = useState<{ idx: number; phase: "open" | "confirm" } | null>(null);

  const storageKey = `uf_done_${slug}`;

  useEffect(() => {
    const load = async () => {
      if (!isSupabaseConfigured) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("links")
        .select("*, tasks(*)")
        .eq("slug", slug)
        .single();

      if (error || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      // expiry check
      if (data.expiry_date && new Date(data.expiry_date).getTime() < Date.now()) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      if (data.active === false) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      // track a view (best effort)
      (async () => { await supabase.rpc("record_event", { p_slug: slug, p_event: "view" }); })().catch(() => {});

      const ordered = [...(data.tasks || [])].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
      setLink(data);
      setTasks(ordered);

      // restore completed state from localStorage
      try {
        const done = JSON.parse(localStorage.getItem(storageKey) || "[]") as number[];
        setCompleted(new Set(done));
        if (done.length >= ordered.length && ordered.length > 0) {
          setRewardOpen(true);
        }
      } catch {}

      setLoading(false);
    };
    load();
  }, [slug, storageKey]);

  const allDone = tasks.length > 0 && completed.size >= tasks.length;

  const doTask = (idx: number) => {
    const t = tasks[idx];
    if (!t || processing || completed.has(idx)) return;

    // Phase 1: "Opening link..." loading (1s), then open the actual task link
    setProcessing({ idx, phase: "open" });
    setTimeout(() => {
      // open the link on the SAME link the creator provided
      window.open(t.task_url, "_blank", "noopener");
      // track a click (best effort)
      (async () => { await supabase.rpc("record_event", { p_slug: slug, p_event: "click" }); })().catch(() => {});

      // Phase 2: "Confirming..." loading (0.6s), then mark task complete
      setProcessing({ idx, phase: "confirm" });
      setTimeout(() => {
        setCompleted((prev) => {
          const next = new Set(prev);
          next.add(idx);
          try {
            localStorage.setItem(storageKey, JSON.stringify([...next]));
          } catch {}
          return next;
        });
        setProcessing(null);
      }, 600);
    }, 1000);
  };

  // when all done, record completion (compact counter, no unbounded rows)
  useEffect(() => {
    if (!allDone || !link?.id || !isSupabaseConfigured) return;
    (async () => {
      await supabase.rpc("record_event", { p_slug: slug, p_event: "complete" });
    })().catch(() => {});
  }, [allDone, link?.id, slug]);

  const openReward = async () => {
    if (link?.has_password && link.password_hash) {
      const ok = await verifyPassword(passValue, link.password_hash);
      if (!ok) {
        setPassError("Incorrect password. Please try again.");
        return;
      }
      setPassError("");
    }
    setRewardOpen(true);
    try {
      localStorage.setItem(storageKey, JSON.stringify([...completed]));
    } catch {}
  };

  const copyDest = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link.destination_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  if (loading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-slate-50 dark:bg-night-950">
        <Background />
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600 dark:border-night-700 dark:border-t-brand-400" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading unlock page…</p>
        </div>
      </div>
    );
  }

  if (notFound || !link) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center dark:bg-night-950">
        <Background />
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
          <svg className="h-8 w-8 text-red-500" viewBox="0 0 24 24" fill="none">
            <path d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="mt-5 font-display text-2xl font-extrabold text-ink dark:text-white">Link not found</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          This unlock link is invalid, has expired, or Supabase isn't configured.
        </p>
        <a href="/" className="btn-primary mt-6">Go to UNLOCKFLOW</a>
      </div>
    );
  }

  const progress = tasks.length ? Math.round((completed.size / tasks.length) * 100) : 0;
  const th = getTheme(link.theme || "midnight");

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-night-950">
      <Head>
        <title>{link.title} | UNLOCKFLOW</title>
        <meta name="description" content={link.description || "Complete the tasks to unlock your reward."} />
        <meta property="og:title" content={link.title} />
        <meta property="og:description" content={link.description || "Complete the tasks to unlock your reward."} />
        {link.icon_url && <meta property="og:image" content={link.icon_url} />}
        {link.video_url && parseVideoUrl(link.video_url) && <meta property="og:image" content={parseVideoUrl(link.video_url)!.thumbnail} />}
      </Head>
      <Background />
      {/* floating theme toggle */}
      <div className="fixed right-5 top-5 z-50">
        <ThemeToggle />
      </div>

      {/* brand bar */}
      <div className="relative z-10">
        <div className="container-x flex items-center justify-between py-4">
          <a href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-purple-600 shadow-glow">
              <svg className="h-4.5 w-4.5 h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                <path d="M13.19 4.39a3.36 3.36 0 0 1 4.75 0l1.67 1.67a3.36 3.36 0 0 1 0 4.75l-3.3 3.3a3.36 3.36 0 0 1-4.75 0M10.81 19.61a3.36 3.36 0 0 1-4.75 0l-1.67-1.67a3.36 3.36 0 0 1 0-4.75l3.3-3.3a3.36 3.36 0 0 1 4.75 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
            <span className="font-display text-base font-extrabold tracking-tight text-ink dark:text-white">
              UNLOCK<span className="text-brand-600 dark:text-brand-400">FLOW</span>
            </span>
          </a>
          <a href="/" className="btn-ghost !py-2 !text-xs">Create your own</a>
        </div>
      </div>

      {/* banner / header */}
      <div className={`relative flex min-h-[38vh] items-end bg-gradient-to-br ${th.header} bg-cover bg-center pb-12 pt-16`}>
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-night-950/30 to-transparent" />
        <div className="container-x relative w-full">
          <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
            {parseVideoUrl(link.video_url || "") && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={parseVideoUrl(link.video_url || "")!.thumbnail}
                alt=""
                className="mb-4 h-40 w-64 rounded-2xl object-cover shadow-lg ring-4 ring-white/30"
              />
            )}
            {link.icon_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={link.icon_url} alt="" className="h-20 w-20 rounded-2xl object-cover shadow-lg ring-4 ring-white/30" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/15 shadow-lg ring-4 ring-white/30 backdrop-blur">
                <svg className="h-9 w-9 text-white" viewBox="0 0 24 24" fill="none">
                  <path d="M13.19 4.39a3.36 3.36 0 0 1 4.75 0l1.67 1.67a3.36 3.36 0 0 1 0 4.75l-3.3 3.3a3.36 3.36 0 0 1-4.75 0M10.81 19.61a3.36 3.36 0 0 1-4.75 0l-1.67-1.67a3.36 3.36 0 0 1 0-4.75l3.3-3.3a3.36 3.36 0 0 1 4.75 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            )}
            <h1 className="mt-4 font-display text-3xl font-extrabold text-white drop-shadow sm:text-4xl">{link.title}</h1>
            {link.description && <p className="mt-3 max-w-xl text-brand-100">{link.description}</p>}
          </div>
        </div>
      </div>

      {/* content */}
      <div className="container-x -mt-12 pb-20">
        {/* How to unlock guide */}
        <div className="card mx-auto mb-4 max-w-2xl overflow-hidden !rounded-2xl dark:border-night-700 dark:bg-night-900/80">
          <div className={`bg-gradient-to-r ${th.progressBar} px-5 py-3`}>
            <h3 className="flex items-center gap-2 text-sm font-bold text-white">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M13.19 4.39a3.36 3.36 0 0 1 4.75 0l1.67 1.67a3.36 3.36 0 0 1 0 4.75l-3.3 3.3a3.36 3.36 0 0 1-4.75 0M10.81 19.61a3.36 3.36 0 0 1-4.75 0l-1.67-1.67a3.36 3.36 0 0 1 0-4.75l3.3-3.3a3.36 3.36 0 0 1 4.75 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              How to unlock
            </h3>
          </div>
          <ol className="grid gap-1 p-4 text-sm text-slate-600 sm:grid-cols-3 dark:text-slate-300">
            {[
              { n: 1, t: "Tap a task" },
              { n: 2, t: "Complete it in the new tab" },
              { n: 3, t: "Unlock your reward" },
            ].map((s) => (
              <li key={s.n} className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white dark:bg-brand-500">
                  {s.n}
                </span>
                <span className="text-xs font-medium">{s.t}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="card mx-auto max-w-2xl !rounded-3xl p-6 sm:p-8 dark:border-night-700 dark:bg-night-900/80 dark:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]">
          {/* progress */}
          <div className="mb-6 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-night-700 dark:bg-night-800/50">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Complete all tasks to unlock</span>
              <span className="font-bold text-brand-600 dark:text-brand-400">{completed.size}/{tasks.length} done</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-night-700">
              <div
                className={`relative h-full overflow-hidden rounded-full bg-gradient-to-r ${th.progressBar} transition-all duration-500`}
                style={{ width: `${progress}%` }}
              >
                <span className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent" />
              </div>
            </div>
          </div>

          {/* task list */}
          <ul className="space-y-3">
            {tasks.map((t, i) => {
              const opt = getTaskOption(t.task_type);
              const done = completed.has(i);
              const isProcessing = processing?.idx === i;
              const isOpen = isProcessing && processing.phase === "open";
              const isConfirm = isProcessing && processing.phase === "confirm";
              return (
                <li key={i}>
                  <button
                    onClick={() => doTask(i)}
                    disabled={done || !!processing}
                    className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition ${
                      done
                        ? "border-emerald-200 bg-emerald-50 opacity-85 dark:border-emerald-500/30 dark:bg-emerald-500/10"
                        : isProcessing
                        ? "border-brand-400 bg-brand-50 shadow-glow dark:border-brand-500/50 dark:bg-brand-500/10"
                        : "border-slate-200 bg-white shadow-sm hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-glow active:scale-[0.99] dark:border-night-700 dark:bg-night-800 dark:hover:border-brand-500"
                    }`}
                  >
                    <span
                      className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl dark:bg-white"
                      style={{ backgroundColor: `${opt?.brandColor || "#1d4ff0"}14` }}
                    >
                      {isProcessing ? (
                        <svg className="h-5 w-5 animate-spin text-brand-600 dark:text-brand-400" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                          <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                      ) : (
                        <BrandIcon brand={opt?.brand || "custom"} className="h-5.5 w-5.5 h-5 w-5" />
                      )}
                      <span className="absolute -left-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-slate-600 shadow dark:bg-night-700 dark:text-slate-300">
                        {i + 1}
                      </span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block text-sm font-semibold ${done ? "text-emerald-700 dark:text-emerald-400" : isProcessing ? "text-brand-700 dark:text-brand-300" : "text-slate-800 dark:text-slate-100"}`}>
                        {t.label}
                      </span>
                      <span className="block truncate text-xs text-slate-400 dark:text-slate-500">
                        {done ? "Completed ✓" : isOpen ? "Opening link…" : isConfirm ? "Confirming…" : "Tap to complete →"}
                      </span>
                    </span>
                    {done ? (
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    ) : isProcessing ? (
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600 dark:bg-brand-500/20 dark:text-brand-300">
                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                          <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                      </span>
                    ) : (
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-slate-200 text-slate-400 dark:border-night-600 dark:text-slate-500">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          {/* reward area */}
          <div className="mt-6">
            {!rewardOpen ? (
              <button
                onClick={openReward}
                disabled={!allDone}
                className={`w-full rounded-xl px-4 py-4 !text-base font-semibold shadow-glow transition disabled:cursor-not-allowed disabled:opacity-40 ${th.button}`}
              >
                {allDone ? (
                  <>
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                      <rect x="4" y="11" width="16" height="9" rx="2" stroke="currentColor" strokeWidth="2" />
                      <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    Unlock Reward
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                      <path d="M13.19 4.39a3.36 3.36 0 0 1 4.75 0l1.67 1.67a3.36 3.36 0 0 1 0 4.75l-3.3 3.3a3.36 3.36 0 0 1-4.75 0M10.81 19.61a3.36 3.36 0 0 1-4.75 0l-1.67-1.67a3.36 3.36 0 0 1 0-4.75l3.3-3.3a3.36 3.36 0 0 1 4.75 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    Complete tasks to unlock ({tasks.length - completed.size} remaining)
                  </>
                )}
              </button>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center dark:border-emerald-500/30 dark:bg-emerald-500/10">
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Reward Unlocked!
                </span>
                <p className="mt-3 text-sm text-emerald-800 dark:text-emerald-300">Congratulations! Here is your reward:</p>
                <a
                  href={link.destination_url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary mt-4 w-full !py-4 !text-base"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <path d="M14 3h7v7M21 3l-9 9M10 5H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Open Reward
                </a>
                <button
                  onClick={copyDest}
                  className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-300"
                >
                  {copied ? "Copied!" : "Copy reward link"}
                </button>
              </div>
            )}

            {link.has_password && !rewardOpen && (
              <div className="mt-4">
                <label className="label">Enter password to unlock</label>
                <input
                  type="password"
                  value={passValue}
                  onChange={(e) => {
                    setPassValue(e.target.value);
                    setPassError("");
                  }}
                  placeholder="Password"
                  className="field"
                />
                {passError && <p className="mt-1.5 text-sm text-red-600">{passError}</p>}
              </div>
            )}
          </div>

          <p className="mt-6 text-center text-xs text-slate-400 dark:text-slate-500">
            Powered by <span className="font-semibold text-slate-500 dark:text-slate-300">UNLOCKFLOW</span>
          </p>
        </div>
      </div>
    </div>
  );
}
