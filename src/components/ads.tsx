"use client";
import { useEffect, useRef } from "react";
import type { Ad } from "@/lib/types";

function AdLabel() {
  return (
    <span className="unlock-ad-label rounded-full border border-slate-200 bg-white/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500 backdrop-blur dark:border-night-600 dark:bg-night-800/80 dark:text-slate-400">
      Ad
    </span>
  );
}

function isScript(ad: Ad) {
  return ad?.type === "script" && !!ad?.script;
}

function AdImage({ ad, className }: { ad: Ad; className?: string }) {
  if (ad.image_url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={ad.image_url} alt={ad.title || "Advertisement"} loading="lazy" className={className} />;
  }
  return (
    <div className={`flex items-center justify-center bg-gradient-to-br from-brand-500/15 to-purple-500/15 ${className}`}>
      <svg className="h-6 w-6 text-brand-400" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="7" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <path d="M7 11v2m14-3-3 2 3 2V10z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

/**
 * Injects raw ad-network HTML/JS (Adsterra, Monetag, PropellerAds, etc.).
 * `<script>` tags injected via innerHTML do NOT execute, so we re-create
 * them as real script elements and append them to the live DOM.
 */
function ScriptAd({ ad, className }: { ad: Ad; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !ad.script) return;
    el.innerHTML = "";

    const wrap = document.createElement("div");
    wrap.innerHTML = ad.script;

    // Re-create script elements (innerHTML alone never executes them).
    const scripts = Array.from(wrap.querySelectorAll("script")).map((old) => {
      const s = document.createElement("script");
      for (let i = 0; i < old.attributes.length; i++) {
        const attr = old.attributes[i];
        s.setAttribute(attr.name, attr.value);
      }
      s.text = old.text;
      return s;
    });

    // Append static HTML first, then the scripts — so ad snippets that
    // reference a container by id can find it once the script runs.
    Array.from(wrap.querySelectorAll("script")).forEach((s) => s.remove());
    while (wrap.firstChild) el.appendChild(wrap.firstChild);
    scripts.forEach((s) => el.appendChild(s));

    return () => {
      el.innerHTML = "";
    };
  }, [ad.script]);

  return <div ref={ref} className={className} />;
}

/** A clean, labeled frame used to host script ads so they look tidy on the page. */
function ScriptFrame({ ad, className }: { ad: Ad; className?: string }) {
  return (
    <div
      className={`unlock-script-frame relative overflow-hidden rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-3 py-3 dark:border-night-600 dark:bg-night-800/40 ${
        className || ""
      }`}
    >
      <span className="absolute right-2 top-2 z-10">
        <AdLabel />
      </span>
      <ScriptAd ad={ad} className="ad-host" />
    </div>
  );
}

/** Full-width banner ad shown below the unlock-page hero (image or script). */
export function BannerAd({ ad }: { ad: Ad }) {
  if (isScript(ad)) {
    return <ScriptFrame ad={ad} />;
  }

  const content = (
    <div className="unlock-banner-ad group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-glow dark:border-night-700 dark:bg-night-900">
      {ad.image_url ? (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ad.image_url}
            alt={ad.title || "Advertisement"}
            loading="lazy"
            className="max-h-44 w-full object-cover transition duration-300 group-hover:scale-[1.02]"
          />
          <span className="absolute right-3 top-3">
            <AdLabel />
          </span>
          {ad.title && (
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-night-950/80 to-transparent px-4 pb-3 pt-10">
              <span className="block truncate text-sm font-bold text-white">{ad.title}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-3 px-4 py-3">
          <AdImage ad={ad} className="h-9 w-9 shrink-0 rounded-lg" />
          <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-700 dark:text-slate-200">
            {ad.title || "Advertisement"}
          </span>
          <AdLabel />
        </div>
      )}
    </div>
  );

  return ad.link_url ? (
    <a href={ad.link_url} target="_blank" rel="noreferrer sponsored" className="block">
      {content}
    </a>
  ) : (
    content
  );
}

/** Compact ad rendered inside the task list (image or script). */
export function InlineAd({ ad }: { ad: Ad }) {
  if (isScript(ad)) {
    return <ScriptFrame ad={ad} />;
  }

  const content = (
    <div className="unlock-inline-ad group relative overflow-hidden rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 transition hover:border-brand-300 hover:bg-brand-50/40 dark:border-night-600 dark:bg-night-800/40 dark:hover:border-brand-500/40 dark:hover:bg-brand-500/5">
      <div className="flex items-center gap-3 px-3.5 py-3">
        <AdImage ad={ad} className="h-11 w-11 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-slate-700 dark:text-slate-200">
            {ad.title || "Sponsored"}
          </span>
          {ad.link_url && (
            <span className="block truncate text-xs text-brand-600 dark:text-brand-400">
              {ad.link_url.replace(/^https?:\/\//, "")} →
            </span>
          )}
        </div>
        <AdLabel />
      </div>
    </div>
  );

  return ad.link_url ? (
    <a href={ad.link_url} target="_blank" rel="noreferrer sponsored" className="block">
      {content}
    </a>
  ) : (
    content
  );
}

/** Compact "box" ad used for the task-center, above-unlock and FAQ slots. */
export function BoxAd({ ad }: { ad: Ad }) {
  if (isScript(ad)) {
    return <ScriptFrame ad={ad} />;
  }

  const content = (
    <div className="unlock-box-ad group relative overflow-hidden rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 transition hover:border-brand-300 hover:bg-brand-50/40 dark:border-night-600 dark:bg-night-800/40 dark:hover:border-brand-500/40 dark:hover:bg-brand-500/5">
      <div className="flex items-center gap-3 px-3.5 py-3">
        <AdImage ad={ad} className="h-11 w-11 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-slate-700 dark:text-slate-200">
            {ad.title || "Sponsored"}
          </span>
          {ad.link_url && (
            <span className="block truncate text-xs text-brand-600 dark:text-brand-400">
              {ad.link_url.replace(/^https?:\/\//, "")} →
            </span>
          )}
        </div>
        <AdLabel />
      </div>
    </div>
  );

  return ad.link_url ? (
    <a href={ad.link_url} target="_blank" rel="noreferrer sponsored" className="block">
      {content}
    </a>
  ) : (
    content
  );
}

/** Fixed bottom "social bar" ad with a close button (image or script). */
export function SocialAdBar({ ad, onClose }: { ad: Ad; onClose: () => void }) {
  return (
    <div className="unlock-social-ad fixed inset-x-0 bottom-0 z-40 p-3 sm:p-4">
      <div className="unlock-social-ad-inner group relative mx-auto max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white/95 shadow-[0_-8px_40px_-12px_rgba(16,24,40,0.25)] backdrop-blur dark:border-night-600 dark:bg-night-800/95 dark:shadow-[0_-8px_40px_-12px_rgba(0,0,0,0.6)]">
        {isScript(ad) ? (
          <div className="relative px-4 py-3 pr-12">
            <span className="absolute left-3 top-3 z-10">
              <AdLabel />
            </span>
            <ScriptAd ad={ad} className="ad-host" />
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <AdImage ad={ad} className="h-10 w-10 shrink-0 rounded-lg" />
            <div className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold text-slate-800 dark:text-white">
                {ad.title || "Sponsored"}
              </span>
              {ad.link_url && (
                <span className="block truncate text-xs text-brand-600 dark:text-brand-400">
                  {ad.link_url.replace(/^https?:\/\//, "")}
                </span>
              )}
            </div>
            {ad.link_url ? (
              <a
                href={ad.link_url}
                target="_blank"
                rel="noreferrer sponsored"
                className="hidden shrink-0 items-center gap-1 rounded-full bg-brand-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-brand-700 sm:flex"
              >
                Open <span aria-hidden>→</span>
              </a>
            ) : (
              <span className="hidden shrink-0 rounded-full bg-brand-600 px-3 py-1.5 text-xs font-bold text-white sm:flex">
                Open <span aria-hidden>→</span>
              </span>
            )}
            <span className="shrink-0">
              <AdLabel />
            </span>
          </div>
        )}
        <button
          onClick={onClose}
          aria-label="Close ad"
          className="absolute right-1.5 top-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-red-50 hover:text-red-500 dark:bg-night-700 dark:text-slate-300 dark:hover:bg-red-500/15 dark:hover:text-red-400"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
