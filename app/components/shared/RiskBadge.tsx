import { cn } from "@/lib/utils";

export type RiskLevel = "low" | "moderate" | "high";

/** Normalise a probability that may arrive as 0–1 or 0–100. */
export function toPercent(probability: number): number {
  if (Number.isNaN(probability)) return 0;
  const p = probability > 1 ? probability : probability * 100;
  return Math.max(0, Math.min(100, Math.round(p)));
}

export function riskLevelFromPercent(percent: number): RiskLevel {
  if (percent >= 80) return "high";
  if (percent >= 50) return "moderate";
  return "low";
}

const STYLES: Record<RiskLevel, { chip: string; dot: string; label: string }> =
  {
    low: {
      chip: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
      dot: "bg-emerald-500",
      label: "Low",
    },
    moderate: {
      chip: "bg-amber-50 text-amber-700 ring-amber-600/15",
      dot: "bg-amber-500",
      label: "Moderate",
    },
    high: {
      chip: "bg-rose-50 text-rose-700 ring-rose-600/15",
      dot: "bg-rose-500",
      label: "High",
    },
  };

export function RiskBadge({
  level,
  percent,
  className,
}: {
  level: RiskLevel;
  percent?: number;
  className?: string;
}) {
  const s = STYLES[level];
  return (
    <span className={cn("chip", s.chip, className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
      {s.label}
      {percent !== undefined && (
        <span className="tabular-nums opacity-80">· {percent}%</span>
      )}
    </span>
  );
}

/** Small yes/no chip used for symptoms and risk factors. */
export function FlagChip({
  label,
  active,
}: {
  label: string;
  active: boolean;
}) {
  return (
    <span
      className={cn(
        "chip",
        active
          ? "bg-brand-50 text-brand-700 ring-brand-600/15"
          : "bg-slate-50 text-slate-400 ring-slate-200/70 line-through decoration-slate-300",
      )}
    >
      {label}
    </span>
  );
}
