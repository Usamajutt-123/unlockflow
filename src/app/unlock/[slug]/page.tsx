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
import { BannerAd, InlineAd, InterstitialAd, SocialAdBar } from "@/components/ads";
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

function UnlockflowWordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="unlock-wordmark">
      <span className="unlock-wordmark-mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <rect x="5" y="10" width="14" height="11" rx="2.5" stroke="currentColor" strokeWidth="2" />
          <path d="M8.5 10V7.5a3.5 3.5 0 0 1 7 0V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M12 14v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </span>
      {!compact && (
        <span className="unlock-wordmark-text">
          UNLOCK<span>FLOW</span>
        </span>
      )}
    </span>
  );
}

function LinkGlyph({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M13.2 4.4a3.35 3.35 0 0 1 4.75 0l1.65 1.65a3.35 3.35 0 0 1 0 4.75l-3.3 3.3a3.35 3.35 0 0 1-4.75 0M10.8 19.6a3.35 3.35 0 0 1-4.75 0L4.4 17.95a3.35 3.35 0 0 1 0-4.75l3.3-3.3a3.35 3.35 0 0 1 4.75 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="m9 15 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function LockGlyph({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="10" width="16" height="11" rx="2.5" stroke="currentColor" strokeWidth="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

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
    banner: Ad[];
    task: Ad[];
    interstitial: Ad[];
    social: Ad[];
  }>({ banner: [], task: [], interstitial: [], social: [] });
  const [bottomBarClosed, setBottomBarClosed] = useState(false);
  const [interstitialOpen, setInterstitialOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(0);

  const storageKey = `uf_done_${slug}`;

  // Four placements on the existing ads table: native below header, native in
  // the task list, interstitial on unlock (slot: above_unlock), sticky bottom.
  useEffect(() => {
    fetch("/api/ads")
      .then((r) => r.json())
      .then((d) => {
        const all: Ad[] = d.ads || [];
        setAds({
          banner: all.filter((a) => a.slot === "banner"),
          task: all.filter((a) => a.slot === "task"),
          interstitial: all.filter((a) => a.slot === "above_unlock"),
          social: all.filter((a) => a.slot === "social"),
        });
      })
      .catch(() => {});
  }, []);

  // Analytics tracking: tries the compact record_event RPC first, then falls
  // back to the legacy direct counter update when the RPC is unavailable.
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

      trackEvent("view", data.id, data.views || 0);

      const ordered = [...(data.tasks || [])].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
      setLink(data);
      setTasks(ordered);

      try {
        const done = JSON.parse(localStorage.getItem(storageKey) || "[]") as number[];
        setCompleted(new Set(done));
        if (done.length >= ordered.length && ordered.length > 0) setRewardOpen(true);
      } catch {}

      setLoading(false);
    };
    load();
  }, [slug, storageKey]);

  const allDone = tasks.length > 0 && completed.size >= tasks.length;

  const doTask = (idx: number) => {
    const t = tasks[idx];
    if (!t || processing || completed.has(idx)) return;

    setProcessing({ idx, phase: "open" });
    setTimeout(() => {
      window.open(t.task_url, "_blank", "noopener");
      trackEvent("click", link?.id, link?.clicks || 0);

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

  useEffect(() => {
    if (!allDone || !link?.id || !isSupabaseConfigured) return;
    trackEvent("complete", link.id, link?.completions || 0);
  }, [allDone, link?.id, slug]);

  const revealReward = () => {
    setInterstitialOpen(false);
    setRewardOpen(true);
    try {
      localStorage.setItem(storageKey, JSON.stringify([...completed]));
    } catch {}
  };

  const openReward = async () => {
    if (link?.has_password && link.password_hash) {
      const ok = await verifyPassword(passValue, link.password_hash);
      if (!ok) {
        setPassError("Incorrect password. Please try again.");
        return;
      }
      setPassError("");
    }
    if (ads.interstitial.length > 0 && !rewardOpen) {
      setInterstitialOpen(true);
      return;
    }
    revealReward();
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
          <LinkGlyph className="h-8 w-8 text-slate-500 dark:text-slate-400" />
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
          This unlock link doesn&apos;t exist or isn&apos;t published yet.
        </p>
        <a href="/" className="btn-primary mt-6">Go to UNLOCKFLOW</a>
      </div>
    );
  }

  const completedCount = Math.min(completed.size, tasks.length);
  const progress = tasks.length ? Math.min(100, Math.round((completedCount / tasks.length) * 100)) : 0;
  const remaining = Math.max(0, tasks.length - completedCount);
  const th = getTheme(link.theme || "midnight");
  const video = parseVideoUrl(link.video_url || "");
  const coverImage = video?.thumbnail || link.banner_url || "";

  const inlineTaskIdx = Math.min(1, tasks.length - 1);

  return (
    <div
      className={`unlock-shell ${ads.social.length > 0 && !bottomBarClosed ? "unlock-shell-with-social" : ""}`}
      data-unlock-theme={th.id}
    >
      <Head>
        <title>{link.title} | UNLOCKFLOW</title>
        <meta name="description" content={link.description || "Complete the tasks to unlock your reward."} />
        <meta property="og:title" content={link.title} />
        <meta property="og:description" content={link.description || "Complete the tasks to unlock your reward."} />
        {coverImage && <meta property="og:image" content={coverImage} />}
        {!coverImage && link.icon_url && <meta property="og:image" content={link.icon_url} />}
      </Head>

      <div className="unlock-backdrop" aria-hidden="true">
        <span className="unlock-backdrop-orb unlock-backdrop-orb-one" />
        <span className="unlock-backdrop-orb unlock-backdrop-orb-two" />
        <span className="unlock-backdrop-grid" />
      </div>

      <main id="main" className="unlock-page-wrap">
        <section className="unlock-frame" aria-label={`${link.title} unlock page`}>
          <header className="unlock-nav">
            <a href="/" className="unlock-brand-link" aria-label="UNLOCKFLOW home">
              <UnlockflowWordmark />
            </a>

            <div className="unlock-nav-actions">
              <a href="/help" className="unlock-help-link">
                <span>Need help?</span>
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M9.8 9a2.3 2.3 0 1 1 3.35 2.05c-.75.42-1.15.85-1.15 1.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M12 16.5v.01" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                </svg>
              </a>
              <span className="unlock-theme-toggle" title="Switch site light/dark mode">
                <ThemeToggle />
              </span>
              <a href="/#unlock-tasks" className="unlock-create-link">
                <span className="unlock-create-label">Create your own</span>
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </a>
            </div>
          </header>

          <div className={`unlock-summary ${coverImage ? "" : "unlock-summary-no-image"}`}>
            <div className="unlock-reward-icon">
              {link.icon_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={link.icon_url} alt={`${link.title} icon`} />
              ) : (
                <LinkGlyph className="h-10 w-10" />
              )}
            </div>

            <div className="unlock-cover">
              {coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={coverImage} alt={video ? "Video preview" : `${link.title} cover`} />
              ) : (
                <div className="unlock-cover-placeholder">
                  <span className="unlock-cover-spark" />
                  <LockGlyph className="h-9 w-9" />
                  <span>Protected reward</span>
                </div>
              )}
              {video && (
                <span className="unlock-video-badge" aria-label="Video preview">
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m9 7 8 5-8 5V7Z" /></svg>
                </span>
              )}
            </div>

            <div className="unlock-summary-copy">
              <p className="unlock-eyebrow">Exclusive reward</p>
              <h1>{link.title}</h1>
              <p className="unlock-description">{link.description || "Complete the tasks below to access your reward."}</p>

              <div className="unlock-progress-block" aria-label={`${completedCount} of ${tasks.length} tasks completed`}>
                <div className="unlock-progress-copy">
                  <span><strong>{completedCount} / {tasks.length}</strong> Tasks Completed</span>
                  <strong>{progress}%</strong>
                </div>
                <div className="unlock-progress-track">
                  <span style={{ width: `${progress}%` }}>
                    <i />
                  </span>
                </div>
              </div>
            </div>
          </div>

          {ads.banner.length > 0 && (
            <div className="unlock-ad-slot unlock-banner-slot" aria-label="Advertisement">
              <BannerAd ad={ads.banner[0]} />
            </div>
          )}

          <section className="unlock-tasks-section" aria-labelledby="unlock-tasks-title">
            <div className="unlock-section-heading">
              <span className="unlock-section-dot" aria-hidden="true" />
              <div>
                <h2 id="unlock-tasks-title">Complete the tasks below</h2>
                <p>Finish every step to activate your reward</p>
              </div>
              <span className="unlock-task-count">{completedCount}/{tasks.length}</span>
            </div>

            <ul className="unlock-task-list">
              {tasks.map((t, i) => {
                const opt = getTaskOption(t.task_type);
                const done = completed.has(i);
                const isProcessing = processing?.idx === i;
                const isOpen = isProcessing && processing.phase === "open";
                const isConfirm = isProcessing && processing.phase === "confirm";

                return (
                  <Fragment key={t.id || `${t.task_type}-${i}`}>
                    <li className={`unlock-task-step ${done ? "is-done" : ""} ${isProcessing ? "is-processing" : ""}`}>
                      <span className="unlock-timeline-dot" aria-hidden="true">{i + 1}</span>
                      <button onClick={() => doTask(i)} disabled={done || !!processing}>
                        <span
                          className="unlock-task-icon"
                          style={{ "--task-color": opt?.brandColor || "#1d4ff0" } as React.CSSProperties}
                        >
                          {isProcessing ? (
                            <svg className="unlock-spinner" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
                              <path d="M21 12a9 9 0 0 1-9 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                            </svg>
                          ) : (
                            <BrandIcon brand={opt?.brand || "custom"} className="h-5 w-5" />
                          )}
                        </span>

                        <span className="unlock-task-copy">
                          <strong>{t.label}</strong>
                          <small>
                            {done
                              ? "Task completed successfully"
                              : isOpen
                              ? "Opening task link…"
                              : isConfirm
                              ? "Confirming completion…"
                              : opt?.label
                              ? `${opt.label} to continue`
                              : "Open and complete this task"}
                          </small>
                        </span>

                        <span className="unlock-task-action">
                          {done ? (
                            <>
                              Completed
                              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 12 4 4 8-9" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </>
                          ) : isProcessing ? (
                            <>{isOpen ? "Opening…" : "Checking…"}</>
                          ) : (
                            <>
                              Open
                              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 17 17 7m-7 0h7v7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </>
                          )}
                        </span>
                      </button>
                    </li>

                    {ads.task.length > 0 && i === inlineTaskIdx && (
                      <li className="unlock-list-ad">
                        <InlineAd ad={ads.task[0]} />
                      </li>
                    )}
                  </Fragment>
                );
              })}
            </ul>
          </section>

          <section className="unlock-reward-section" aria-label="Unlock reward">
            {link.has_password && !rewardOpen && (
              <div className="unlock-password-field">
                <label htmlFor="unlock-password">Enter password to unlock</label>
                <div>
                  <LockGlyph className="h-4 w-4" />
                  <input
                    id="unlock-password"
                    type="password"
                    value={passValue}
                    onChange={(e) => {
                      setPassValue(e.target.value);
                      setPassError("");
                    }}
                    placeholder="Password"
                  />
                </div>
                {passError && (
                  <span role="alert" className="uf-unlock-alert">
                    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                      <path d="M9.2 9.2l5.6 5.6M14.8 9.2l-5.6 5.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    {passError}
                  </span>
                )}
              </div>
            )}

            {!rewardOpen ? (
              <button onClick={openReward} disabled={!allDone} className="unlock-main-button">
                <LockGlyph className="h-5 w-5" />
                <span>{allDone ? "Unlock Reward" : `Complete ${remaining} more ${remaining === 1 ? "task" : "tasks"} to unlock`}</span>
                <svg className="unlock-button-arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M5 12h14m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            ) : (
              <div className="unlock-reward-open">
                <span className="unlock-success-badge">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 12 4 4 8-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  Reward Unlocked!
                </span>
                <h2>Congratulations, your reward is ready.</h2>
                <a href={link.destination_url} target="_blank" rel="noreferrer" className="unlock-open-reward-link">
                  Open Reward
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M10 6H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </a>
                <button onClick={copyDest} className="unlock-copy-link">
                  {copied ? "Reward link copied!" : "Copy reward link"}
                </button>
              </div>
            )}
          </section>

          <section className="unlock-how" aria-labelledby="unlock-how-title">
            <div className="unlock-how-heading">
              <span>
                <LinkGlyph className="h-4 w-4" />
              </span>
              <div>
                <h2 id="unlock-how-title">How to unlock</h2>
                <p>Three quick steps to reach your reward</p>
              </div>
            </div>
            <ol>
              {[
                { n: 1, t: "Tap a task", d: "Open each task above" },
                { n: 2, t: "Complete it", d: "Finish it in the new tab" },
                { n: 3, t: "Get your reward", d: "Return and unlock" },
              ].map((step) => (
                <li key={step.n}>
                  <span>{step.n}</span>
                  <div><strong>{step.t}</strong><small>{step.d}</small></div>
                </li>
              ))}
            </ol>
          </section>

          <section className="unlock-faq" aria-labelledby="unlock-faq-title">
            <div className="unlock-faq-heading">
              <div>
                <p>Help center</p>
                <h2 id="unlock-faq-title">FAQ</h2>
              </div>
              <span>?</span>
            </div>

            <div className="unlock-faq-list">
              {UNLOCK_FAQS.map((faq, i) => (
                <div key={faq.q} className={`unlock-faq-item ${faqOpen === i ? "is-open" : ""}`}>
                  <button
                    onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                    aria-expanded={faqOpen === i}
                    aria-controls={`unlock-faq-answer-${i}`}
                  >
                    <span>{faq.q}</span>
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m7 9 5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </button>
                  {faqOpen === i && (
                    <div id={`unlock-faq-answer-${i}`} className="unlock-faq-answer">{faq.a}</div>
                  )}
                </div>
              ))}
            </div>
          </section>

          <div className="unlock-powered-by">
            <span>Powered by</span>
            <a href="/#unlock-tasks" aria-label="Create a link with UNLOCKFLOW">
              <Logo className="h-4 w-4" showText={false} />
              <strong>UNLOCKFLOW</strong>
            </a>
          </div>

          <footer className="unlock-footer">
            <span>© {new Date().getFullYear()} UNLOCKFLOW. All rights reserved.</span>
            <nav aria-label="Legal links">
              <a href="/privacy">Privacy</a>
              <a href="/terms">Terms</a>
              <a href="/contact">Contact</a>
            </nav>
          </footer>
        </section>
      </main>

      {ads.social.length > 0 && !bottomBarClosed && (
        <SocialAdBar ad={ads.social[0]} onClose={() => setBottomBarClosed(true)} />
      )}

      {interstitialOpen && ads.interstitial[0] && (
        <InterstitialAd ad={ads.interstitial[0]} onContinue={revealReward} />
      )}
    </div>
  );
}
