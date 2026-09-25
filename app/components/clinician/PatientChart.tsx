"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  ArrowLeft,
  CalendarPlus,
  ChevronDown,
  ChevronUp,
  GitBranch,
  LayoutDashboard,
  Loader2,
  MessageSquare,
  Mic,
  Phone,
  Send,
  Users,
} from "lucide-react";
import AppShell, { type NavItem } from "../app/AppShell";
import { FlagChip, RiskBadge, riskLevelFromPercent, toPercent } from "../shared/RiskBadge";
import { DemoNotice } from "../shared/Modal";
import { ChatMessage } from "../assessment/ChatMessage";
import PathwayResultCard, { DispositionPill, PathwayBadge } from "../pathway/PathwayResultCard";
import ScheduleAppointmentDialog from "../patient/ScheduleAppointmentDialog";
import { api, type Appointment, type DoctorNote, type PatientChart as Chart } from "@/lib/api";
import { SAMPLE_PATIENT_SUMMARY, SAMPLE_TRANSCRIPT } from "@/lib/sampleData";
import { describeChestPain, historyLabel, symptomLabel, triState, type DispositionLevel } from "@/lib/pathway";
import { formatDate, formatDateTime, initialsOf, relativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";

const NAV: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Patients", href: "/patients", icon: Users },
  { label: "Pathways", href: "/dashboard/pathways", icon: GitBranch },
];

const SAMPLE_CHART: Chart = {
  ...SAMPLE_PATIENT_SUMMARY,
  evaluations: SAMPLE_PATIENT_SUMMARY.latest_evaluation ? [SAMPLE_PATIENT_SUMMARY.latest_evaluation] : [],
  transcripts: [
    {
      session_id: SAMPLE_PATIENT_SUMMARY.conversations[0].session_id,
      messages: SAMPLE_TRANSCRIPT.map((m, i) => ({ id: i, role: m.role, content: m.content, created_at: null })),
    },
  ],
};

const NOTE_TYPES = [
  { value: "progress", label: "Progress note" },
  { value: "plan", label: "Care plan" },
  { value: "follow_up", label: "Follow-up" },
  { value: "message_to_patient", label: "Message to patient" },
];

export default function PatientChart({ patientId }: { patientId: number }) {
  const [chart, setChart] = useState<Chart | null>(null);
  const [demo, setDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [openTranscript, setOpenTranscript] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.patientChart(patientId);
      setChart(data);
      setDemo(false);
    } catch (err) {
      console.warn("Falling back to sample chart:", err);
      setChart(SAMPLE_CHART);
      setDemo(true);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    void load();
  }, [load]);

  const shell = {
    nav: NAV,
    user: { name: "Dr. Priya Patel", role: "Cardiology", initials: "PP" },
    onSignOut: () => signOut({ callbackUrl: "/" }),
  };

  if (loading || !chart) {
    return (
      <AppShell {...shell} title="Patient chart">
        <div className="mx-auto max-w-6xl space-y-4">
          <div className="surface h-32 animate-pulse bg-slate-50" />
          <div className="surface h-64 animate-pulse bg-slate-50" />
        </div>
      </AppShell>
    );
  }

  const { patient, latest_evaluation: latest } = chart;
  const result = latest?.result ?? null;
  const pct = latest?.risk_percent ?? toPercent(patient.probability);
  const findings = result?.findings;
  const symptoms = triState(findings?.symptoms);
  const history = triState(findings?.history);
  const pain = describeChestPain(findings?.chest_pain);
  const yes = (v: string | undefined) => (v ?? "").toLowerCase() === "yes";

  const onNoteAdded = (note: DoctorNote) => setChart((c) => (c ? { ...c, notes: [note, ...c.notes] } : c));
  const onScheduled = (a: Appointment) => setChart((c) => (c ? { ...c, appointments: [...c.appointments, a] } : c));

  return (
    <AppShell
      {...shell}
      title={patient.name ?? "Patient"}
      subtitle={`${patient.age ?? "—"} · ${patient.gender ?? "—"} · ${patient.phone_number ?? "no phone"}`}
      actions={
        <button type="button" onClick={() => setScheduleOpen(true)} className="btn-primary py-2">
          <CalendarPlus className="h-4 w-4" />
          <span className="hidden sm:inline">Schedule</span>
        </button>
      }
    >
      <div className="mx-auto max-w-6xl space-y-6">
        {demo && <DemoNotice message="This patient couldn't be loaded from the backend, so the chart below is illustrative." />}

        <Link href="/patients" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" /> All patients
        </Link>

        {/* Header card */}
        <section className="surface p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-brand-50 text-lg font-semibold text-brand-700">
              {initialsOf(patient.name)}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-2xl font-semibold">{patient.name}</h2>
                <RiskBadge level={riskLevelFromPercent(pct)} percent={pct} />
                {result && <DispositionPill level={result.disposition.level} />}
              </div>
              <p className="mt-1 text-sm text-slate-500">
                {patient.age} · {patient.gender} · {patient.phone_number}
                {latest?.created_at ? ` · last assessed ${relativeTime(latest.created_at)}` : ""}
              </p>
              {result?.primary_pathway && (
                <div className="mt-3">
                  <PathwayBadge assessment={result.primary_pathway} />
                </div>
              )}
            </div>
            <div className="grid grid-cols-3 gap-3 sm:w-72">
              {[
                { l: "Conversations", v: chart.conversations.length },
                { l: "Visits", v: chart.appointments.length },
                { l: "Notes", v: chart.notes.length },
              ].map((s) => (
                <div key={s.l} className="rounded-2xl bg-slate-50 p-3 text-center">
                  <p className="font-display text-xl font-semibold tabular-nums">{s.v}</p>
                  <p className="text-[11px] font-medium text-slate-500">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
          {result?.disposition.clinician_summary && (
            <p className="mt-5 rounded-2xl bg-slate-900 px-4 py-3 text-sm leading-6 text-slate-100">
              {result.disposition.clinician_summary}
            </p>
          )}
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-6">
            {result ? (
              <PathwayResultCard result={result} scheduleHref="#" showClinicianSummary={false} />
            ) : (
              <section className="surface px-6 py-10 text-center text-sm text-slate-500">
                No pathway evaluation on record for this patient yet.
              </section>
            )}

            {/* Findings */}
            <section className="surface p-6">
              <h3 className="text-base font-semibold">Symptoms &amp; history from AI conversations</h3>
              <p className="text-xs text-slate-500">Tri-state: reported · denied · not asked</p>
              {pain.length > 0 && (
                <div className="mt-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200/60">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Chest pain</p>
                  <p className="mt-1 text-sm text-slate-700">{pain.join(" · ")}</p>
                </div>
              )}
              <div className="mt-4 grid gap-5 md:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Symptoms</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {symptoms.present.map((k) => (
                      <FlagChip key={k} label={symptomLabel(k)} active />
                    ))}
                    {symptoms.absent.map((k) => (
                      <FlagChip key={k} label={symptomLabel(k)} active={false} />
                    ))}
                    {symptoms.present.length + symptoms.absent.length === 0 && (
                      <>
                        <FlagChip label="Shortness of breath" active={yes(patient.sob)} />
                        <FlagChip label="Stress-related" active={yes(patient.stress)} />
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">History &amp; risk factors</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {history.present.map((k) => (
                      <FlagChip key={k} label={historyLabel(k)} active />
                    ))}
                    {history.absent.map((k) => (
                      <FlagChip key={k} label={historyLabel(k)} active={false} />
                    ))}
                    {history.present.length + history.absent.length === 0 && (
                      <>
                        <FlagChip label="HTN" active={yes(patient.hypertension)} />
                        <FlagChip label="Diabetes" active={yes(patient.diabetes)} />
                        <FlagChip label="HLD" active={yes(patient.hyperlipidemia)} />
                        <FlagChip label="Smoking" active={yes(patient.smoking)} />
                      </>
                    )}
                  </div>
                </div>
              </div>
              {symptoms.unknown.length > 0 && (
                <p className="mt-4 text-xs text-slate-400">
                  Not asked: {symptoms.unknown.slice(0, 8).map(symptomLabel).join(", ")}
                  {symptoms.unknown.length > 8 ? ` +${symptoms.unknown.length - 8} more` : ""}
                </p>
              )}
              {findings?.vitals && Object.values(findings.vitals).some((v) => v != null) && (
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-600">
                  {findings.vitals.systolic_bp != null && (
                    <span className="chip bg-slate-50 ring-slate-200/70">BP {findings.vitals.systolic_bp}/{findings.vitals.diastolic_bp ?? "—"}</span>
                  )}
                  {findings.vitals.heart_rate != null && <span className="chip bg-slate-50 ring-slate-200/70">HR {findings.vitals.heart_rate}</span>}
                  {findings.vitals.spo2 != null && <span className="chip bg-slate-50 ring-slate-200/70">SpO₂ {findings.vitals.spo2}%</span>}
                </div>
              )}
            </section>

            {/* Conversations */}
            <section className="surface overflow-hidden">
              <div className="border-b border-slate-100 px-6 py-4">
                <h3 className="text-base font-semibold">AI conversations</h3>
                <p className="text-xs text-slate-500">Transcripts are logged for every text and voice session.</p>
              </div>
              {chart.conversations.length === 0 ? (
                <p className="px-6 py-10 text-center text-sm text-slate-500">No conversations logged.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {chart.conversations.map((c) => {
                    const t = chart.transcripts.find((x) => x.session_id === c.session_id);
                    const open = openTranscript === c.session_id;
                    return (
                      <li key={c.session_id}>
                        <button
                          type="button"
                          onClick={() => setOpenTranscript(open ? null : c.session_id)}
                          className="flex w-full items-center gap-4 px-6 py-4 text-left hover:bg-slate-50/70"
                        >
                          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-50 text-slate-500 ring-1 ring-slate-200/70">
                            {c.source === "voice" ? <Mic className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-slate-900">{c.preview ?? c.session_id}</p>
                            <p className="text-xs text-slate-500">
                              {formatDateTime(c.started_at)} · {c.message_count} messages{c.primary_pathway ? ` · ${c.primary_pathway}` : ""}
                            </p>
                          </div>
                          {c.disposition && <DispositionPill level={c.disposition as DispositionLevel} />}
                          {open ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                        </button>
                        {open && (
                          <div className="space-y-4 bg-[#F6F8FC] px-6 py-5">
                            {t && t.messages.length > 0 ? (
                              t.messages.map((m) => <ChatMessage key={m.id} role={m.role} content={m.content} />)
                            ) : (
                              <p className="text-sm text-slate-500">Transcript unavailable.</p>
                            )}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </div>

          <div className="space-y-6">
            <NotesPanel patientId={patientId} notes={chart.notes} demo={demo} onAdded={onNoteAdded} />

            <section className="surface overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <h3 className="text-base font-semibold">Appointments</h3>
                <button type="button" onClick={() => setScheduleOpen(true)} className="text-sm font-medium text-brand-600 hover:text-brand-700">
                  Schedule
                </button>
              </div>
              {chart.appointments.length === 0 ? (
                <p className="px-6 py-8 text-center text-sm text-slate-500">None on record.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {[...chart.appointments].sort((a, b) => b.scheduled_for.localeCompare(a.scheduled_for)).map((a) => (
                    <li key={a.id} className="px-6 py-3.5">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-slate-900">{formatDateTime(a.scheduled_for)}</p>
                        <span className={cn("chip capitalize", a.status === "completed" ? "bg-emerald-50 text-emerald-700 ring-emerald-600/15" : a.status === "cancelled" ? "bg-slate-50 text-slate-500 ring-slate-200/70" : "bg-brand-50 text-brand-700 ring-brand-600/15")}>
                          {a.status}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500">
                        <span className="capitalize">{a.appointment_type.replace("_", " ")}</span>
                        {a.doctor_name ? ` · ${a.doctor_name}` : ""}
                        {a.reason ? ` · ${a.reason}` : ""}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {chart.evaluations.length > 1 && (
              <section className="surface overflow-hidden">
                <div className="border-b border-slate-100 px-6 py-4">
                  <h3 className="text-base font-semibold">Risk over time</h3>
                </div>
                <ul className="divide-y divide-slate-100">
                  {chart.evaluations.map((e) => (
                    <li key={e.id} className="flex items-center justify-between px-6 py-3 text-sm">
                      <span className="text-slate-600">{formatDate(e.created_at)}</span>
                      <span className="flex items-center gap-2">
                        {e.disposition && <DispositionPill level={e.disposition as DispositionLevel} />}
                        <RiskBadge level={riskLevelFromPercent(e.risk_percent ?? 0)} percent={e.risk_percent ?? 0} />
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <a href={`tel:${patient.phone_number ?? ""}`} className="btn-secondary w-full justify-center">
              <Phone className="h-4 w-4" /> Call patient
            </a>
          </div>
        </div>
      </div>

      <ScheduleAppointmentDialog
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        patientId={demo ? null : patientId}
        disposition={result?.disposition ?? null}
        evaluationId={latest?.id ?? null}
        demo={demo}
        onScheduled={onScheduled}
      />
    </AppShell>
  );
}

function NotesPanel({
  patientId,
  notes,
  demo,
  onAdded,
}: {
  patientId: number;
  notes: DoctorNote[];
  demo: boolean;
  onAdded: (note: DoctorNote) => void;
}) {
  const [content, setContent] = useState("");
  const [type, setType] = useState("progress");
  const [visible, setVisible] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setError(null);
    const draft: DoctorNote = {
      id: -Date.now(),
      patient_id: patientId,
      doctor_id: null,
      author_name: "Dr. Priya Patel",
      note_type: type,
      content: content.trim(),
      visible_to_patient: visible,
      created_at: new Date().toISOString(),
    };
    if (demo) {
      onAdded(draft);
      setContent("");
      return;
    }
    setSaving(true);
    try {
      const saved = await api.addNote(patientId, {
        content: content.trim(),
        note_type: type,
        author_name: "Dr. Priya Patel",
        visible_to_patient: visible,
      });
      onAdded(saved);
      setContent("");
    } catch (err) {
      console.error(err);
      setError("Couldn't save the note. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="surface overflow-hidden">
      <div className="border-b border-slate-100 px-6 py-4">
        <h3 className="text-base font-semibold">Doctor&apos;s notes</h3>
      </div>
      <form onSubmit={submit} className="space-y-3 border-b border-slate-100 bg-slate-50/60 px-6 py-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          placeholder="Add a note or a message to the patient…"
          aria-label="New note"
          className="field-input resize-none"
        />
        <div className="flex flex-wrap items-center gap-2">
          <select value={type} onChange={(e) => setType(e.target.value)} aria-label="Note type" className="field-input w-auto py-1.5 text-xs">
            {NOTE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-xs text-slate-600">
            <input type="checkbox" checked={visible} onChange={(e) => setVisible(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
            Visible to patient
          </label>
          <button type="submit" disabled={saving || !content.trim()} className="btn-primary ml-auto py-1.5 text-xs">
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            Save note
          </button>
        </div>
        {error && <p className="text-xs text-rose-700">{error}</p>}
      </form>
      {notes.length === 0 ? (
        <p className="px-6 py-8 text-center text-sm text-slate-500">No notes yet.</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {notes.map((n) => (
            <li key={n.id} className="px-6 py-4">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-medium text-slate-800">{n.author_name ?? "Clinician"}</span>
                <span className="chip bg-white text-slate-600 ring-slate-200/70">{NOTE_TYPES.find((t) => t.value === n.note_type)?.label ?? n.note_type}</span>
                {!n.visible_to_patient && <span className="chip bg-slate-100 text-slate-500 ring-slate-200/70">Private</span>}
                <span className="ml-auto">{relativeTime(n.created_at)}</span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{n.content}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
