import Image from "next/image";

export default function Logo({ className = "h-9 w-auto" }: { className?: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className={`relative ${className}`}>
        <Image src="/logo.webp" alt="UNLOCKFLOW logo" fill className="object-contain drop-shadow" unoptimized />
      </span>
      <span className="font-display text-lg font-extrabold tracking-tight text-ink dark:text-white">
        UNLOCK<span className="text-brand-600 dark:text-brand-400">FLOW</span>
      </span>
    </div>
  );
}
