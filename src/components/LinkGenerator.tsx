"use client";
import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { TASK_OPTIONS, getTaskOption, randomSlug, hashPassword, slugify } from "@/lib/tasks";
import type { Task, GeneratedResult } from "@/lib/types";
import { BrandIcon } from "./brandIcons";
import { Alert } from "./Alerts";
import { THEMES } from "@/lib/themes";
import { parseVideoUrl } from "@/lib/thumbnail";

const UnlockPreview = dynamic(() => import("./UnlockPreview"));
const GeneratedQr = dynamic(() => import("./GeneratedQr"), {
  ssr: false,
  loading: () => <div className="h-[150px] w-[150px] animate-pulse rounded-lg bg-slate-100 dark:bg-slate-200" />,
});

interface SelectedTask extends Task {}

export default function LinkGenerator() {
  const [activeInputs, setActiveInputs] = useState<{ id: string; url: string; name: string }[]>([]);
  const [tasks, setTasks] = useState<SelectedTask[]>([]);

  const [destinationUrl, setDestinationUrl] = useState("");

  const [showAdvance, setShowAdvance] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [iconUrl, setIconUrl] = useState("");
  const [title, setTitle] = useState("Your reward is ready");
  const [description, setDescription] = useState("");
  const [password, setPassword] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [theme, setTheme] = useState("midnight");
  const [videoUrl, setVideoUrl] = useState("");

  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [copied, setCopied] = useState(false);

  const baseUrl = useMemo(() => {
    if (typeof window !== "undefined") return window.location.origin;
    return "https://unlockflow.vercel.app";
  }, []);

  // open a NEW input row for the clicked task (existing inputs stay open)
  const openTaskInput = (id: string) => {
    setActiveInputs((prev) =>
      prev.some((x) => x.id === id) ? prev : [...prev, { id, url: "", name: "" }]
    );
    setError("");
  };

  const closeTaskInput = (id: string) => {
    setActiveInputs((prev) => prev.filter((x) => x.id !== id));
    setTasks((prev) => prev.filter((t) => t.task_type !== id));
  };

  const updateInput = (id: string, patch: Partial<{ url: string; name: string }>) => {
    setActiveInputs((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  };

  // add a task from a specific input row; keeps the row open for more links
  const addTaskFor = (id: string, url: string, name: string) => {
    if (!url.trim()) return;
    const opt = getTaskOption(id)!;
    let u = url.trim();
    if (!/^https?:\/\//i.test(u)) u = "https://" + u;
    // avoid duplicate: if the same task + link is already added, keep it as-is
    if (tasks.some((t) => t.task_type === id && t.task_url === u)) {
      setError("");
      return;
    }
    // custom task lets the creator set a custom task name
    const label = id === "custom" ? (name.trim() || "Custom Task") : opt.label;
    setTasks((prev) => [
      ...prev,
      {
        task_type: opt.id,
        label,
        task_url: u,
        position: prev.length,
      } as SelectedTask,
    ]);
    // keep the pasted link visible in the input (no separate bottom list)
    setError("");
  };

  const uploadFile = async (file: File | Blob, name = "icon.png"): Promise<string> => {
    if (!isSupabaseConfigured) return URL.createObjectURL(file);
    const path = `public/${Date.now()}-${name}`;
    const { error: upErr } = await supabase.storage.from("uploads").upload(path, file);
    if (upErr) throw new Error(upErr.message);
    const { data } = supabase.storage.from("uploads").getPublicUrl(path);
    return data.publicUrl;
  };

  const onIconFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      // compress client-side to keep storage tiny
      const { compressIcon } = await import("@/lib/image");
      const { blob } = await compressIcon(file);
      const url = await uploadFile(blob as File, "icon.png");
      setIconUrl(url);
    } catch (err: any) {
      setError("Icon upload failed: " + (err?.message || "unknown"));
    }
  };

  const generate = async () => {
    setError("");
    if (tasks.length === 0) {
      setError("Please add at least one task first.");
      return;
    }
    if (!destinationUrl.trim()) {
      setError("Please enter the destination (reward) link.");
      return;
    }
    const urlOk = (u: string) => /^https?:\/\/.+/.test(u);
    if (!urlOk(destinationUrl)) {
      setError("Destination link must start with http:// or https://");
      return;
    }
    for (const t of tasks) {
      if (!urlOk(t.task_url)) {
        setError(`Task "${t.label}" needs a valid link.`);
        return;
      }
    }

    setGenerating(true);
    try {
      const slug = customSlug.trim() ? slugify(customSlug) || randomSlug() : randomSlug();
      const passwordHash = password.trim() ? await hashPassword(password.trim()) : null;

      const payload: any = {
        slug,
        title: title.trim() || "Your reward is ready",
        description: description.trim(),
        destination_url: destinationUrl.trim(),
        icon_url: iconUrl,
        has_password: Boolean(password.trim()),
        password_hash: passwordHash,
        expiry_date: expiryDate ? new Date(expiryDate).toISOString() : null,
        theme,
        video_url: videoUrl,
        active: true,
      };

      if (isSupabaseConfigured) {
        const { data: linkData, error: linkErr } = await supabase.from("links").insert(payload).select("id").single();
        if (linkErr) throw new Error(linkErr.message);
        const linkId = linkData.id;
        const taskRows = tasks.map((t, i) => ({
          link_id: linkId,
          task_type: t.task_type,
          label: t.label,
          task_url: t.task_url,
          position: i,
        }));
        const { error: tasksErr } = await supabase.from("tasks").insert(taskRows);
        if (tasksErr) throw new Error(tasksErr.message);
      }

      const fullUrl = `${baseUrl}/unlock/${slug}`;
      setResult({ slug, fullUrl, destination_url: destinationUrl.trim() });
    } catch (err: any) {
      setError(err?.message || "Something went wrong while generating. Check your Supabase setup.");
    } finally {
      setGenerating(false);
    }
  };

  const copyLink = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = result.fullUrl;
    }
  };

  const downloadQr = async () => {
    if (!result) return;
    try {
      const { default: QRCode } = await import("qrcode");
      const canvas = document.createElement("canvas");
      await QRCode.toCanvas(canvas, result.fullUrl, {
        width: 512,
        margin: 2,
        color: { dark: "#1d4ff0", light: "#ffffff" },
      });
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = `unlockflow-${result.slug}.png`;
      a.click();
    } catch {
      // fallback: open QR in new tab
      window.open(result.fullUrl, "_blank");
    }
  };

  const shareLink = async () => {
    if (!result) return;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Unlock your reward", url: result.fullUrl });
        return;
      } catch {}
    }
    await copyLink();
  };

  // On the first visit, glide visitors straight to the Task/Unlock builder
  // instead of leaving them at the Hero. Runs once on mount (which also covers
  // a page refresh). Manual scrolling and later navigation are left untouched.
  useEffect(() => {
    const section = document.getElementById("unlock-tasks");
    if (!section) return;
    requestAnimationFrame(() => {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  useEffect(() => {
    if (!result) return;
    document.getElementById("generated-result")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [result]);

  const reset = () => {
    setResult(null);
    setTasks([]);
    setActiveInputs([]);
    setDestinationUrl("");
    setCustomSlug("");
    setPassword("");
    setExpiryDate("");
    setTitle("Your reward is ready");
    setDescription("");
    setIconUrl("");
    setTheme("midnight");
    setVideoUrl("");
    setCopied(false);
  };

  return (
    <section id="unlock-tasks" className="scroll-mt-16 bg-slate-50/50 py-20 sm:py-24 dark:bg-night-900/40">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">Link Generator</span>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink dark:text-white sm:text-4xl">
            Build your premium unlock link in seconds
          </h2>
          <p className="mt-4 text-slate-600 dark:text-slate-400">
            Select tasks, add your links, customize with advanced options, and generate a link + QR code instantly.
          </p>
        </div>

        <div className="mx-auto mt-12 grid min-w-0 max-w-6xl items-start gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            {/* generator card */}
            <div className="card min-w-0 overflow-hidden !rounded-3xl dark:border-night-700 dark:bg-night-900/70 md:dark:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]">
            {/* Step 1 */}
            <div className="border-b border-slate-100 px-6 py-6 sm:px-8 dark:border-night-700">
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white dark:bg-brand-500">1</span>
                <h3 className="font-display text-lg font-bold text-ink dark:text-white">Add your tasks</h3>
              </div>

              <div className="mt-5 grid max-h-[280px] grid-cols-3 gap-2 overflow-y-auto rounded-xl pr-1 sm:max-h-[300px] sm:gap-2.5">
                {TASK_OPTIONS.map((opt) => {
                  const active = activeInputs.some((x) => x.id === opt.id);
                  const inList = tasks.some((t) => t.task_type === opt.id);
                  return (
                    <button
                      key={opt.id}
                      onClick={() => openTaskInput(opt.id)}
                      className={`relative flex flex-col items-center justify-center gap-1 rounded-xl border px-1.5 py-2.5 text-center transition sm:flex-row sm:gap-2 sm:px-3 sm:text-left ${
                        active
                          ? "border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-500/15 dark:bg-brand-500/10 dark:text-brand-300 dark:ring-brand-500/25"
                          : inList
                          ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30"
                          : "border-slate-200 bg-white text-slate-700 hover:border-brand-300 dark:border-night-700 dark:bg-night-800 dark:text-slate-200 dark:hover:border-brand-500"
                      }`}
                    >
                      <BrandIcon brand={opt.brand} className="h-5 w-5 shrink-0 sm:h-4 sm:w-4" />
                      <span className="text-[10px] font-semibold leading-tight text-slate-700 sm:text-xs dark:text-slate-200">{opt.label}</span>
                      {inList && (
                        <svg className="absolute right-1 top-1 h-3.5 w-3.5 shrink-0 text-emerald-500 sm:static sm:ml-auto" viewBox="0 0 24 24" fill="none">
                          <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>

              {activeInputs.length > 0 && (
                <div className="mt-4 space-y-3">
                  {activeInputs.map((row) => {
                    const opt = getTaskOption(row.id);
                    if (!opt) return null;
                    const isCustom = row.id === "custom";
                    return (
                      <div key={row.id}>
                        <div className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                          <BrandIcon brand={opt.brand} className="h-4 w-4" />
                          {opt.label}
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="grid flex-1 gap-2">
                            {isCustom ? (
                              <>
                                <div className="relative group">
                                  <span className="pointer-events-none absolute left-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg bg-brand-50 text-brand-600 transition group-focus-within:bg-brand-600 group-focus-within:text-white dark:bg-night-700 dark:text-brand-300 dark:group-focus-within:bg-brand-500 dark:group-focus-within:text-white">
                                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                                      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                  </span>
                                  <input
                                    autoFocus
                                    value={row.name}
                                    onChange={(e) => updateInput(row.id, { name: e.target.value })}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault();
                                        addTaskFor(row.id, row.url, row.name);
                                      }
                                    }}
                                    placeholder="Task name, e.g. Join my Discord"
                                    className="field pl-[3.3rem]"
                                  />
                                </div>
                                <div className="relative group">
                                  <span className="pointer-events-none absolute left-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg bg-brand-50 text-brand-600 transition group-focus-within:bg-brand-600 group-focus-within:text-white dark:bg-night-700 dark:text-brand-300 dark:group-focus-within:bg-brand-500 dark:group-focus-within:text-white">
                                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                                      <path d="M13.19 4.39a3.36 3.36 0 0 1 4.75 0l1.67 1.67a3.36 3.36 0 0 1 0 4.75l-3.3 3.3a3.36 3.36 0 0 1-4.75 0M10.81 19.61a3.36 3.36 0 0 1-4.75 0l-1.67-1.67a3.36 3.36 0 0 1 0-4.75l3.3-3.3a3.36 3.36 0 0 1 4.75 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                  </span>
                                  <input
                                    value={row.url}
                                    onChange={(e) => updateInput(row.id, { url: e.target.value })}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault();
                                        addTaskFor(row.id, row.url, row.name);
                                      }
                                    }}
                                    onBlur={() => addTaskFor(row.id, row.url, row.name)}
                                    placeholder={opt.placeholder}
                                    className="field pl-[3.3rem]"
                                  />
                                </div>
                              </>
                            ) : (
                              <div className="relative group">
                                <span className="pointer-events-none absolute left-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg bg-brand-50 transition group-focus-within:bg-brand-600 group-focus-within:text-white dark:bg-white dark:group-focus-within:bg-brand-500">
                                  <BrandIcon brand={opt.brand} className="h-4 w-4" />
                                </span>
                                <input
                                  autoFocus
                                  value={row.url}
                                  onChange={(e) => updateInput(row.id, { url: e.target.value })}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      addTaskFor(row.id, row.url, row.name);
                                    }
                                  }}
                                  onBlur={() => addTaskFor(row.id, row.url, row.name)}
                                  placeholder={opt.placeholder}
                                  className="field pl-[3.3rem]"
                                />
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => closeTaskInput(row.id)}
                            className="shrink-0 rounded-lg border border-slate-200 px-3 py-2.5 text-slate-400 transition hover:border-red-200 hover:text-red-500 dark:border-night-700 dark:hover:border-red-500/40"
                            aria-label="Close input"
                          >
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>

            {/* Step 2 */}
            <div className="border-b border-slate-100 px-6 py-6 sm:px-8 dark:border-night-700">
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white dark:bg-brand-500">2</span>
                <h3 className="font-display text-lg font-bold text-ink dark:text-white">Destination link (reward)</h3>
              </div>
              <div className="mt-5 min-w-0 max-w-full">
                <div className="relative min-w-0 max-w-full group">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg bg-brand-50 text-brand-600 transition group-focus-within:bg-brand-600 group-focus-within:text-white dark:bg-night-700 dark:text-brand-300 dark:group-focus-within:bg-brand-500 dark:group-focus-within:text-white">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <path d="M13.19 4.39a3.36 3.36 0 0 1 4.75 0l1.67 1.67a3.36 3.36 0 0 1 0 4.75l-3.3 3.3a3.36 3.36 0 0 1-4.75 0M10.81 19.61a3.36 3.36 0 0 1-4.75 0l-1.67-1.67a3.36 3.36 0 0 1 0-4.75l3.3-3.3a3.36 3.36 0 0 1 4.75 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </span>
                  <input
                    value={destinationUrl}
                    onChange={(e) => setDestinationUrl(e.target.value)}
                    placeholder="https://your-reward.com — the link users unlock"
                    className="field min-w-0 max-w-full pl-[3.6rem] !py-3"
                  />
                </div>
              </div>

              {/* Advanced options toggle */}
              <button
                onClick={() => setShowAdvance((s) => !s)}
                className={`mt-5 flex w-full items-center justify-between rounded-2xl border px-4 py-3.5 transition ${
                  showAdvance
                    ? "border-brand-300 bg-brand-50/60 shadow-glow dark:border-brand-500/40 dark:bg-brand-500/10"
                    : "border-slate-200 bg-white hover:border-brand-300 hover:shadow-sm dark:border-night-700 dark:bg-night-800 dark:hover:border-brand-500"
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${showAdvance ? "bg-brand-600 text-white" : "bg-brand-50 text-brand-600 dark:bg-night-700 dark:text-brand-300"}`}>
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                      <path d="M10.3 4.1 11.4 3a1.7 1.7 0 0 1 2.4 0l1.1 1.1a1.7 1.7 0 0 0 1.2.5h1.5A1.7 1.7 0 0 1 19.3 6.4v1.5a1.7 1.7 0 0 0 .5 1.2l1.1 1.1a1.7 1.7 0 0 1 0 2.4l-1.1 1.1a1.7 1.7 0 0 0-.5 1.2v1.5a1.7 1.7 0 0 1-1.7 1.7h-1.5a1.7 1.7 0 0 0-1.2.5l-1.1 1.1a1.7 1.7 0 0 1-2.4 0l-1.1-1.1a1.7 1.7 0 0 0-1.2-.5H7.6A1.7 1.7 0 0 1 5.9 18.5v-1.5a1.7 1.7 0 0 0-.5-1.2l-1.1-1.1a1.7 1.7 0 0 1 0-2.4l1.1-1.1a1.7 1.7 0 0 0 .5-1.2V8.5a1.7 1.7 0 0 1 1.7-1.7h1.5a1.7 1.7 0 0 0 1.2-.5z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span className="text-left">
                    <span className="block text-sm font-bold text-slate-800 dark:text-slate-100">Advanced options</span>
                    <span className="block text-xs text-slate-400 dark:text-slate-500">Theme, video thumbnail, SEO &amp; more</span>
                  </span>
                </span>
                <svg className={`h-5 w-5 text-brand-600 transition-transform dark:text-brand-400 ${showAdvance ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none">
                  <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {showAdvance && (
                <div className="relative mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card dark:border-night-700 dark:bg-night-900">
                  {/* top accent gradient */}
                  <div className="h-1 w-full bg-gradient-to-r from-brand-600 via-purple-600 to-cyan-500" />
                  <div className="p-5 sm:p-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200">
                          <svg className="h-4 w-4 text-brand-600 dark:text-brand-400" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                          Page title
                        </label>
                        <input value={title} onChange={(e) => setTitle(e.target.value)} className="field" placeholder="Your reward is ready" />
                      </div>
                      <div>
                        <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200">
                          <svg className="h-4 w-4 text-brand-600 dark:text-brand-400" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                          Description
                        </label>
                        <input value={description} onChange={(e) => setDescription(e.target.value)} className="field" placeholder="Complete all tasks to unlock your reward" />
                      </div>
                      <div>
                        <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200">
                          <svg className="h-4 w-4 text-brand-600 dark:text-brand-400" viewBox="0 0 24 24" fill="none"><rect x="4" y="11" width="16" height="9" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="currentColor" strokeWidth="2"/></svg>
                          Password
                        </label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="field" placeholder="Set an unlock password" />
                        <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">Users enter this before the reward opens.</p>
                      </div>
                      <div>
                        <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200">
                          <svg className="h-4 w-4 text-brand-600 dark:text-brand-400" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M8 3v4m8-4v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                          Expiry date
                        </label>
                        <input type="datetime-local" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} className="field" />
                      </div>
                      <div>
                        <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200">
                          <svg className="h-4 w-4 text-brand-600 dark:text-brand-400" viewBox="0 0 24 24" fill="none"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                          Custom slug
                        </label>
                        <input value={customSlug} onChange={(e) => setCustomSlug(e.target.value)} className="field" placeholder="my-unlock-link" />
                        <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">
                          Your link: <span className="font-semibold text-brand-600 dark:text-brand-400">unlockflow/{customSlug.trim() || "your-slug"}</span>
                        </p>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200">
                          <svg className="h-4 w-4 text-brand-600 dark:text-brand-400" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="2"/><circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="2"/><path d="m21 15-5-5L5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          Icon image
                        </label>
                        <input type="file" accept="image/*" onChange={onIconFile} className="field file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-brand-700 dark:file:bg-brand-500/15 dark:file:text-brand-300" />
                        {iconUrl && (
                          <div className="mt-2 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
                            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            Icon uploaded (compressed)
                          </div>
                        )}
                      </div>

                      {/* Theme selector */}
                      <div className="sm:col-span-2">
                        <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200">
                          <svg className="h-4 w-4 text-brand-600 dark:text-brand-400" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2"/></svg>
                          Unlock page theme
                        </label>
                        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                          {THEMES.map((t) => (
                            <button
                              key={t.id}
                              type="button"
                              aria-pressed={theme === t.id}
                              aria-label={`${t.label} theme`}
                              onClick={() => setTheme(t.id)}
                              className={`flex flex-col items-center gap-1.5 rounded-xl border p-2.5 text-center transition ${
                                theme === t.id
                                  ? "border-brand-500 bg-brand-50 ring-2 ring-brand-500/20 dark:bg-brand-500/10"
                                  : "border-slate-200 bg-white hover:border-brand-300 dark:border-night-700 dark:bg-night-800"
                              }`}
                            >
                              <span
                                className="h-8 w-8 rounded-full ring-2 ring-white shadow dark:ring-night-700"
                                style={{ background: `linear-gradient(135deg, ${t.swatch[0]}, ${t.swatch[1]})` }}
                              />
                              <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-200">{t.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Video thumbnail (zero-storage) */}
                      <div className="sm:col-span-2">
                        <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200">
                          <svg className="h-4 w-4 text-brand-600 dark:text-brand-400" viewBox="0 0 24 24" fill="none"><path d="m10 8 6 4-6 4V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2"/></svg>
                          Video thumbnail
                        </label>
                        <div className="relative group">
                          <span className="pointer-events-none absolute left-3.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-night-700 dark:text-brand-300">
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                              <path d="m10 8 6 4-6 4V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
                            </svg>
                          </span>
                          <input
                            value={videoUrl}
                            onChange={(e) => setVideoUrl(e.target.value)}
                            placeholder="Paste YouTube/Vimeo video link — thumbnail auto-appears"
                            className="field pl-[3.6rem]"
                          />
                        </div>
                        {videoUrl.trim() && parseVideoUrl(videoUrl) && (
                          <div className="mt-2 flex items-center gap-3">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={parseVideoUrl(videoUrl)!.thumbnail} alt="Video thumbnail" className="h-16 w-28 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-night-700" onError={(e) => ((e.target as HTMLImageElement).style.opacity = "0.2")} />
                            <span className="text-xs text-emerald-600 dark:text-emerald-400">Thumbnail loaded — no upload needed, storage stays tiny!</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Step 3 */}
            <div className="px-6 py-6 sm:px-8">
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white dark:bg-brand-500">3</span>
                <h3 className="font-display text-lg font-bold text-ink dark:text-white">Generate your unlock link</h3>
              </div>

              {error && (
                <Alert variant="error" className="mt-4">
                  {error}
                </Alert>
              )}

              <button onClick={generate} disabled={generating} className="btn-primary mt-4 w-full !py-4 !text-base disabled:opacity-60">
                {generating ? (
                  <>
                    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                      <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    Generating your link…
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                      <path d="M7 7h14m-4-4 4 4-4 4M17 17H3m4 4-4-4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Generate Link
                  </>
                )}
              </button>

              {!isSupabaseConfigured && (
                <Alert variant="warning" className="mt-3" title="Supabase not configured">
                  <span className="text-xs">Add your keys in .env.local — links won&apos;t persist until you do.</span>
                </Alert>
              )}

              {result && (
                <div id="generated-result" className="mt-5 overflow-hidden rounded-2xl border border-slate-200 dark:border-night-700">
                  <div className="relative bg-gradient-to-br from-brand-600 to-purple-600 px-5 py-4 text-center">
                    <div className="absolute inset-0 bg-grid opacity-20" />
                    <span className="relative inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Link generated successfully
                    </span>
                    <h3 className="relative mt-2 font-display text-lg font-extrabold text-white">Your unlock link is ready!</h3>
                  </div>

                  <div className="px-5 py-5">
                    <div className="flex flex-col items-center gap-5 sm:flex-row">
                      <div className="flex flex-col items-center gap-2">
                        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-night-700 dark:bg-white">
                          <GeneratedQr value={result.fullUrl} />
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
                            {result.fullUrl.replace(/^https?:\/\//, "").replace(/\/unlock\//, "/")}
                          </span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button onClick={copyLink} className="btn-primary !py-2.5">
                            {copied ? (
                              <>
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                Copied!
                              </>
                            ) : (
                              <>
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                                  <rect x="9" y="9" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
                                  <path d="M5 15V5a2 2 0 0 1 2-2h10" stroke="currentColor" strokeWidth="2" />
                                </svg>
                                Copy Link
                              </>
                            )}
                          </button>
                          <button onClick={shareLink} className="btn-ghost !py-2.5">
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                              <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="2" />
                              <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                              <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="2" />
                              <path d="m8.6 10.5 6.8-4M8.6 13.5l6.8 4" stroke="currentColor" strokeWidth="2" />
                            </svg>
                            Share
                          </button>
                          <a href={result.fullUrl} target="_blank" rel="noreferrer" className="btn-ghost !py-2.5">
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                              <path d="M14 3h7v7M21 3l-9 9M10 5H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Open
                          </a>
                        </div>
                        <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">Test it — or create another link.</p>
                      </div>
                    </div>

                    <button onClick={reset} className="btn-ghost mt-5 w-full">Create another link</button>
                  </div>
                </div>
              )}
            </div>
            </div>

            {/* Live preview */}
            <div className="card sticky top-20 min-w-0 max-w-full overflow-hidden !rounded-3xl p-4 dark:border-night-700 dark:bg-night-900/70">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500" />
                  </span>
                  <h3 className="text-sm font-bold text-ink dark:text-white">Live Preview</h3>
                </div>
                <button
                  onClick={() => setShowPreview((s) => !s)}
                  className="rounded-md px-2 py-1 text-xs font-semibold text-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-500/10"
                >
                  {showPreview ? "Hide" : "Show"}
                </button>
              </div>
              {showPreview && (
                <UnlockPreview
                  title={title}
                  description={description}
                  iconUrl={iconUrl}
                  destinationUrl={destinationUrl}
                  tasks={tasks.map((t) => ({ id: t.task_type, url: t.task_url, name: t.label }))}
                  hasPassword={Boolean(password.trim())}
                  theme={theme}
                  videoUrl={videoUrl}
                />
              )}
            </div>
          </div>
      </div>
    </section>
  );
}
