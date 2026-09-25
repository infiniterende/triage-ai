import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "neutral",
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  tone?: "neutral" | "brand" | "low" | "moderate" | "high";
  className?: string;
}) {
  const iconTone = {
    neutral: "bg-slate-100 text-slate-600",
    brand: "bg-brand-50 text-brand-600",
    low: "bg-emerald-50 text-emerald-600",
    moderate: "bg-amber-50 text-amber-600",
    high: "bg-rose-50 text-rose-600",
  }[tone];

  return (
    <div className={cn("surface p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        {icon && (
          <span
            className={cn(
              "grid h-9 w-9 shrink-0 place-items-center rounded-xl",
              iconTone,
            )}
          >
            {icon}
          </span>
        )}
      </div>
      <p className="mt-3 font-display text-3xl font-semibold tracking-tight text-slate-900 tabular-nums">
        {value}
      </p>
      {hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
