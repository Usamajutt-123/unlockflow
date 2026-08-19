import Image from "next/image";

interface LogoProps {
  /** size classes for the logo mark, e.g. "h-8 w-8" */
  className?: string;
  /** size class for the wordmark text, e.g. "text-base" */
  textClassName?: string;
  /** hide the UNLOCKFLOW wordmark and show only the mark */
  showText?: boolean;
}

export default function Logo({
  className = "h-9 w-9",
  textClassName = "text-lg",
  showText = true,
}: LogoProps) {
  return (
    <span className="flex items-center gap-2.5">
      <span
        className={`${className} inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-white p-0.5 shadow-sm ring-1 ring-slate-200/80 dark:bg-night-800 dark:ring-night-700`}
      >
        <Image
          src="/logo.webp"
          alt="UNLOCKFLOW logo"
          width={256}
          height={256}
          priority
          unoptimized
          className="h-full w-full object-contain"
        />
      </span>
      {showText && (
        <span
          className={`font-display ${textClassName} font-extrabold tracking-tight text-ink dark:text-white`}
        >
          UNLOCK<span className="text-brand-600 dark:text-brand-400">FLOW</span>
        </span>
      )}
    </span>
  );
}
