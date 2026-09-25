import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoProps = {
  href?: string;
  className?: string;
  /** "light" renders the wordmark in white for dark surfaces. */
  tone?: "dark" | "light";
  /** Hide the wordmark and show only the mark (e.g. collapsed sidebar). */
  markOnly?: boolean;
};

/**
 * Agilance mark: a rounded heart with a soft pulse line, drawn in the brand
 * blue so it sits calmly next to clinical UI.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      className={cn("h-8 w-8", className)}
    >
      <defs>
        <linearGradient id="agilance-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3B6FFF" />
          <stop offset="100%" stopColor="#1A45C7" />
        </linearGradient>
      </defs>
      <path
        d="M16 28.5c-.6 0-1.2-.2-1.7-.6L6.1 20.4C3.8 18.3 2.5 15.6 2.5 12.7 2.5 7.9 6.2 4 10.9 4c2 0 3.8.7 5.1 2 1.3-1.3 3.1-2 5.1-2 4.7 0 8.4 3.9 8.4 8.7 0 2.9-1.3 5.6-3.6 7.7l-8.2 7.5c-.5.4-1.1.6-1.7.6Z"
        fill="url(#agilance-mark)"
      />
      <path
        d="M8.5 15.5h4.2l1.8-3.6 2.4 7.2 2-4.6 1.2 1h3.4"
        fill="none"
        stroke="#fff"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Logo({
  href = "/",
  className,
  tone = "dark",
  markOnly = false,
}: LogoProps) {
  return (
    <Link
      href={href}
      aria-label="Agilance home"
      className={cn(
        "inline-flex items-center gap-2.5 rounded-lg outline-none",
        className,
      )}
    >
      <LogoMark />
      {!markOnly && (
        <span
          className={cn(
            "font-display text-[19px] font-bold tracking-tight",
            tone === "light" ? "text-white" : "text-slate-900",
          )}
        >
          Agilance
        </span>
      )}
    </Link>
  );
}
