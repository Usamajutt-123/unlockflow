"use client";
import { getTaskOption } from "@/lib/tasks";
import { BrandIcon } from "./brandIcons";
import { getTheme } from "@/lib/themes";
import { parseVideoUrl } from "@/lib/thumbnail";

interface PTask {
  id: string;
  url: string;
  name?: string;
}
interface Props {
  title: string;
  description: string;
  iconUrl: string;
  destinationUrl: string;
  tasks: PTask[];
  hasPassword: boolean;
  theme?: string;
  videoUrl?: string;
}

// Live preview of the unlock page built from the generator's current state.
export default function UnlockPreview({ title, description, iconUrl, destinationUrl, tasks, hasPassword, theme = "midnight", videoUrl }: Props) {
  const th = getTheme(theme);
  const vi = videoUrl ? parseVideoUrl(videoUrl) : null;
  const previewTasks = tasks.filter((t) => t.url.trim());
  const progress = previewTasks.length
    ? Math.round((previewTasks.length / Math.max(previewTasks.length, 3)) * 100)
    : 0;
  const showReward = previewTasks.length > 0 && destinationUrl.trim() !== "";

  return (
    <div className="relative min-w-0 max-w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card dark:border-night-700 dark:bg-night-900">
      {/* header */}
      <div className={`relative flex items-end bg-gradient-to-br ${th.header} px-5 pb-5 pt-8`}>
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="relative w-full text-center">
          {vi && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={vi.thumbnail} alt="" className="mx-auto mb-3 h-28 w-48 rounded-xl object-cover shadow-lg ring-4 ring-white/30" />
          )}
          {iconUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={iconUrl} alt="" className="mx-auto h-14 w-14 rounded-2xl object-cover shadow-lg ring-4 ring-white/30" />
          ) : (
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 ring-4 ring-white/30">
              <svg className="h-7 w-7 text-white" viewBox="0 0 24 24" fill="none">
                <path d="M13.19 4.39a3.36 3.36 0 0 1 4.75 0l1.67 1.67a3.36 3.36 0 0 1 0 4.75l-3.3 3.3a3.36 3.36 0 0 1-4.75 0M10.81 19.61a3.36 3.36 0 0 1-4.75 0l-1.67-1.67a3.36 3.36 0 0 1 0-4.75l3.3-3.3a3.36 3.36 0 0 1 4.75 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          )}
          <h3 className="mt-3 font-display text-lg font-extrabold text-white">
            {title || "Your reward is ready"}
          </h3>
          {description && <p className="mt-1 text-xs text-brand-100">{description}</p>}
        </div>
      </div>

      {/* body */}
      <div className="p-5">
        {/* progress */}
        <div className="mb-4 rounded-xl border border-slate-100 bg-slate-50/70 p-3 dark:border-night-700 dark:bg-night-800/50">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-600 dark:text-slate-300">Complete all tasks</span>
            <span className="font-bold text-brand-600 dark:text-brand-400">{Math.min(previewTasks.length, 3)}/3 done</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-night-700">
            <div className={`h-full rounded-full bg-gradient-to-r ${th.progressBar} transition-all duration-300`} style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* tasks */}
        <div className="space-y-2">
          {previewTasks.length === 0 && (
            <p className="rounded-xl border border-dashed border-slate-200 px-4 py-5 text-center text-xs text-slate-400 dark:border-night-700">
              Add tasks to see them here
            </p>
          )}
          {previewTasks.slice(0, 3).map((t, i) => {
            const opt = getTaskOption(t.id);
            const done = i < Math.min(previewTasks.length - 1, 2) || (previewTasks.length <= 2 && i === 0);
            return (
              <div
                key={i}
                className={`flex items-center gap-2.5 rounded-lg border px-3 py-2.5 ${
                  done
                    ? "border-emerald-200 bg-emerald-50/60 dark:border-emerald-500/30 dark:bg-emerald-500/10"
                    : "border-slate-200 bg-white dark:border-night-700 dark:bg-night-800"
                }`}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg dark:bg-white" style={{ backgroundColor: `${opt?.brandColor || "#1d4ff0"}14` }}>
                  <BrandIcon brand={opt?.brand || "custom"} className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1 truncate text-xs font-semibold text-slate-700 dark:text-slate-200">
                  {t.name || opt?.label || t.id}
                </span>
                {done ? (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                ) : (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-dashed border-slate-300 text-slate-400 dark:border-night-600">
                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none"><path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* reward button */}
        <button
          disabled={!showReward}
          className={`mt-4 w-full rounded-xl px-4 py-3 text-sm font-semibold transition ${
            showReward
              ? `${th.button} shadow-glow`
              : "cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-night-800 dark:text-slate-500"
          }`}
        >
          {hasPassword ? "🔒 " : ""}Unlock Reward
        </button>

        {showReward && (
          <p className="mt-2 block w-full min-w-0 max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-center text-[11px] text-emerald-600 dark:text-emerald-400">
            Destination: {destinationUrl}
          </p>
        )}

        <p className="mt-3 text-center text-[10px] text-slate-400 dark:text-slate-500">
          Powered by <span className="font-semibold">UNLOCKFLOW</span> · Live preview
        </p>
      </div>
    </div>
  );
}
