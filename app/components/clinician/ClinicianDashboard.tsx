"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Download,
  GitBranch,
  LayoutDashboard,
  Loader2,
  RefreshCw,
  ShieldAlert,
  Users,
} from "lucide-react";
import AppShell, { type NavItem } from "../app/AppShell";
import { StatCard } from "../shared/StatCard";
import { RiskBadge, riskLevelFromPercent } from "../shared/RiskBadge";
import { DispositionPill } from "../pathway/PathwayResultCard";
import PatientsTable, { rowRisk } from "./PatientsTable";
import { api, API_BASE, type ClinicianPatientRow } from "@/lib/api";
import type { DispositionLevel } from "@/lib/pathway";
import { initialsOf, relativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";

type View = "overview" | "patients";
type LoadState = "loading" | "ready" | "error";

const NAV_BASE: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Patients", href: "/patients", icon: Users },
  { label: "Pathways", href: "/dashboard/pathways", icon: GitBranch },
];

export default function ClinicianDashboard({ view }: { view: View }) {
  const [patients, setPatients] = useState<ClinicianPatientRow[]>([]);
  const [status, setStatus] = useState<LoadState>("loading");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    (async () => {
      try {
        let rows: ClinicianPatientRow[];
        try {
          rows = await api.clinicianPatients();
        } catch {
          // Older backend without care_api — fall back to the plain list.
          rows = (await api.patients()).map((p) => ({ ...p, pathway: null }));
        }
        if (!cancelled) {
          setPatients(Array.isArray(rows) ? rows : []);
          setStatus("ready");
        }
      } catch (err) {
        console.error("Failed to load patients:", err);
        if (!cancelled) setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const stats = useMemo(() => {
    const pcts = patients.map(rowRisk);
    const high = pcts.filter((p) => p >= 80).length;
    const moderate = pcts.filter((p) => p >= 50 && p < 80).length;
    const low = pcts.length - high - moderate;
    const avg = pcts.length ? Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length) : 0;
    const emergencies = patients.filter((p) => p.pathway?.disposition === "emergency").length;
    const urgent = patients.filter((p) => p.pathway?.disposition === "urgent").length;
    const flagged = patients.filter((p) => (p.pathway?.red_flags.length ?? 0) > 0).length;
    return { total: patients.length, high, moderate, low, avg, emergencies, urgent, flagged };
  }, [patients]);

  const attention = useMemo(
    () =>
      [...patients]
        .sort((a, b) => {
          const rank = (p: ClinicianPatientRow) =>
            ({ emergency: 3, urgent: 2, prompt: 1, routine: 0 } as Record<string, number>)[p.pathway?.disposition ?? ""] ?? -1;
          return rank(b) - rank(a) || rowRisk(b) - rowRisk(a);
        })
        .slice(0, 6),
    [patients],
  );

  const nav: NavItem[] = NAV_BASE.map((n) =>
    n.href === "/patients" ? { ...n, badge: status === "ready" ? stats.total : undefined } : n,
  );

  const headerActions = (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => setRefreshKey((k) => k + 1)}
        aria-label="Refresh"
        className="grid h-10 w-10 place-items-center rounded-full text-slate-600 hover:bg-slate-100"
      >
        <RefreshCw className={cn("h-[18px] w-[18px]", status === "loading" && "animate-spin")} />
      </button>
      <button type="button" className="btn-secondary hidden py-2 sm:inline-flex">
        <Download className="h-4 w-4" /> Export
      </button>
    </div>
  );

  const shellProps = {
    nav,
    user: { name: "Dr. Priya Patel", role: "Cardiology", initials: "PP" },
    actions: headerActions,
    onSignOut: () => signOut({ callbackUrl: "/" }),
  };

  /* --------------------------- Loading / error --------------------------- */
  if (status !== "ready") {
    return (
      <AppShell {...shellProps} title={view === "overview" ? "Clinician overview" : "Patients"}>
        <div className="mx-auto max-w-6xl">
          {status === "loading" ? (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="surface h-28 animate-pulse bg-slate-50" />
                ))}
              </div>
              <div className="surface flex h-64 items-center justify-center gap-2 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading patients…
              </div>
            </div>
          ) : (
            <div className="surface flex flex-col items-center px-6 py-16 text-center">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-rose-50 text-rose-600">
                <AlertTriangle className="h-5 w-5" />
              </span>
              <h2 className="mt-4 text-lg font-semibold">We couldn&apos;t load patients</h2>
              <p className="mt-1 max-w-sm text-sm text-slate-500">
                Check that the backend at{" "}
                <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">{API_BASE || "NEXT_PUBLIC_API_ENDPOINT"}</code>{" "}
                is running, then try again.
              </p>
              <button type="button" onClick={() => setRefreshKey((k) => k + 1)} className="btn-primary mt-6">
                <RefreshCw className="h-4 w-4" /> Retry
              </button>
            </div>
          )}
        </div>
      </AppShell>
    );
  }

  /* ------------------------------- Patients ------------------------------ */
  if (view === "patients") {
    return (
      <AppShell {...shellProps} title="Patients" subtitle={`${stats.total} triaged · ${stats.high} high risk · ${stats.flagged} with red flags`}>
        <div className="mx-auto max-w-6xl">
          <PatientsTable data={patients} />
        </div>
      </AppShell>
    );
  }

  /* ------------------------------- Overview ------------------------------ */
  const dist = [
    { label: "High", value: stats.high, color: "bg-rose-500" },
    { label: "Moderate", value: stats.moderate, color: "bg-amber-500" },
    { label: "Low", value: stats.low, color: "bg-emerald-500" },
  ];

  return (
    <AppShell
      {...shellProps}
      title="Clinician overview"
      subtitle={new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
    >
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Patients triaged"
            value={stats.total}
            hint="All assessments on record"
            icon={<Users className="h-[18px] w-[18px]" />}
            tone="brand"
          />
          <StatCard
            label="Needs emergency / urgent care"
            value={stats.emergencies + stats.urgent}
            hint={`${stats.emergencies} emergency · ${stats.urgent} urgent`}
            icon={<ShieldAlert className="h-[18px] w-[18px]" />}
            tone="high"
          />
          <StatCard
            label="High risk (≥ 80%)"
            value={stats.high}
            hint={`${stats.moderate} moderate · ${stats.low} low`}
            icon={<AlertTriangle className="h-[18px] w-[18px]" />}
            tone="moderate"
          />
          <StatCard
            label="Average risk"
            value={`${stats.avg}%`}
            hint="Across all patients"
            icon={<Activity className="h-[18px] w-[18px]" />}
          />
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          {/* Needs attention */}
          <section className="surface overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h3 className="text-base font-semibold">Needs attention</h3>
                <p className="text-xs text-slate-500">Ordered by pathway disposition, then estimated risk</p>
              </div>
              <Link href="/patients" className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700">
                All patients <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            {attention.length === 0 ? (
              <p className="px-6 py-12 text-center text-sm text-slate-500">No patients have been triaged yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {attention.map((p) => {
                  const pct = rowRisk(p);
                  const pw = p.pathway;
                  return (
                    <li key={p.id}>
                      <Link href={`/dashboard/patients/${p.id}`} className="flex items-center gap-4 px-6 py-3.5 transition hover:bg-slate-50/70">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700">
                          {initialsOf(p.name)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-900">{p.name}</p>
                          <p className="truncate text-xs text-slate-500">
                            {p.age} · {p.gender}
                            {pw?.primary_pathway_name ? ` · ${pw.primary_pathway_name}` : p.pain_quality ? ` · ${p.pain_quality}` : ""}
                            {pw?.evaluated_at ? ` · ${relativeTime(pw.evaluated_at)}` : ""}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          {pw?.disposition && <DispositionPill level={pw.disposition as DispositionLevel} className="hidden sm:inline-flex" />}
                          <RiskBadge level={riskLevelFromPercent(pct)} percent={pct} />
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* Distribution */}
          <section className="surface p-6">
            <h3 className="text-base font-semibold">Risk distribution</h3>
            <p className="text-xs text-slate-500">Share of patients by estimated risk band</p>
            <div className="mt-5 flex h-3 w-full overflow-hidden rounded-full bg-slate-100">
              {dist.map((d) =>
                d.value > 0 ? (
                  <div
                    key={d.label}
                    className={cn("h-full", d.color)}
                    style={{ width: `${(d.value / Math.max(1, stats.total)) * 100}%` }}
                    title={`${d.label}: ${d.value}`}
                  />
                ) : null,
              )}
            </div>
            <ul className="mt-5 space-y-3">
              {dist.map((d) => (
                <li key={d.label} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-slate-700">
                    <span className={cn("h-2.5 w-2.5 rounded-full", d.color)} />
                    {d.label}
                  </span>
                  <span className="tabular-nums text-slate-900">
                    <span className="font-semibold">{d.value}</span>
                    <span className="ml-1.5 text-xs text-slate-400">{stats.total ? Math.round((d.value / stats.total) * 100) : 0}%</span>
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-xs leading-5 text-slate-600">
              Risk uses the pathway engine&apos;s headline score when a conversation has been evaluated, otherwise the CAD
              pre-test probability. High ≥ 80%, moderate 50–79%, low below 50%.
            </div>
            <Link href="/dashboard/pathways" className="btn-secondary mt-4 w-full justify-center">
              <GitBranch className="h-4 w-4" /> How the pathway engine works
            </Link>
          </section>
        </div>

        <PatientsTable data={patients} />
      </div>
    </AppShell>
  );
}
