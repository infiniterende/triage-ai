"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  CalendarDays,
  CalendarPlus,
  ClipboardList,
  FileText,
  HeartPulse,
  Home,
  MessageSquare,
  Mic,
  Phone,
  Sparkles,
  Stethoscope,
  X,
} from "lucide-react";
import AppShell, { type NavItem } from "../app/AppShell";
import { StatCard } from "../shared/StatCard";
import { FlagChip, RiskBadge, riskLevelFromPercent } from "../shared/RiskBadge";
import Modal, { DemoNotice } from "../shared/Modal";
import { ChatMessage } from "../assessment/ChatMessage";
import TextAssessment from "../assessment/TextAssessment";
import PathwayResultCard, {
  DispositionPill,
} from "../pathway/PathwayResultCard";
import ScheduleAppointmentDialog from "./ScheduleAppointmentDialog";
import {
  api,
  recallPatientId,
  type Appointment,
  type ChatTranscript,
  type PatientSummary,
} from "@/lib/api";
import { SAMPLE_PATIENT_SUMMARY, SAMPLE_TRANSCRIPT } from "@/lib/sampleData";
import {
  describeChestPain,
  historyLabel,
  symptomLabel,
  triState,
  type DispositionLevel,
  type PathwayResult,
} from "@/lib/pathway";
import {
  formatDate,
  formatDateTime,
  initialsOf,
  relativeTime,
} from "@/lib/format";
import { cn } from "@/lib/utils";

export type PatientTab =
  | "overview"
  | "conversations"
  | "appointments"
  | "history"
  | "notes";

const TAB_META: Record<PatientTab, { title: string; subtitle: string }> = {
  overview: { title: "Overview", subtitle: "Your heart health at a glance" },
  conversations: {
    title: "Conversations",
    subtitle: "Every assessment you've had with the Agilance assistant",
  },
  appointments: {
    title: "Visits & appointments",
    subtitle: "Upcoming and past visits with your care team",
  },
  history: {
    title: "History & symptoms",
    subtitle: "What the assistant has learned about you",
  },
  notes: {
    title: "Doctor's notes",
    subtitle: "Messages and plans from your clinicians",
  },
};

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function riskLevel(pct: number | null | undefined) {
  return riskLevelFromPercent(pct ?? 0);
}

/* ------------------------------------------------------------------ */

export default function PatientDashboard({
  tab,
  onTabChange,
  patientIdFromUrl,
  openScheduler,
}: {
  tab: PatientTab;
  onTabChange: (tab: PatientTab) => void;
  patientIdFromUrl: number | null;
  openScheduler: boolean;
}) {
  const [summary, setSummary] = useState<PatientSummary | null>(null);
  const [demo, setDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scheduleOpen, setScheduleOpen] = useState(openScheduler);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [transcript, setTranscript] = useState<{
    title: string;
    data: ChatTranscript;
  } | null>(null);

  const patientId = useMemo(
    () => patientIdFromUrl ?? recallPatientId(),
    [patientIdFromUrl],
  );

  const load = useCallback(async () => {
    setLoading(true);
    if (patientId == null) {
      setSummary(SAMPLE_PATIENT_SUMMARY);
      setDemo(true);
      setLoading(false);
      return;
    }
    try {
      const data = await api.patientSummary(patientId);
      setSummary(data);
      setDemo(false);
    } catch (err) {
      console.warn("Falling back to sample patient data:", err);
      setSummary(SAMPLE_PATIENT_SUMMARY);
      setDemo(true);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (openScheduler) setScheduleOpen(true);
  }, [openScheduler]);

  const patient = summary?.patient;
  const latest = summary?.latest_evaluation?.result ?? null;
  const upcoming = (summary?.appointments ?? [])
    .filter(
      (a) =>
        a.status !== "cancelled" &&
        a.status !== "completed" &&
        new Date(a.scheduled_for) >= new Date(Date.now() - 3600_000),
    )
    .sort((a, b) => a.scheduled_for.localeCompare(b.scheduled_for));
  const past = (summary?.appointments ?? []).filter(
    (a) => !upcoming.includes(a),
  );

  const nav: NavItem[] = [
    { label: "Overview", href: "/patient?tab=overview", icon: Home },
    {
      label: "Conversations",
      href: "/patient?tab=conversations",
      icon: MessageSquare,
      badge: summary?.conversations.length,
    },
    {
      label: "Visits & appointments",
      href: "/patient?tab=appointments",
      icon: CalendarDays,
      badge: upcoming.length || undefined,
    },
    {
      label: "History & symptoms",
      href: "/patient?tab=history",
      icon: ClipboardList,
    },
    {
      label: "Doctor's notes",
      href: "/patient?tab=notes",
      icon: FileText,
      badge: summary?.notes.length || undefined,
    },
  ];

  const openTranscript = async (sessionId: string, title: string) => {
    if (demo) {
      setTranscript({
        title,
        data: {
          session_id: sessionId,
          assessment_complete: true,
          messages: SAMPLE_TRANSCRIPT.map((m, i) => ({
            id: i,
            role: m.role,
            content: m.content,
            created_at: null,
          })),
          pathway: latest,
        },
      });
      return;
    }
    try {
      const data = await api.chatTranscript(sessionId);
      setTranscript({ title, data });
    } catch (err) {
      console.error(err);
    }
  };

  const onScheduled = (appt: Appointment) => {
    setSummary((s) =>
      s ? { ...s, appointments: [...s.appointments, appt] } : s,
    );
    onTabChange("appointments");
  };

  const onAssessmentComplete = (
    result: PathwayResult,
    newPatientId?: number,
  ) => {
    // Refresh from the backend when we know who the patient is; otherwise
    // surface the new result locally so the dashboard reflects it right away.
    if (newPatientId != null && !demo) {
      void load();
      return;
    }
    setSummary((s) =>
      s
        ? {
            ...s,
            latest_evaluation: {
              id: result.evaluation_id ?? -1,
              session_id: "local",
              source: "text",
              patient_id: newPatientId ?? null,
              primary_pathway: result.primary_pathway?.pathway ?? null,
              disposition: result.disposition.level,
              risk_percent: result.risk_percent,
              result,
              created_at: new Date().toISOString(),
            },
          }
        : s,
    );
  };

  const headerActions = (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => setAssistantOpen(true)}
        className="btn-primary py-2"
      >
        <Sparkles className="h-4 w-4" />
        <span className="hidden sm:inline">Ask the assistant</span>
        <span className="sm:hidden">Assistant</span>
      </button>
    </div>
  );

  return (
    <AppShell
      nav={nav}
      activeHref={`/patient?tab=${tab}`}
      user={{
        name: patient?.name ?? "Patient",
        role: "Patient",
        initials: initialsOf(patient?.name),
      }}
      title={TAB_META[tab].title}
      subtitle={TAB_META[tab].subtitle}
      actions={headerActions}
    >
      <div className="mx-auto max-w-6xl space-y-6">
        {demo && !loading && <DemoNotice />}

        {loading || !summary ? (
          <div className="space-y-4">
            <div className="surface h-40 animate-pulse bg-slate-50" />
            <div className="grid gap-4 sm:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="surface h-28 animate-pulse bg-slate-50"
                />
              ))}
            </div>
          </div>
        ) : tab === "overview" ? (
          <OverviewTab
            summary={summary}
            latest={latest}
            upcoming={upcoming[0] ?? null}
            onTab={onTabChange}
            onSchedule={() => setScheduleOpen(true)}
            onAssistant={() => setAssistantOpen(true)}
            onOpenTranscript={openTranscript}
          />
        ) : tab === "conversations" ? (
          <ConversationsTab
            summary={summary}
            onOpen={openTranscript}
            onAssistant={() => setAssistantOpen(true)}
          />
        ) : tab === "appointments" ? (
          <AppointmentsTab
            upcoming={upcoming}
            past={past}
            onSchedule={() => setScheduleOpen(true)}
          />
        ) : tab === "history" ? (
          <HistoryTab summary={summary} latest={latest} />
        ) : (
          <NotesTab summary={summary} />
        )}
      </div>

      <ScheduleAppointmentDialog
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        patientId={demo ? null : patientId}
        disposition={latest?.disposition ?? null}
        evaluationId={summary?.latest_evaluation?.id ?? null}
        demo={demo}
        onScheduled={onScheduled}
      />

      <Modal
        open={transcript !== null}
        onClose={() => setTranscript(null)}
        title={transcript?.title ?? "Conversation"}
        description="Full transcript of your assessment"
        size="lg"
      >
        {transcript && (
          <div className="space-y-5">
            <div className="space-y-4 rounded-2xl bg-[#F6F8FC] p-4">
              {transcript.data.messages.map((m) => (
                <ChatMessage key={m.id} role={m.role} content={m.content} />
              ))}
            </div>
            {transcript.data.pathway && (
              <PathwayResultCard result={transcript.data.pathway} compact />
            )}
          </div>
        )}
      </Modal>

      <AssistantDrawer
        open={assistantOpen}
        onClose={() => setAssistantOpen(false)}
        onComplete={onAssessmentComplete}
      />
    </AppShell>
  );
}

/* ------------------------------------------------------------------ */
/* Tabs                                                                */
/* ------------------------------------------------------------------ */

function OverviewTab({
  summary,
  latest,
  upcoming,
  onTab,
  onSchedule,
  onAssistant,
  onOpenTranscript,
}: {
  summary: PatientSummary;
  latest: PathwayResult | null;
  upcoming: Appointment | null;
  onTab: (t: PatientTab) => void;
  onSchedule: () => void;
  onAssistant: () => void;
  onOpenTranscript: (sessionId: string, title: string) => void;
}) {
  const { patient, conversations, notes } = summary;
  const evaluatedAt = summary.latest_evaluation?.created_at;
  const risk = summary.latest_evaluation?.risk_percent ?? null;
  const firstName = patient.name?.split(" ")[0] ?? "there";

  return (
    <>
      <section className="relative overflow-hidden rounded-4xl bg-hero-glow p-7 ring-1 ring-slate-200/60 sm:p-9">
        <div className="absolute inset-0 bg-grid-faint bg-[size:32px_32px] opacity-40 [mask-image:radial-gradient(60%_80%_at_20%_20%,black,transparent)]" />
        <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="eyebrow">
              {greeting()}, {firstName}
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">
              How are you feeling today?
            </h2>
            <p className="mt-2 max-w-lg text-sm leading-6 text-slate-600">
              {latest ? (
                <>
                  Your last check-in was {relativeTime(evaluatedAt)} and pointed
                  to{" "}
                  <span className="font-medium text-slate-800">
                    {latest.disposition.headline.toLowerCase()}
                  </span>
                  . If anything has changed, talk to the assistant — it takes
                  about three minutes.
                </>
              ) : (
                <>
                  You haven&apos;t completed an assessment yet. The assistant
                  will ask a few questions and give you a clear next step.
                </>
              )}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
            <button
              type="button"
              onClick={onAssistant}
              className="btn-primary justify-center px-6 py-3"
            >
              <MessageSquare className="h-4 w-4" />
              Chat with the assistant
            </button>
            <Link
              href="/assessment?mode=voice"
              className="btn-secondary justify-center px-6 py-3"
            >
              <Mic className="h-4 w-4 text-brand-600" />
              Talk instead
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Current risk"
          value={
            <span className="flex items-center gap-3">
              {risk == null ? "—" : `${risk}%`}
              {risk != null && <RiskBadge level={riskLevel(risk)} />}
            </span>
          }
          hint={
            evaluatedAt
              ? `Assessed ${formatDate(evaluatedAt)}`
              : "No assessment yet"
          }
          icon={<HeartPulse className="h-[18px] w-[18px]" />}
          tone={risk == null ? "neutral" : riskLevel(risk)}
        />
        <StatCard
          label="Conversations logged"
          value={conversations.length}
          hint={
            conversations[0]?.started_at
              ? `Last ${relativeTime(conversations[0].started_at)}`
              : "Start one any time"
          }
          icon={<MessageSquare className="h-[18px] w-[18px]" />}
          tone="brand"
        />
        <StatCard
          label="Next appointment"
          value={
            upcoming
              ? formatDate(upcoming.scheduled_for, {
                  month: "short",
                  day: "numeric",
                })
              : "None"
          }
          hint={
            upcoming
              ? `${formatDateTime(upcoming.scheduled_for).split("·")[1]?.trim()} · ${upcoming.doctor_name ?? "Care team"}`
              : "Schedule when you're ready"
          }
          icon={<CalendarDays className="h-[18px] w-[18px]" />}
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          {latest ? (
            <PathwayResultCard
              result={latest}
              scheduleHref="/patient?tab=appointments&schedule=1"
            />
          ) : (
            <section className="surface flex flex-col items-center px-6 py-12 text-center">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-brand-50 text-brand-600">
                <Sparkles className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-semibold">
                Your first assessment
              </h3>
              <p className="mt-1 max-w-sm text-sm text-slate-500">
                Tell the assistant what you&apos;re feeling and it will estimate
                your risk and recommend a next step.
              </p>
              <button
                type="button"
                onClick={onAssistant}
                className="btn-primary mt-5"
              >
                Start now
              </button>
            </section>
          )}

          <section className="surface overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="text-base font-semibold">Recent conversations</h3>
              <button
                type="button"
                onClick={() => onTab("conversations")}
                className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                All <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
            <ConversationList
              items={conversations.slice(0, 3)}
              onOpen={onOpenTranscript}
            />
          </section>
        </div>

        <div className="space-y-6">
          <section className="surface p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">Next visit</h3>
              {upcoming && <AppointmentStatusPill status={upcoming.status} />}
            </div>
            {upcoming ? (
              <>
                <AppointmentRow appointment={upcoming} />
                <div className="mt-5 flex gap-2">
                  <button
                    type="button"
                    onClick={onSchedule}
                    className="btn-secondary flex-1 justify-center py-2"
                  >
                    Book another
                  </button>
                  <button
                    type="button"
                    onClick={() => onTab("appointments")}
                    className="btn-ghost flex-1 justify-center py-2"
                  >
                    Details
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="mt-2 text-sm text-slate-500">
                  No upcoming visits. Your assessment can suggest the right
                  timeframe.
                </p>
                <button
                  type="button"
                  onClick={onSchedule}
                  className="btn-primary mt-4 w-full justify-center"
                >
                  <CalendarPlus className="h-4 w-4" /> Schedule a visit
                </button>
              </>
            )}
          </section>

          <section className="surface p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">From your care team</h3>
              <button
                type="button"
                onClick={() => onTab("notes")}
                className="text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                All notes
              </button>
            </div>
            {notes[0] ? (
              <div className="mt-3">
                <p className="text-xs text-slate-500">
                  {notes[0].author_name ?? "Clinician"} ·{" "}
                  {relativeTime(notes[0].created_at)}
                </p>
                <p className="mt-1.5 line-clamp-4 text-sm leading-6 text-slate-700">
                  {notes[0].content}
                </p>
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-500">No notes yet.</p>
            )}
          </section>

          <section className="rounded-3xl border border-rose-100 bg-rose-50/60 p-6">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-rose-600 ring-1 ring-rose-100">
                <Phone className="h-4 w-4" />
              </span>
              <h3 className="text-base font-semibold text-slate-900">
                When to call 911
              </h3>
            </div>
            <ul className="mt-3 space-y-1.5 text-sm text-slate-700">
              <li>· Crushing or squeezing chest pain that won&apos;t ease</li>
              <li>· Pain with shortness of breath, sweating or fainting</li>
              <li>· Pain spreading to your arm, jaw or back</li>
            </ul>
            <a
              href="tel:911"
              className="btn mt-4 w-full bg-rose-600 py-2.5 text-white hover:bg-rose-700"
            >
              <Phone className="h-4 w-4" /> Call 911
            </a>
          </section>
        </div>
      </div>
    </>
  );
}

function ConversationList({
  items,
  onOpen,
}: {
  items: PatientSummary["conversations"];
  onOpen: (sessionId: string, title: string) => void;
}) {
  if (items.length === 0) {
    return (
      <p className="px-6 py-10 text-center text-sm text-slate-500">
        No conversations yet.
      </p>
    );
  }
  return (
    <ul className="divide-y divide-slate-100">
      {items.map((c) => {
        const title = `${c.source === "voice" ? "Voice" : "Text"} assessment · ${formatDate(c.started_at)}`;
        return (
          <li key={c.session_id}>
            <button
              type="button"
              onClick={() => onOpen(c.session_id, title)}
              className="flex w-full items-center gap-4 px-6 py-4 text-left transition hover:bg-slate-50/70"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-50 text-slate-500 ring-1 ring-slate-200/70">
                {c.source === "voice" ? (
                  <Mic className="h-4 w-4" />
                ) : (
                  <MessageSquare className="h-4 w-4" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900">
                  {c.preview ?? title}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {formatDateTime(c.started_at)} · {c.message_count} messages
                  {c.primary_pathway ? ` · ${c.primary_pathway}` : ""}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {c.disposition && (
                  <DispositionPill level={c.disposition as DispositionLevel} />
                )}
                {c.risk_percent != null && (
                  <RiskBadge
                    level={riskLevel(c.risk_percent)}
                    percent={c.risk_percent}
                    className="hidden sm:inline-flex"
                  />
                )}
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function ConversationsTab({
  summary,
  onOpen,
  onAssistant,
}: {
  summary: PatientSummary;
  onOpen: (sessionId: string, title: string) => void;
  onAssistant: () => void;
}) {
  return (
    <section className="surface overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold">All conversations</h3>
          <p className="text-xs text-slate-500">
            Tap any conversation to read the full transcript and its result.
          </p>
        </div>
        <button
          type="button"
          onClick={onAssistant}
          className="btn-primary py-2"
        >
          <Sparkles className="h-4 w-4" /> New conversation
        </button>
      </div>
      <ConversationList items={summary.conversations} onOpen={onOpen} />
    </section>
  );
}

function AppointmentStatusPill({ status }: { status: Appointment["status"] }) {
  const tone = {
    requested: "bg-amber-50 text-amber-700 ring-amber-600/15",
    scheduled: "bg-brand-50 text-brand-700 ring-brand-600/15",
    completed: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
    cancelled: "bg-slate-50 text-slate-500 ring-slate-200/70",
  }[status];
  return <span className={cn("chip capitalize", tone)}>{status}</span>;
}

function AppointmentRow({ appointment }: { appointment: Appointment }) {
  const d = new Date(appointment.scheduled_for);
  return (
    <div className="mt-4 flex items-start gap-4">
      <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-brand-600 text-white">
        <span className="text-center leading-tight">
          <span className="block text-[10px] font-semibold uppercase">
            {d.toLocaleDateString(undefined, { month: "short" })}
          </span>
          <span className="block font-display text-lg font-semibold">
            {d.getDate()}
          </span>
        </span>
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-900">
          {formatDateTime(appointment.scheduled_for).split("·")[1]?.trim()} ·{" "}
          <span className="capitalize">
            {appointment.appointment_type.replace("_", " ")}
          </span>
        </p>
        <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-600">
          <Stethoscope className="h-3.5 w-3.5 text-slate-400" />
          {appointment.doctor_name ?? "Care team"}
        </p>
        {appointment.reason && (
          <p className="mt-0.5 text-xs text-slate-500">{appointment.reason}</p>
        )}
        {appointment.location && (
          <p className="mt-0.5 text-xs text-slate-500">
            {appointment.location}
          </p>
        )}
      </div>
    </div>
  );
}

function AppointmentsTab({
  upcoming,
  past,
  onSchedule,
}: {
  upcoming: Appointment[];
  past: Appointment[];
  onSchedule: () => void;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <div className="space-y-6">
        <section className="surface overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h3 className="text-base font-semibold">Upcoming</h3>
            <button
              type="button"
              onClick={onSchedule}
              className="btn-primary py-2"
            >
              <CalendarPlus className="h-4 w-4" /> Schedule
            </button>
          </div>
          {upcoming.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-slate-500">
              Nothing scheduled.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {upcoming.map((a) => (
                <li key={a.id} className="px-6 pb-5 pt-1">
                  <div className="flex items-center justify-between pt-3">
                    <p className="text-xs text-slate-500">
                      {formatDate(a.scheduled_for, {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <AppointmentStatusPill status={a.status} />
                  </div>
                  <AppointmentRow appointment={a} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="surface overflow-hidden">
          <div className="border-b border-slate-100 px-6 py-4">
            <h3 className="text-base font-semibold">Past visits</h3>
          </div>
          {past.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-slate-500">
              No past visits on record.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {past.map((a) => (
                <li key={a.id} className="flex items-center gap-4 px-6 py-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-50 text-slate-500 ring-1 ring-slate-200/70">
                    <Stethoscope className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900">
                      {a.doctor_name ?? "Care team"} ·{" "}
                      <span className="capitalize">
                        {a.appointment_type.replace("_", " ")}
                      </span>
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatDateTime(a.scheduled_for)}
                      {a.reason ? ` · ${a.reason}` : ""}
                    </p>
                  </div>
                  <AppointmentStatusPill status={a.status} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="surface h-fit p-6">
        <h3 className="text-base font-semibold">Before your visit</h3>
        <ul className="mt-3 space-y-2 text-sm text-slate-600">
          <li>
            · Bring your medication list and any home blood-pressure readings
          </li>
          <li>
            · Your Agilance conversations are already shared with your clinician
          </li>
          <li>· Arrive 15 minutes early; bring insurance and photo ID</li>
          <li>· If symptoms worsen before the visit, call 911</li>
        </ul>
      </section>
    </div>
  );
}

function HistoryTab({
  summary,
  latest,
}: {
  summary: PatientSummary;
  latest: PathwayResult | null;
}) {
  const findings = latest?.findings;
  const symptoms = triState(findings?.symptoms);
  const history = triState(findings?.history);
  const pain = describeChestPain(findings?.chest_pain);
  const cad = latest?.chronic_pathways.find((c) => c.pathway === "cad_risk");
  const htn = latest?.chronic_pathways.find(
    (c) => c.pathway === "hypertension_management",
  );
  const dm = latest?.chronic_pathways.find(
    (c) => c.pathway === "diabetes_cardiometabolic",
  );
  const p = summary.patient;
  const yes = (v: string | undefined) => (v ?? "").toLowerCase() === "yes";

  return (
    <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <div className="space-y-6">
        <section className="surface p-6">
          <h3 className="text-base font-semibold">
            Symptoms from your last conversation
          </h3>
          <p className="text-xs text-slate-500">
            Extracted automatically by the assistant; tell your clinician if
            anything is wrong.
          </p>
          {pain.length > 0 && (
            <div className="mt-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200/60">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Chest pain
              </p>
              <p className="mt-1 text-sm text-slate-700">{pain.join(" · ")}</p>
            </div>
          )}
          <div className="mt-4 space-y-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Reported
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {symptoms.present.length === 0 && (
                  <span className="text-sm text-slate-400">None reported</span>
                )}
                {symptoms.present.map((k) => (
                  <FlagChip key={k} label={symptomLabel(k)} active />
                ))}
              </div>
            </div>
            {symptoms.absent.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Denied
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {symptoms.absent.map((k) => (
                    <FlagChip key={k} label={symptomLabel(k)} active={false} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="surface p-6">
          <h3 className="text-base font-semibold">
            Medical history &amp; risk factors
          </h3>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {history.present.map((k) => (
              <FlagChip key={k} label={historyLabel(k)} active />
            ))}
            {history.present.length === 0 && (
              <>
                <FlagChip label="Hypertension" active={yes(p.hypertension)} />
                <FlagChip label="Diabetes" active={yes(p.diabetes)} />
                <FlagChip
                  label="High cholesterol"
                  active={yes(p.hyperlipidemia)}
                />
                <FlagChip label="Smoking" active={yes(p.smoking)} />
              </>
            )}
            {history.absent.map((k) => (
              <FlagChip key={k} label={historyLabel(k)} active={false} />
            ))}
          </div>
          {findings?.medications && findings.medications.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Medications mentioned
              </p>
              <p className="mt-1 text-sm capitalize text-slate-700">
                {findings.medications.join(", ")}
              </p>
            </div>
          )}
        </section>
      </div>

      <div className="space-y-6">
        {cad && cad.probability != null && (
          <section className="surface p-6">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-600">
                <Activity className="h-4 w-4" />
              </span>
              <h3 className="text-base font-semibold">Coronary disease risk</h3>
            </div>
            <p className="mt-4 font-display text-3xl font-semibold tabular-nums">
              {cad.probability}%
            </p>
            <p className="text-xs text-slate-500">
              pre-test probability · {cad.band?.replace("_", " ")}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {cad.guidance}
            </p>
          </section>
        )}
        {htn && htn.status === "active" && (
          <section className="surface p-6">
            <h3 className="text-base font-semibold">Blood pressure plan</h3>
            <p className="mt-1 text-sm text-slate-600">
              {htn.summary} Target {htn.target}.
            </p>
            <ul className="mt-3 space-y-1.5 text-sm text-slate-600">
              {htn.recommendations?.slice(0, 4).map((r) => (
                <li key={r}>· {r}</li>
              ))}
            </ul>
          </section>
        )}
        {dm && dm.status === "active" && (
          <section className="surface p-6">
            <h3 className="text-base font-semibold">
              Diabetes &amp; heart health
            </h3>
            <p className="mt-1 text-sm text-slate-600">{dm.summary}</p>
            <ul className="mt-3 space-y-1.5 text-sm text-slate-600">
              {dm.recommendations?.slice(0, 4).map((r) => (
                <li key={r}>· {r}</li>
              ))}
            </ul>
          </section>
        )}
        {!latest && (
          <section className="surface p-6 text-sm text-slate-500">
            Complete an assessment to see your extracted symptoms, history and
            risk pathways here.
          </section>
        )}
      </div>
    </div>
  );
}

function NotesTab({ summary }: { summary: PatientSummary }) {
  const typeLabel: Record<string, string> = {
    progress: "Progress note",
    plan: "Care plan",
    follow_up: "Follow-up",
    message_to_patient: "Message",
  };
  return (
    <section className="surface overflow-hidden">
      <div className="border-b border-slate-100 px-6 py-4">
        <h3 className="text-base font-semibold">Doctor&apos;s notes</h3>
        <p className="text-xs text-slate-500">
          Only notes your clinicians chose to share with you appear here.
        </p>
      </div>
      {summary.notes.length === 0 ? (
        <p className="px-6 py-10 text-center text-sm text-slate-500">
          No notes yet.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {summary.notes.map((n) => (
            <li key={n.id} className="px-6 py-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-600 text-xs font-semibold text-white">
                  {initialsOf(n.author_name)}
                </span>
                <p className="text-sm font-semibold text-slate-900">
                  {n.author_name ?? "Clinician"}
                </p>
                <span className="chip bg-slate-50 text-slate-600 ring-slate-200/70">
                  {typeLabel[n.note_type] ?? n.note_type}
                </span>
                <span className="ml-auto text-xs text-slate-500">
                  {formatDateTime(n.created_at)}
                </span>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                {n.content}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Embedded assistant                                                  */
/* ------------------------------------------------------------------ */

function AssistantDrawer({
  open,
  onClose,
  onComplete,
}: {
  open: boolean;
  onClose: () => void;
  onComplete: (result: PathwayResult, patientId?: number) => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60]">
      <button
        type="button"
        aria-label="Close assistant"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-[2px]"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Agilance assistant"
        className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col bg-white shadow-lift animate-fade-up"
      >
        <div className="flex items-center justify-between border-b border-slate-200/70 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-50 text-brand-600">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold">Agilance assistant</p>
              <p className="text-xs text-slate-500">
                Triage, questions, and help organising your care
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Link
              href="/assessment?mode=voice"
              className="btn-ghost py-1.5 text-xs"
            >
              <Mic className="h-3.5 w-3.5" /> Voice
            </Link>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="grid h-9 w-9 place-items-center rounded-full text-slate-500 hover:bg-slate-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="flex min-h-0 flex-1 flex-col">
          <TextAssessment embedded onComplete={onComplete} />
        </div>
      </aside>
    </div>
  );
}
