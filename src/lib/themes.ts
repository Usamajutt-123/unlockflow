// Unlock-page visual themes the creator can pick.

export interface Theme {
  id: string;
  label: string;
  swatch: string[];     // gradient colors for the selector
  header: string;       // tailwind classes for the header banner
  headerGrid?: string;  // grid overlay style
  card: string;         // card classes
  progressBar: string;  // progress bar fill
  button: string;       // unlock button
  icon: string;         // icon box
  textPrimary: string;
  textMuted: string;
}

export const THEMES: Theme[] = [
  {
    id: "midnight",
    label: "Midnight",
    swatch: ["#1d4ff0", "#7c3aed"],
    header: "from-slate-900 via-indigo-900 to-purple-900",
    card: "dark:border-night-700 dark:bg-night-900/80",
    progressBar: "from-brand-500 to-purple-500",
    button: "bg-brand-600 hover:bg-brand-700 text-white",
    icon: "dark:bg-white",
    textPrimary: "text-ink dark:text-white",
    textMuted: "text-slate-600 dark:text-slate-300",
  },
  {
    id: "clean",
    label: "Clean Light",
    swatch: ["#f8fafc", "#e2e8f0"],
    header: "from-slate-100 via-white to-brand-50",
    card: "bg-white dark:bg-night-900",
    progressBar: "from-brand-500 to-sky-500",
    button: "bg-brand-600 hover:bg-brand-700 text-white",
    icon: "bg-white",
    textPrimary: "text-slate-900 dark:text-white",
    textMuted: "text-slate-600 dark:text-slate-300",
  },
  {
    id: "neon",
    label: "Neon",
    swatch: ["#22d3ee", "#a855f7"],
    header: "from-cyan-600 via-fuchsia-600 to-purple-700",
    card: "border-cyan-500/40 dark:bg-night-900/80",
    progressBar: "from-cyan-400 to-fuchsia-500",
    button: "bg-gradient-to-r from-cyan-500 to-fuchsia-600 hover:from-cyan-400 hover:to-fuchsia-500 text-white",
    icon: "bg-white",
    textPrimary: "text-ink dark:text-white",
    textMuted: "text-slate-600 dark:text-slate-300",
  },
  {
    id: "minimal",
    label: "Minimal",
    swatch: ["#94a3b8", "#cbd5e1"],
    header: "from-slate-800 to-slate-600",
    card: "dark:border-night-700 dark:bg-night-900/80",
    progressBar: "from-slate-500 to-slate-400",
    button: "bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200",
    icon: "bg-white dark:bg-white",
    textPrimary: "text-ink dark:text-white",
    textMuted: "text-slate-600 dark:text-slate-300",
  },
  {
    id: "creator",
    label: "Creator",
    swatch: ["#f59e0b", "#ef4444"],
    header: "from-amber-500 via-orange-600 to-red-600",
    card: "dark:border-night-700 dark:bg-night-900/80",
    progressBar: "from-amber-500 to-red-500",
    button: "bg-gradient-to-r from-amber-500 to-red-500 hover:from-amber-400 hover:to-red-400 text-white",
    icon: "bg-white",
    textPrimary: "text-ink dark:text-white",
    textMuted: "text-slate-600 dark:text-slate-300",
  },
  {
    id: "gaming",
    label: "Gaming",
    swatch: ["#10b981", "#0ea5e9"],
    header: "from-emerald-700 via-teal-700 to-sky-800",
    card: "border-emerald-500/30 dark:bg-night-900/80",
    progressBar: "from-emerald-400 to-sky-500",
    button: "bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-400 hover:to-sky-400 text-white",
    icon: "bg-white",
    textPrimary: "text-ink dark:text-white",
    textMuted: "text-slate-600 dark:text-slate-300",
  },
];

export function getTheme(id: string): Theme {
  return THEMES.find((t) => t.id === id) || THEMES[0];
}
