"use client";
import { useTheme } from "@/lib/theme";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="relative flex h-9 w-16 items-center rounded-full border border-slate-200 bg-slate-100 px-1 transition dark:border-night-700 dark:bg-night-800"
    >
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full bg-white shadow transition-transform dark:bg-night-700 ${
          theme === "dark" ? "translate-x-7" : "translate-x-0"
        }`}
      >
        {theme === "dark" ? (
          <svg className="h-4 w-4 text-amber-300" viewBox="0 0 24 24" fill="none">
            <path d="M12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6l1.4 1.4m10 10 1.4 1.4M18.4 5.6l-1.4 1.4M7 14a5 5 0 0 0 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        ) : (
          <svg className="h-4 w-4 text-slate-500" viewBox="0 0 24 24" fill="none">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
    </button>
  );
}
