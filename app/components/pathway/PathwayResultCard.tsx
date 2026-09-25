"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CalendarPlus,
  Check,
  ChevronDown,
  ChevronUp,
  Phone,
  ShieldAlert,
} from "lucide-react";
import {
  DISPOSITION_META,
  LIKELIHOOD_META,
  type ConditionAssessment,
  type PathwayResult,
} from "@/lib/pathway";
import { cn } from "@/lib/utils";

function RiskDial({ percent }: { percent: number | null }) {
  const p = Math.max(0, Math.min(100, percent ?? 0));
  const r = 30;
  const c = 2 * Math.PI * r;
  const tone = p >= 80 ? "text-rose-500" : p >= 50 ? "text-amber-500" : "text-emerald-500";
  return (
    <div className="relative grid h-[84px] w-[84px] shrink-0 place-items-center">
      <svg viewBox="0 0 72 72" className="h-full w-full -rotate-90">
        <circle cx="36" cy="36" r={r} className="fill-none stroke-slate-100" strokeWidth="7" />
        <circle
          cx="36"
          cy="36"
          r={r}
          className={cn("fill-none stroke-current transition-all duration-700", tone)}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * p) / 100}
        />
      </svg>
      <div className="absolute text-center">
        <p className="font-display text-lg font-semibold leading-none text-slate-900 tabular-nums">
          {percent == null ? "—" : `${p}%`}
        </p>
        <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-400">risk</p>
      </div>
    </div>
  );
}

export function PathwayBadge({ assessment }: { assessment: ConditionAssessment }) {
  const meta = LIKELIHOOD_META[assessment.likelihood];
  return (
    <span className={cn("chip", meta.tone)}>
      {assessment.name}
      <span className="opacity-70">· {meta.label}</span>
    </span>
  );
}

export function DispositionPill({ level, className }: { level: PathwayResult["disposition"]["level"]; className?: string }) {
  const meta = DISPOSITION_META[level];
  return (
    <span className={cn("chip ring-1", meta.tone, className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
      {meta.short}
    </span>
  );
}

export default function PathwayResultCard({
  result,
  scheduleHref = "/patient?tab=appointments&schedule=1",
  compact = false,
  showClinicianSummary = false,
}: {
  result: PathwayResult;
  scheduleHref?: string;
  compact?: boolean;
  showClinicianSummary?: boolean;
}) {
  const [showAll, setShowAll] = useState(false);
  const { disposition, primary_pathway: primary, red_flags, chronic_pathways } = result;
  const meta = DISPOSITION_META[disposition.level];
  const cad = chronic_pathways.find((c) => c.pathway === "cad_risk");
  const others = result.pathways.filter((p) => p.pathway !== primary?.pathway && p.likelihood !== "unlikely");

  return (
    <section className="surface overflow-hidden" aria-label="Assessment result">
      {/* Disposition banner */}
      <div className={cn("flex flex-col gap-4 p-5 ring-1 sm:flex-row sm:items-center", meta.tone)}>
        <RiskDial percent={result.risk_percent} />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-70">Recommendation</p>
          <h3 className="mt-1 font-display text-xl font-semibold leading-tight">{disposition.headline}</h3>
          <p className="mt-1 text-sm opacity-80">{disposition.timeframe}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          {disposition.level === "emergency" ? (
            <a href="tel:911" className="btn bg-rose-600 px-5 py-2.5 text-white hover:bg-rose-700">
              <Phone className="h-4 w-4" /> Call 911
            </a>
          ) : (
            <Link href={scheduleHref} className="btn-primary">
              <CalendarPlus className="h-4 w-4" /> Schedule
            </Link>
          )}
        </div>
      </div>

      <div className="space-y-5 p-5">
        <p className="text-sm leading-6 text-slate-700">{disposition.patient_message}</p>

        {red_flags.length > 0 && (
          <div className="rounded-2xl border border-rose-100 bg-rose-50/70 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-rose-800">
              <ShieldAlert className="h-4 w-4" /> Safety flags
            </p>
            <ul className="mt-2 space-y-1.5">
              {red_flags.map((f) => (
                <li key={f.code} className="text-sm text-rose-900">
                  <span className="font-medium">{f.label}.</span>{" "}
                  <span className="text-rose-800/80">{f.rationale}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {primary && primary.likelihood !== "unlikely" && (
          <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200/60">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Leading pathway</p>
              <PathwayBadge assessment={primary} />
            </div>
            <p className="mt-2 text-sm text-slate-700">{primary.summary}</p>
            {!compact && primary.supporting.length > 0 && (
              <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
                {primary.supporting.slice(0, showAll ? undefined : 6).map((s) => (
                  <li key={s} className="flex items-start gap-2 text-xs text-slate-600">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600" />
                    {s}
                  </li>
                ))}
              </ul>
            )}
            {!compact && primary.supporting.length > 6 && (
              <button
                type="button"
                onClick={() => setShowAll((v) => !v)}
                className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
              >
                {showAll ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                {showAll ? "Show fewer" : `Show all ${primary.supporting.length} findings`}
              </button>
            )}
          </div>
        )}

        {!compact && others.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Also considered</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {others.map((p) => (
                <PathwayBadge key={p.pathway} assessment={p} />
              ))}
            </div>
          </div>
        )}

        {cad && cad.probability != null && (
          <div className="flex items-start gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200/70">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
              <AlertTriangle className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900">
                {cad.probability}% pre-test probability of coronary artery disease
              </p>
              <p className="mt-0.5 text-xs leading-5 text-slate-500">{cad.guidance}</p>
            </div>
          </div>
        )}

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">What to do next</p>
          <ol className="mt-2 space-y-2">
            {disposition.actions.map((a, i) => (
              <li key={a} className="flex items-start gap-3 text-sm text-slate-700">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-600 text-[11px] font-semibold text-white">
                  {i + 1}
                </span>
                {a}
              </li>
            ))}
          </ol>
        </div>

        {showClinicianSummary && (
          <div className="rounded-2xl bg-slate-900 p-4 text-xs leading-5 text-slate-200">
            <p className="mb-1 font-semibold uppercase tracking-wider text-slate-400">Clinician summary</p>
            {disposition.clinician_summary}
          </div>
        )}
      </div>
    </section>
  );
}
