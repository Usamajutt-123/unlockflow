"use client";
import { useState } from "react";

const faqs = [
  {
    q: "Do visitors need an account to use my unlock link?",
    a: "No. UNLOCKFLOW is a fully public, login-free experience. Anyone with the link can open it, complete the tasks, and unlock the reward instantly.",
  },
  {
    q: "How do I create an unlock link?",
    a: "Use the Link Generator above — add one or more tasks (subscribe, follow, like, join, etc.), paste your destination reward link, and click Generate. A shareable link and QR code are created instantly.",
  },
  {
    q: "Can I protect my unlock link with a password?",
    a: "Yes. In the Advanced options you can set a password. Visitors will be asked to enter it before the reward opens after completing all tasks.",
  },
  {
    q: "What platforms are supported for tasks?",
    a: "YouTube, Instagram, Facebook, Telegram, WhatsApp, TikTok, Discord, Twitter, and custom links. You can combine any of these on a single unlock link.",
  },
  {
    q: "What are the advanced options?",
    a: "They are fully optional: page title, description, banner image, icon image, an access password, an expiry date, and a custom short slug for your link.",
  },
];

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="py-20 sm:py-24">
      <div className="container-x max-w-3xl">
        <div className="text-center">
          <span className="text-sm font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">FAQ</span>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink dark:text-white sm:text-4xl">
            Frequently asked questions
          </h2>
        </div>

        <div className="mt-10 space-y-3">
          {faqs.map((f, i) => (
            <div key={i} className="card overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span className="font-semibold text-slate-800 dark:text-slate-100">{f.q}</span>
                <svg
                  className={`h-5 w-5 shrink-0 text-brand-600 transition dark:text-brand-400 ${open === i ? "rotate-180" : ""}`}
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {open === i && (
                <div className="border-t border-slate-100 px-5 py-4 text-sm leading-relaxed text-slate-600 dark:border-night-700 dark:text-slate-400">{f.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
