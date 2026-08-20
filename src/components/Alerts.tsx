"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";

/* ====================================================================
   UNLOCKFLOW — Custom Alerts & Dialogs
   Premium styled replacements for the browser's native alert / confirm /
   prompt popups and the old flat inline message boxes.

   - <Alert>          inline message box (error / success / warning / info)
   - <ConfirmDialog>  styled replacement for confirm()
   - <InputDialog>    styled replacement for prompt()

   Calling code keeps the exact same logic — only how the alert looks
   and behaves has been customized.
   ==================================================================== */

export type AlertVariant = "error" | "success" | "warning" | "info";

const ALERT_STYLES: Record<AlertVariant, { box: string; iconWrap: string }> = {
  error: {
    box: "border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300",
    iconWrap: "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400",
  },
  success: {
    box: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300",
    iconWrap: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
  },
  warning: {
    box: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300",
    iconWrap: "bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
  },
  info: {
    box: "border-brand-200 bg-brand-50 text-brand-800 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-300",
    iconWrap: "bg-brand-100 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400",
  },
};

function AlertIcon({ variant, className }: { variant: AlertVariant; className?: string }) {
  const common = { className, viewBox: "0 0 24 24", fill: "none", "aria-hidden": true as const };
  switch (variant) {
    case "error":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
          <path d="M9.2 9.2l5.6 5.6M14.8 9.2l-5.6 5.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "success":
      return (
        <svg {...common}>
          <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <path d="m9 11.8 2 2 4-4.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "warning":
      return (
        <svg {...common}>
          <path d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
          <path d="M12 11v5m0-8v.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
  }
}

/** Inline alert box — styled replacement for the old flat error/success/warning messages. */
export function Alert({
  variant = "info",
  title,
  children,
  className = "",
}: {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  const s = ALERT_STYLES[variant];
  return (
    <div
      role={variant === "error" || variant === "warning" ? "alert" : "status"}
      className={`uf-alert flex items-start gap-3 rounded-xl border px-4 py-3 shadow-sm ${s.box} ${className}`}
    >
      <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${s.iconWrap}`}>
        <AlertIcon variant={variant} className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1 text-sm leading-snug">
        {title && <p className="mb-0.5 text-sm font-bold leading-tight">{title}</p>}
        <div>{children}</div>
      </div>
    </div>
  );
}

/* ---------------------------- Confirm dialog ---------------------------- */

export interface ConfirmState {
  title: string;
  message?: string;
  confirmLabel?: string;
  /** danger = red confirm button (delete-style actions), brand = blue */
  tone?: "danger" | "brand";
  action: () => void;
}

/** Styled replacement for the browser confirm() popup. */
export function ConfirmDialog({ state, onClose }: { state: ConfirmState | null; onClose: () => void }) {
  const open = !!state;
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    confirmRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open || !state || typeof document === "undefined") return null;

  const danger = (state.tone ?? "danger") === "danger";

  return createPortal(
    <div
      className="uf-dialog-backdrop fixed inset-0 z-[100] flex items-center justify-center bg-night-950/60 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="uf-confirm-title"
        onMouseDown={(e) => e.stopPropagation()}
        className="uf-dialog-card card relative w-full max-w-md p-6 text-center dark:border-night-700 dark:bg-night-900"
      >
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-night-700 dark:hover:text-slate-300"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        <div
          className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${
            danger
              ? "bg-red-50 text-red-500 shadow-[0_8px_24px_-8px_rgba(239,68,68,0.5)] dark:bg-red-500/15 dark:text-red-400"
              : "bg-brand-50 text-brand-600 shadow-[0_8px_24px_-8px_rgba(51,112,255,0.5)] dark:bg-brand-500/15 dark:text-brand-400"
          }`}
        >
          {danger ? (
            <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 7h16M10 11v6m4-6v6M6 7l1 13a1 1 0 0 0 1 .8h8a1 1 0 0 0 1-.8L18 7M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
              <path d="m9 12 2 2 4-4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>

        <h3 id="uf-confirm-title" className="mt-4 font-display text-lg font-extrabold text-ink dark:text-white">
          {state.title}
        </h3>
        {state.message && <p className="mx-auto mt-1.5 max-w-xs text-sm leading-relaxed text-slate-500 dark:text-slate-400">{state.message}</p>}

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button onClick={onClose} className="btn-ghost">
            Cancel
          </button>
          <button
            ref={confirmRef}
            onClick={() => {
              state.action();
              onClose();
            }}
            className={`rounded-xl px-4 py-2.5 text-sm font-bold text-white transition active:scale-[0.98] ${
              danger
                ? "bg-gradient-to-r from-red-500 to-rose-600 shadow-lg shadow-red-500/30 hover:brightness-110"
                : "bg-gradient-to-r from-brand-600 to-purple-600 shadow-lg shadow-brand-500/30 hover:brightness-110"
            }`}
          >
            {state.confirmLabel || "Confirm"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ----------------------------- Input dialog ----------------------------- */

export interface InputState {
  label: string;
  placeholder?: string;
  defaultValue?: string;
  confirmLabel?: string;
  /** Called with the trimmed value. The parent decides when to close the dialog
      (pass a new InputState to chain, or null to close). */
  submit: (value: string) => void;
}

/** Styled replacement for the browser prompt() popup. */
export function InputDialog({
  state,
  resetKey,
  onClose,
}: {
  state: InputState | null;
  /** change this value to reset the input (e.g. when chaining dialogs) */
  resetKey?: number | string;
  onClose: () => void;
}) {
  const open = !!state;
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setValue(state?.defaultValue ?? "");
      inputRef.current?.focus();
      inputRef.current?.select();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, resetKey]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open || !state || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="uf-dialog-backdrop fixed inset-0 z-[100] flex items-center justify-center bg-night-950/60 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={onClose}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-label={state.label}
        onMouseDown={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault();
          state.submit(value.trim());
        }}
        className="uf-dialog-card card relative w-full max-w-md p-6 dark:border-night-700 dark:bg-night-900"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-night-700 dark:hover:text-slate-300"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        <h3 className="font-display text-lg font-extrabold text-ink dark:text-white">{state.label}</h3>
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={state.placeholder}
          className="field mt-4 w-full"
        />
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button type="button" onClick={onClose} className="btn-ghost">
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-500/30 transition hover:brightness-110 active:scale-[0.98]"
          >
            {state.confirmLabel || "OK"}
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
}
