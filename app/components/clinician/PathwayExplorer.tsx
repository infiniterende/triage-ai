"use client";

import { useState, type FormEvent } from "react";
import { signOut } from "next-auth/react";
import { ArrowDown, GitBranch, LayoutDashboard, Loader2, Play, ShieldAlert, Users } from "lucide-react";
import AppShell, { type NavItem } from "../app/AppShell";
import PathwayResultCard from "../pathway/PathwayResultCard";
import { api } from "@/lib/api";
import { CHRONIC_CATALOG, DISPOSITION_META, PATHWAY_CATALOG, PIPELINE_STEPS, type PathwayResult } from "@/lib/pathway";
import { cn } from "@/lib/utils";

const NAV: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Patients", href: "/patients", icon: Users },
  { label: "Pathways", href: "/dashboard/pathways", icon: GitBranch },
];

const SYMPTOM_TOGGLES = [
  ["exertional", "Brought on by exertion"],
  ["radiation_arm", "Radiates to arm / jaw"],
  ["diaphoresis", "Sweating"],
  ["dyspnea", "Shortness of breath"],
  ["dyspnea_at_rest", "Breathless at rest"],
  ["orthopnea", "Breathless lying flat"],
  ["leg_swelling", "Both legs swollen"],
  ["unilateral_leg_swelling", "One calf swollen"],
  ["pleuritic", "Worse on breathing"],
  ["positional", "Better leaning forward"],
  ["palpitations", "Palpitations"],
  ["syncope", "Fainted"],
  ["severe_headache", "Severe headache"],
  ["ongoing", "Pain happening now"],
] as const;

const HISTORY_TOGGLES = [
  ["hypertension", "Hypertension"],
  ["diabetes", "Diabetes"],
  ["hyperlipidemia", "High cholesterol"],
  ["smoking", "Smoker"],
  ["coronary_artery_disease", "Known CAD"],
  ["heart_failure", "Heart failure"],
  ["atrial_fibrillation", "Atrial fibrillation"],
  ["recent_surgery_or_immobilization", "Recent surgery / immobility"],
] as const;

type Toggle = Record<string, boolean>;

export default function PathwayExplorer() {
  const [age, setAge] = useState("58");
  const [sex, setSex] = useState<"male" | "female">("male");
  const [quality, setQuality] = useState("pressure");
  const [duration, setDuration] = useState("20");
  const [sbp, setSbp] = useState("");
  const [dbp, setDbp] = useState("");
  const [hr, setHr] = useState("");
  const [sx, setSx] = useState<Toggle>({ exertional: true, dyspnea: true });
  const [hx, setHx] = useState<Toggle>({ hypertension: true, hyperlipidemia: true });
  const [result, setResult] = useState<PathwayResult | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (e: FormEvent) => {
    e.preventDefault();
    setRunning(true);
    setError(null);
    const findings = {
      age: Number(age) || null,
      sex,
      chest_pain:
        quality === "none"
          ? { present: false }
          : {
              present: true,
              quality,
              location: "substernal",
              radiation: sx.radiation_arm ? ["left_arm", "jaw"] : [],
              exertional: !!sx.exertional,
              ongoing: !!sx.ongoing,
              duration_minutes: Number(duration) || null,
              pleuritic: !!sx.pleuritic,
              positional: !!sx.positional,
              sudden_onset: quality === "tearing",
              worst_ever: quality === "tearing",
            },
      symptoms: {
        diaphoresis: !!sx.diaphoresis,
        dyspnea: !!sx.dyspnea,
        dyspnea_at_rest: !!sx.dyspnea_at_rest,
        orthopnea: !!sx.orthopnea,
        leg_swelling: !!sx.leg_swelling,
        unilateral_leg_swelling: !!sx.unilateral_leg_swelling,
        palpitations: !!sx.palpitations,
        syncope: !!sx.syncope,
        severe_headache: !!sx.severe_headache,
      },
      history: Object.fromEntries(HISTORY_TOGGLES.map(([k]) => [k, !!hx[k]])),
      vitals: {
        systolic_bp: Number(sbp) || null,
        diastolic_bp: Number(dbp) || null,
        heart_rate: Number(hr) || null,
      },
    };
    try {
      setResult(await api.evaluateFindings(findings));
    } catch (err) {
      console.error(err);
      setError("The pathway engine API isn't reachable. Start the backend to run live evaluations.");
    } finally {
      setRunning(false);
    }
  };

  const toggle = (setter: (f: (t: Toggle) => Toggle) => void, key: string) =>
    setter((t) => ({ ...t, [key]: !t[key] }));

  return (
    <AppShell
      nav={NAV}
      user={{ name: "Dr. Priya Patel", role: "Cardiology", initials: "PP" }}
      onSignOut={() => signOut({ callbackUrl: "/" })}
      title="Clinical pathway engine"
      subtitle="How Agilance turns a conversation into a disposition"
    >
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Pipeline */}
        <section className="surface p-6 sm:p-8">
          <p className="eyebrow">Pipeline</p>
          <h2 className="mt-2 font-display text-2xl font-semibold">From symptoms to a safe next step</h2>
          <ol className="mt-6 grid gap-3 md:grid-cols-6">
            {PIPELINE_STEPS.map((s, i) => (
              <li key={s.id} className="relative">
                <div
                  className={cn(
                    "h-full rounded-2xl p-4 ring-1",
                    s.id === "safety" ? "bg-rose-50/70 ring-rose-100" : s.id === "router" ? "bg-brand-50/70 ring-brand-100" : "bg-slate-50 ring-slate-200/60",
                  )}
                >
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Step {i + 1}</span>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{s.label}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{s.detail}</p>
                </div>
                {i < PIPELINE_STEPS.length - 1 && (
                  <ArrowDown className="mx-auto my-1 h-4 w-4 text-slate-300 md:absolute md:-right-3.5 md:top-1/2 md:my-0 md:-translate-y-1/2 md:-rotate-90" />
                )}
              </li>
            ))}
          </ol>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          {/* Router catalog */}
          <section className="surface p-6">
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-600">
                <GitBranch className="h-4 w-4" />
              </span>
              <h3 className="text-base font-semibold">Cardiovascular triage router</h3>
            </div>
            <p className="mt-1 text-xs text-slate-500">All eight acute pathways are scored in parallel; the strongest becomes the leading pathway.</p>
            <ul className="mt-4 space-y-2">
              {PATHWAY_CATALOG.map((p) => (
                <li key={p.id} className="rounded-2xl bg-slate-50 p-3.5 ring-1 ring-slate-200/60">
                  <p className="text-sm font-semibold text-slate-900">{p.name}</p>
                  <p className="mt-0.5 text-xs leading-5 text-slate-500">{p.description}</p>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-slate-500">Chronic pathways (run alongside)</p>
            <ul className="mt-2 space-y-2">
              {CHRONIC_CATALOG.map((p) => (
                <li key={p.id} className="rounded-2xl bg-white p-3.5 ring-1 ring-slate-200/70">
                  <p className="text-sm font-semibold text-slate-900">{p.name}</p>
                  <p className="mt-0.5 text-xs leading-5 text-slate-500">{p.description}</p>
                </li>
              ))}
            </ul>
          </section>

          <div className="space-y-6">
            {/* Dispositions */}
            <section className="surface p-6">
              <div className="flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-rose-50 text-rose-600">
                  <ShieldAlert className="h-4 w-4" />
                </span>
                <h3 className="text-base font-semibold">Disposition ladder</h3>
              </div>
              <ul className="mt-4 space-y-2">
                {(Object.keys(DISPOSITION_META) as (keyof typeof DISPOSITION_META)[]).map((level) => (
                  <li key={level} className={cn("flex items-center gap-3 rounded-2xl px-4 py-3 ring-1", DISPOSITION_META[level].tone)}>
                    <span className={cn("h-2.5 w-2.5 rounded-full", DISPOSITION_META[level].dot)} />
                    <span className="text-sm font-semibold">{DISPOSITION_META[level].label}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs leading-5 text-slate-500">
                Any emergency red flag short-circuits to <span className="font-semibold">Emergency</span> and stops the interview. Chest pain never drops below <span className="font-semibold">Prompt</span>.
              </p>
            </section>

            {/* Try it */}
            <section className="surface p-6">
              <h3 className="text-base font-semibold">Try the engine</h3>
              <p className="text-xs text-slate-500">Build a presentation and see how it routes.</p>
              <form onSubmit={run} className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <label className="text-xs font-medium text-slate-600">
                    Age
                    <input type="number" value={age} onChange={(e) => setAge(e.target.value)} className="field-input mt-1 py-1.5" />
                  </label>
                  <label className="text-xs font-medium text-slate-600">
                    Sex
                    <select value={sex} onChange={(e) => setSex(e.target.value as "male" | "female")} className="field-input mt-1 py-1.5">
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </label>
                  <label className="text-xs font-medium text-slate-600">
                    Pain quality
                    <select value={quality} onChange={(e) => setQuality(e.target.value)} className="field-input mt-1 py-1.5">
                      <option value="pressure">Pressure</option>
                      <option value="sharp">Sharp</option>
                      <option value="burning">Burning</option>
                      <option value="tearing">Tearing</option>
                      <option value="dull">Dull</option>
                      <option value="none">No chest pain</option>
                    </select>
                  </label>
                  <label className="text-xs font-medium text-slate-600">
                    Duration (min)
                    <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} className="field-input mt-1 py-1.5" />
                  </label>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Symptoms</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {SYMPTOM_TOGGLES.map(([k, label]) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => toggle(setSx, k)}
                        aria-pressed={!!sx[k]}
                        className={cn("chip transition", sx[k] ? "bg-brand-600 text-white ring-brand-600" : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50")}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">History</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {HISTORY_TOGGLES.map(([k, label]) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => toggle(setHx, k)}
                        aria-pressed={!!hx[k]}
                        className={cn("chip transition", hx[k] ? "bg-slate-900 text-white ring-slate-900" : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50")}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <label className="text-xs font-medium text-slate-600">
                    Systolic BP
                    <input type="number" value={sbp} onChange={(e) => setSbp(e.target.value)} placeholder="—" className="field-input mt-1 py-1.5" />
                  </label>
                  <label className="text-xs font-medium text-slate-600">
                    Diastolic BP
                    <input type="number" value={dbp} onChange={(e) => setDbp(e.target.value)} placeholder="—" className="field-input mt-1 py-1.5" />
                  </label>
                  <label className="text-xs font-medium text-slate-600">
                    Heart rate
                    <input type="number" value={hr} onChange={(e) => setHr(e.target.value)} placeholder="—" className="field-input mt-1 py-1.5" />
                  </label>
                </div>
                {error && <p className="rounded-xl bg-amber-50 px-4 py-2.5 text-xs text-amber-800 ring-1 ring-amber-100">{error}</p>}
                <button type="submit" disabled={running} className="btn-primary w-full justify-center">
                  {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                  Evaluate
                </button>
              </form>
            </section>
          </div>
        </div>

        {result && <PathwayResultCard result={result} scheduleHref="/patients" showClinicianSummary />}
      </div>
    </AppShell>
  );
}
