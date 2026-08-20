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

function PreviewLock({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="10" width="16" height="11" rx="2.5" stroke="currentColor" strokeWidth="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function PreviewLink({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M13.2 4.4a3.35 3.35 0 0 1 4.75 0l1.65 1.65a3.35 3.35 0 0 1 0 4.75l-3.3 3.3a3.35 3.35 0 0 1-4.75 0M10.8 19.6a3.35 3.35 0 0 1-4.75 0L4.4 17.95a3.35 3.35 0 0 1 0-4.75l3.3-3.3a3.35 3.35 0 0 1 4.75 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="m9 15 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// Live preview mirrors the real unlock-page structure and all six creator themes.
export default function UnlockPreview({
  title,
  description,
  iconUrl,
  destinationUrl,
  tasks,
  hasPassword,
  theme = "midnight",
  videoUrl,
}: Props) {
  const th = getTheme(theme);
  const video = videoUrl ? parseVideoUrl(videoUrl) : null;
  const previewTasks = tasks.filter((t) => t.url.trim()).slice(0, 3);
  const completedCount = previewTasks.length > 0 ? Math.max(0, previewTasks.length - 1) : 0;
  const progress = previewTasks.length ? Math.round((completedCount / previewTasks.length) * 100) : 0;
  const showReward = previewTasks.length > 0 && destinationUrl.trim() !== "";

  return (
    <div className="unlock-shell unlock-preview-shell" data-unlock-theme={th.id}>
      <div className="unlock-frame unlock-preview-frame">
        <div className="unlock-nav">
          <span className="unlock-wordmark">
            <span className="unlock-wordmark-mark"><PreviewLock /></span>
            <span className="unlock-wordmark-text">UNLOCK<span>FLOW</span></span>
          </span>
          <span className="unlock-preview-help">Need help? &nbsp;?</span>
        </div>

        <div className="unlock-summary">
          <div className="unlock-reward-icon">
            {iconUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={iconUrl} alt="Reward icon" />
            ) : (
              <PreviewLink className="h-7 w-7" />
            )}
          </div>

          <div className="unlock-cover">
            {video ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={video.thumbnail} alt="Video preview" />
            ) : (
              <div className="unlock-cover-placeholder">
                <span className="unlock-cover-spark" />
                <PreviewLock className="h-7 w-7" />
                <span>Protected reward</span>
              </div>
            )}
          </div>

          <div className="unlock-summary-copy">
            <p className="unlock-eyebrow">Exclusive reward</p>
            <h1>{title || "Your reward is ready"}</h1>
            <p className="unlock-description">{description || "Complete the tasks below to access your reward."}</p>
            <div className="unlock-progress-block">
              <div className="unlock-progress-copy">
                <span><strong>{completedCount} / {previewTasks.length || 3}</strong> Tasks Completed</span>
                <strong>{progress}%</strong>
              </div>
              <div className="unlock-progress-track"><span style={{ width: `${progress}%` }} /></div>
            </div>
          </div>
        </div>

        <div className="unlock-preview-ad">
          <small>Advertisement</small>
          <span>Premium Ad Space</span>
        </div>

        <section className="unlock-tasks-section">
          <div className="unlock-section-heading">
            <span className="unlock-section-dot" />
            <div><h2>Complete the tasks below</h2><p>Finish every step to activate your reward</p></div>
            <span className="unlock-task-count">{completedCount}/{previewTasks.length || 3}</span>
          </div>

          <ul className="unlock-task-list">
            {previewTasks.length === 0 && (
              <li className="unlock-preview-empty">Add tasks to see them here</li>
            )}
            {previewTasks.map((task, i) => {
              const opt = getTaskOption(task.id);
              const done = i < completedCount;
              return (
                <li key={`${task.id}-${i}`} className={`unlock-task-step ${done ? "is-done" : ""}`}>
                  <span className="unlock-timeline-dot">{i + 1}</span>
                  <button type="button" tabIndex={-1}>
                    <span
                      className="unlock-task-icon"
                      style={{ "--task-color": opt?.brandColor || "#1d4ff0" } as React.CSSProperties}
                    >
                      <BrandIcon brand={opt?.brand || "custom"} className="h-4 w-4" />
                    </span>
                    <span className="unlock-task-copy">
                      <strong>{task.name || opt?.label || task.id}</strong>
                      <small>{done ? "Task completed successfully" : "Open and complete this task"}</small>
                    </span>
                    <span className="unlock-task-action">
                      {done ? (
                        <>Completed <svg viewBox="0 0 24 24" fill="none"><path d="m6 12 4 4 8-9" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg></>
                      ) : (
                        <>Open <svg viewBox="0 0 24 24" fill="none"><path d="M7 17 17 7m-7 0h7v7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        <div className="unlock-preview-ad unlock-preview-ad-bottom">
          <small>Advertisement</small>
          <span>Premium Ad Space</span>
        </div>

        <div className="unlock-reward-section">
          <button type="button" disabled={!showReward} className="unlock-main-button">
            <PreviewLock className="h-4 w-4" />
            <span>{showReward ? (hasPassword ? "Password protected reward" : "Unlock Reward") : "Complete tasks to unlock"}</span>
          </button>
        </div>

        <div className="unlock-preview-powered">Powered by <strong>UNLOCKFLOW</strong> · Live preview</div>
      </div>
    </div>
  );
}
