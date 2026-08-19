"use client";
import { Fragment, useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { getTaskOption, verifyPassword } from "@/lib/tasks";
import type { UnlockLink, Task, Ad } from "@/lib/types";
import { BrandIcon } from "@/components/brandIcons";
import ThemeToggle from "@/components/ThemeToggle";
import Background from "@/components/Background";
import Logo from "@/components/Logo";
import { getTheme } from "@/lib/themes";
import { parseVideoUrl } from "@/lib/thumbnail";
import { BannerAd, InlineAd, BoxAd, SocialAdBar } from "@/components/ads";
import Head from "next/head";

const UNLOCK_FAQS = [
  {
    q: "How do I unlock this content?",
    a: "Tap each task above, finish it in the tab that opens, then come back here and press the Unlock Reward button. The tasks mark themselves as done automatically.",
  },
  {
    q: "Is this safe?",
    a: "Yes. The tasks only open the links the creator added — UNLOCKFLOW never asks for your passwords or personal login details.",
  },
  {
    q: "A task still shows as not done. What should I do?",
    a: "Complete the action in the new tab (subscribe, follow, join, etc.), then return to this page. Tap the task again if needed — it will confirm and move to done.",
  },
  {
    q: "What happens after I complete all tasks?",
    a: "The Unlock Reward button lights up and reveals the reward link the creator prepared for you.",
  },
];

export default function UnlockPage({ params }: { params: { slug: string } }) {
  const slug = params.slug;
  const [link, setLink] = useState<UnlockLink | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [expired, setExpired] = useState(false);
  const [inactive, setInactive] = useState(false);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [rewardOpen, setRewardOpen] = useState(false);
  const [passValue, setPassValue] = useState("");
  const [passError, setPassError] = useState("");
  const [copied, setCopied] = useState(false);
  const [processing, setProcessing] = useState<{ idx: number; phase: "open" | "confirm" } | null>(null);
  const [ads, setAds] = useState<{
    banner: Ad[]; task: Ad[]; task_center: Ad[]; above_unlock: Ad[]; faq: Ad[]; social: Ad[];
  }>({ banner: [], task: [], task_center: [], above_unlock: [], faq: [], social: [] });
  const [bottomBarClosed, setBottomBarClosed] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(0);

  const storageKey = `uf_done_${slug}`;

  // Load ads for the unlock page (banner / in-task / task-center / above-unlock / faq / social).
  useEffect(() => {
    fetch("/api/ads")
      .then((r) => r.json())
      .then((d) => {
        const all: Ad[] = d.ads || [];
        setAds({
          banner: all.filter((a) => a.slot === "banner"),
          task: all.filter((a) => a.slot === "task"),
          task_center: all.filter((a) => a.slot === "task_center"),
          above_unlock: all.filter((a) => a.slot === "above_unlock"),
          faq: all.filter((a) => a.slot === "faq"),
          social: all.filter((a) => a.slot === "social"),
        });
      })
      .catch(() => {});
  }, []);

  // Analytics tracking: tries the record_event RPC (migration 0003), and if that
  // fails (e.g. RPC not created yet), falls back to a direct counter update on
  // links (migration 0001 allows anon updates). Errors are logged — not swallowed.
  const trackEvent = async (
    event: "view" | "click" | "complete",
    linkId?: string,
    currentValue = 0
  ) => {
    if (!isSupabaseConfigured || !linkId) return;
    try {
      const { error } = await supabase.rpc("record_event", { p_slug: slug, p_event: event });
      if (error) {
        console.warn(`[unlockflow] record_event RPC failed (${event}):`, error.message);
        // Fallback: bump the counter directly on the links row.
        const col = event === "view" ? "views" : event === "click" ? "clicks" : "completions";
        const res = await supabase
          .from("links")
          .update({ [col]: (Number(currentValue) || 0) + 1 })
          .eq("id", linkId);
        if (res.error) console.warn(`[unlockflow] fallback counter update failed (${col}):`, res.error.message);
      }
    } catch (err) {
      console.warn(`[unlockflow] analytics tracking failed (${event}):`, err);
    }
  };

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

      // expiry check — show a dedicated "expired" page instead of "not found"
      if (data.expiry_date && new Date(data.expiry_date).getTime() < Date.now()) {
        setExpired(true);
        setLoading(false);
        return;
      }
      if (data.active === false) {
        setInactive(true);
        setLoading(false);
        return;
      }

      // track a view (best effort, with fallback + logging)
      trackEvent("view", data.id, data.views || 0);

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
      // track a click (best effort, with fallback + logging)
      trackEvent("click", link?.id, link?.clicks || 0);

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
    trackEvent("complete", link.id, link?.completions || 0);
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
      <div className="relative flex min-h-screen items-center justify-center">
        <Background />
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600 dark:border-night-700 dark:border-t-brand-400" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading unlock page…</p>
        </div>
      </div>
    );
  }

  if (expired) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <Background />
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50">
          <svg className="h-8 w-8 text-amber-500" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
            <path d="M12 7v5m0 3v.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M5 5l14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
          </svg>
        </div>
        <h1 className="mt-5 font-display text-2xl font-extrabold text-ink dark:text-white">Link has expired</h1>
        <p className="mt-2 max-w-sm text-slate-500 dark:text-slate-400">
          Sorry — this unlock link is no longer available. The creator set an expiry date and it has passed.
        </p>
        <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">If you were expecting this link to work, please contact the creator.</p>
        <a href="/" className="btn-primary mt-6">Go to UNLOCKFLOW</a>
      </div>
    );
  }

  if (inactive) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <Background />
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-night-800">
          <svg className="h-8 w-8 text-slate-500 dark:text-slate-400" viewBox="0 0 24 24" fill="none">
            <path d="M13.19 4.39a3.36 3.36 0 0 1 4.75 0l1.67 1.67a3.36 3.36 0 0 1 0 4.75l-3.3 3.3a3.36 3.36 0 0 1-4.75 0M10.81 19.61a3.36 3.36 0 0 1-4.75 0l-1.67-1.67a3.36 3.36 0 0 1 0-4.75l3.3-3.3a3.36 3.36 0 0 1 4.75 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <h1 className="mt-5 font-display text-2xl font-extrabold text-ink dark:text-white">Link unavailable</h1>
        <p className="mt-2 max-w-sm text-slate-500 dark:text-slate-400">
          This unlock link has been turned off by its creator and is no longer accepting visitors.
        </p>
        <a href="/" className="btn-primary mt-6">Go to UNLOCKFLOW</a>
      </div>
    );
  }

  if (notFound || !link) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <Background />
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
          <svg className="h-8 w-8 text-red-500" viewBox="0 0 24 24" fill="none">
            <path d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="mt-5 font-display text-2xl font-extrabold text-ink dark:text-white">Link not found</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          This unlock link doesn't exist or isn't published yet.
        </p>
        <a href="/" className="btn-primary mt-6">Go to UNLOCKFLOW</a>
      </div>
    );
  }

  const progress = tasks.length ? Math.round((completed.size / tasks.length) * 100) : 0;
  const th = getTheme(link.theme || "midnight");

  // Placement math for the two in-list ads:
  //  - "task" (inline) stays after the 2nd task (or the last task for short lists)
  //  - "task_center" sits in the middle of the list
  const inlineTaskIdx = Math.min(1, tasks.length - 1);
  let taskCenterIdx = Math.round(tasks.length / 2) - 1;
  if (tasks.length < 2) taskCenterIdx = -1;
  if (ads.task.length > 0 && taskCenterIdx === inlineTaskIdx) taskCenterIdx += 1;

  return (
    <div className="relative min-h-screen">
      <Head>
        <title>{link.title} | UNLOCKFLOW</title>
        <meta name="description" content={link.description || "Complete the tasks to unlock your reward."} />
        <meta property="og:title" content={link.title} />
        <meta property="og:description" content={link.description || "Complete the tasks to unlock your reward."} />
        {link.icon_url && <meta property="og:image" content={link.icon_url} />}
        {link.video_url && parseVideoUrl(link.video_url) && <meta property="og:image" content={parseVideoUrl(link.video_url)!.thumbnail} />}
      </Head>
      <Background />
      {/* brand bar — theme switch lives here in the header */}
      <div className="relative z-10">
        <div className="container-x flex items-center justify-between py-4">
          <a href="/" className="flex items-center gap-2" aria-label="UNLOCKFLOW home">
            <Logo className="h-8 w-8" textClassName="text-base" />
          </a>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <a href="/#generator" className="btn-ghost !py-2 !text-xs">Create your own</a>
          </div>
        </div>
      </div>

      {/* hero header — home-style animated background */}
      <div className={`relative flex min-h-[42vh] items-end overflow-hidden bg-gradient-to-br ${th.header} pb-16 pt-24`}>
        {/* animated accents (same look as the home hero) */}
        <div className="absolute inset-0 bg-grid opacity-25 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]" />
        <div className="absolute -top-24 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-brand-400/25 blur-3xl dark:bg-brand-600/20" />
        <div className="absolute right-[6%] top-1/3 h-56 w-56 rounded-full bg-purple-400/20 blur-3xl dark:bg-purple-600/15" />
        <div className="absolute inset-0 bg-gradient-to-t from-night-950/60 via-night-950/15 to-night-950/10" />

        {/* floating accents */}
        <div className="pointer-events-none absolute left-[6%] top-24 hidden h-12 w-12 animate-float rounded-2xl border border-white/30 bg-white/10 backdrop-blur lg:block">
          <span className="flex h-full w-full items-center justify-center text-lg">🔒</span>
        </div>
        <div className="pointer-events-none absolute right-[8%] top-16 hidden h-12 w-12 animate-float rounded-2xl border border-white/30 bg-white/10 backdrop-blur [animation-delay:1.2s] lg:block">
          <span className="flex h-full w-full items-center justify-center text-lg">⚡</span>
        </div>

        <div className="container-x relative w-full">
          <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
            <span className="chip border-white/25 bg-white/10 text-white shadow-sm backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              Reward in {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
            </span>

            {parseVideoUrl(link.video_url || "") && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={parseVideoUrl(link.video_url || "")!.thumbnail}
                alt=""
                className="mb-4 h-40 w-64 rounded-2xl object-cover shadow-lg ring-4 ring-white/30"
              />
            )}
            <div className="relative mt-4">
              <div className="absolute -inset-3 -z-10 rounded-3xl bg-white/20 blur-xl" />
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
            </div>
            <h1 className="mt-4 font-display text-3xl font-extrabold text-white drop-shadow sm:text-4xl">{link.title}</h1>
            {link.description && <p className="mt-3 max-w-xl text-white/90">{link.description}</p>}
          </div>
        </div>
      </div>

      {/* content */}
      <div className={`container-x -mt-12 ${ads.social.length > 0 && !bottomBarClosed ? "pb-36" : "pb-20"}`}>
        {/* banner ad — below the hero, above the task card */}
        {ads.banner.length > 0 && (
          <div className="mx-auto mb-4 max-w-2xl">
            <BannerAd ad={ads.banner[0]} />
          </div>
        )}

        <div className="card relative mx-auto max-w-2xl overflow-hidden !rounded-3xl p-6 sm:p-8 dark:border-night-700 dark:bg-night-900/80 dark:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]">
          {/* shine sweep (home-hero style) */}
          <div className="pointer-events-none absolute inset-0 -translate-x-full overflow-hidden bg-gradient-to-r from-transparent via-white/5 to-transparent">
            <div className="h-full w-full animate-shimmer" />
          </div>

          {/* progress */}
          <div className="mb-6 overflow-hidden rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-5 dark:border-night-700 dark:from-night-800/60 dark:to-night-800/30">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <span className="block text-base font-bold text-slate-800 dark:text-slate-100">Complete all tasks to unlock</span>
                <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">
                  Tap each task below, finish it in the new tab, then claim your reward
                </span>
              </div>
              <span className="shrink-0 rounded-full bg-brand-50 px-3 py-1.5 text-sm font-bold text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
                {completed.size}/{tasks.length}
              </span>
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
                <Fragment key={i}>
                <li>
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
                        <BrandIcon brand={opt?.brand || "custom"} className="h-5 w-5" />
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
                {/* in-task ad — placed after the 2nd task (or at the end for short lists) */}
                {ads.task.length > 0 && i === inlineTaskIdx && (
                  <li>
                    <InlineAd ad={ads.task[0]} />
                  </li>
                )}
                {/* task-center ad — placed in the middle of the task list */}
                {ads.task_center.length > 0 && i === taskCenterIdx && (
                  <li>
                    <BoxAd ad={ads.task_center[0]} />
                  </li>
                )}
                </Fragment>
              );
            })}
          </ul>

          {/* above-unlock ad — right above the unlock button */}
          {ads.above_unlock.length > 0 && (
            <div className="mt-5">
              <BoxAd ad={ads.above_unlock[0]} />
            </div>
          )}

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

          {/* powered-by — UNLOCKFLOW is a real button that opens the link generator */}
          <div className="mt-6 flex items-center justify-center gap-1.5">
            <span className="text-xs text-slate-400 dark:text-slate-500">Powered by</span>
            <a
              href="/#generator"
              className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-brand-600 to-purple-600 px-3 py-1.5 text-xs font-bold text-white shadow-glow transition hover:from-brand-700 hover:to-purple-700 active:scale-[0.97]"
            >
              <Logo className="h-4 w-4" showText={false} />
              UNLOCK<span className="opacity-90">FLOW</span>
            </a>
          </div>
        </div>

        {/* How to unlock guide — below the tasks */}
        <div className="card mx-auto mb-4 mt-4 max-w-2xl overflow-hidden !rounded-2xl dark:border-night-700 dark:bg-night-900/80">
          <div className={`bg-gradient-to-r ${th.progressBar} px-5 py-3`}>
            <h3 className="flex items-center gap-2 text-sm font-bold text-white">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M13.19 4.39a3.36 3.36 0 0 1 4.75 0l1.67 1.67a3.36 3.36 0 0 1 0 4.75l-3.3 3.3a3.36 3.36 0 0 1-4.75 0M10.81 19.61a3.36 3.36 0 0 1-4.75 0l-1.67-1.67a3.36 3.36 0 0 1 0-4.75l3.3-3.3a3.36 3.36 0 0 1 4.75 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              How to unlock
            </h3>
          </div>
          <ol className="grid gap-2 p-4 text-sm text-slate-600 sm:grid-cols-3 dark:text-slate-300">
            {[
              { n: 1, t: "Tap a task" },
              { n: 2, t: "Complete it in the new tab" },
              { n: 3, t: "Unlock your reward" },
            ].map((s) => (
              <li key={s.n} className="flex items-start gap-2.5 rounded-xl bg-slate-50/70 px-3 py-2.5 dark:bg-night-800/50">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-[11px] font-bold text-white dark:bg-brand-500">
                  {s.n}
                </span>
                <span className="pt-0.5 text-xs font-medium">{s.t}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* FAQ — below the task section, with its own ad placement */}
        <div className="card mx-auto max-w-2xl overflow-hidden !rounded-2xl dark:border-night-700 dark:bg-night-900/80">
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <h3 className="font-display text-base font-bold text-slate-800 dark:text-slate-100">Frequently asked questions</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Quick answers about unlocking this content</p>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 font-display text-base font-bold text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
              ?
            </span>
          </div>
          <div className="space-y-2 px-4 pb-4">
            {UNLOCK_FAQS.map((f, i) => (
              <div key={i}>
                <button
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="flex w-full items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3 text-left transition hover:border-brand-200 dark:border-night-700 dark:bg-night-800/40 dark:hover:border-brand-500/40"
                >
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{f.q}</span>
                  <svg
                    className={`h-4 w-4 shrink-0 text-brand-600 transition dark:text-brand-400 ${faqOpen === i ? "rotate-180" : ""}`}
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {faqOpen === i && (
                  <div className="px-4 pb-1 pt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{f.a}</div>
                )}
                {/* FAQ ad placement — inside the FAQ section */}
                {i === 0 && ads.faq.length > 0 && (
                  <div className="pt-2">
                    <BoxAd ad={ads.faq[0]} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* fixed bottom social bar ad */}
      {ads.social.length > 0 && !bottomBarClosed && (
        <SocialAdBar ad={ads.social[0]} onClose={() => setBottomBarClosed(true)} />
      )}
    </div>
  );
}
