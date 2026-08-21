"use client";
import { useEffect, useRef, useState } from "react";
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

/** Quiet host for network scripts — no dashed empty placeholder box. */
function NativeHost({ ad }: { ad: Ad }) {
  return (
    <div className="unlock-native-host">
      <span className="unlock-native-label">
        <AdLabel />
      </span>
      <ScriptAd ad={ad} className="ad-host" />
    </div>
  );
}

/** Native / In-Page Push shown below the unlock-page hero. */
export function BannerAd({ ad }: { ad: Ad }) {
  if (isScript(ad)) {
    return <NativeHost ad={ad} />;
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

/** Interstitial shown only after the visitor taps Unlock Reward. */
export function InterstitialAd({ ad, onContinue }: { ad: Ad; onContinue: () => void }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 2500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="unlock-interstitial" role="dialog" aria-modal="true" aria-label="Advertisement">
      <div className="unlock-interstitial-card">
        <span className="unlock-interstitial-label">
          <AdLabel />
        </span>
        {isScript(ad) ? (
          <ScriptAd ad={ad} className="ad-host" />
        ) : ad.link_url ? (
          <a href={ad.link_url} target="_blank" rel="noreferrer sponsored" className="block">
            <AdImage ad={ad} className="mx-auto max-h-64 w-full rounded-xl object-contain" />
            {ad.title && <span className="mt-2 block text-center text-sm font-semibold">{ad.title}</span>}
          </a>
        ) : (
          <div className="text-center">
            <AdImage ad={ad} className="mx-auto h-16 w-16 rounded-xl" />
            {ad.title && <span className="mt-2 block text-sm font-semibold">{ad.title}</span>}
          </div>
        )}
        <button type="button" className="unlock-interstitial-continue" onClick={onContinue} disabled={!ready}>
          {ready ? "Continue to reward" : "Please wait…"}
        </button>
      </div>
    </div>
  );
}


