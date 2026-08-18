"use client";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import QRCode from "qrcode";
import Background from "@/components/Background";
import { getTaskOption } from "@/lib/tasks";
import { BrandIcon } from "@/components/brandIcons";
import Link from "next/link";

function SuccessContent() {
  const sp = useSearchParams();
  const url = sp.get("url") || "";
  const slug = sp.get("slug") || "";
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const downloadQr = async () => {
    try {
      const canvas = document.createElement("canvas");
      await QRCode.toCanvas(canvas, url, { width: 512, margin: 2, color: { dark: "#1d4ff0", light: "#ffffff" } });
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = `unlockflow-${slug || "link"}.png`;
      a.click();
    } catch {}
  };

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-night-950">
      <Background />
      <div className="container-x relative z-10 flex min-h-screen items-center justify-center py-16">
        <div className="w-full max-w-lg">
          <div className="card overflow-hidden !rounded-3xl dark:border-night-700 dark:bg-night-900/80">
            <div className="relative bg-gradient-to-br from-brand-600 via-brand-700 to-purple-700 px-8 py-7 text-center">
              <div className="absolute inset-0 bg-grid opacity-20" />
              <div className="relative">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Link generated successfully
                </span>
                <h1 className="mt-3 font-display text-2xl font-extrabold text-white">Your unlock link is ready!</h1>
              </div>
            </div>

            <div className="p-8">
              <div className="flex flex-col items-center gap-5 sm:flex-row">
                <div className="flex flex-col items-center gap-2">
                  <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-night-700">
                    <QRCodeSVG value={url} size={140} bgColor="#ffffff" fgColor="#1d4ff0" level="M" />
                  </div>
                  <button onClick={downloadQr} className="btn-ghost !py-2 !text-xs">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    Download QR
                  </button>
                </div>
                <div className="min-w-0 flex-1">
                  <label className="label">Your unlock link</label>
                  <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-night-700 dark:bg-night-800">
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                      {url.replace(/^https?:\/\//, "").replace(/\/unlock\//, "/")}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button onClick={copy} className="btn-primary !py-2.5">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><rect x="9" y="9" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10" stroke="currentColor" strokeWidth="2"/></svg>
                      {copied ? "Copied!" : "Copy Link"}
                    </button>
                    <a href={url} target="_blank" rel="noreferrer" className="btn-ghost !py-2.5">Open</a>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-2 border-t border-slate-100 pt-5 dark:border-night-700">
                <Link href="/" className="btn-ghost w-full">Create another link</Link>
                <a href="/admin" className="btn-ghost w-full">Go to Admin Dashboard</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
