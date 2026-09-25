/**
 * Thin client for the FastAPI backend (backend/main.py + care_api.py +
 * pathways/api.py). Every call throws on non-2xx so callers can fall back to
 * demo data with a visible notice instead of silently showing nothing.
 */

import type { PathwayResult } from "./pathway";
import type { PatientRecord } from "@/app/types";

export const API_BASE = process.env.NEXT_PUBLIC_API_ENDPOINT ?? "";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText}${detail ? ` — ${detail}` : ""}`);
  }
  return (await res.json()) as T;
}

/* ------------------------------------------------------------------ */
/* Shapes returned by care_api.py                                      */
/* ------------------------------------------------------------------ */

export interface ConversationSummary {
  session_id: string;
  source: "text" | "voice" | string;
  started_at: string | null;
  message_count: number;
  preview: string | null;
  risk_percent: number | null;
  disposition: string | null;
  primary_pathway: string | null;
  evaluation_id: number | null;
  assessment_complete: boolean;
}

export interface ChatTranscript {
  session_id: string;
  assessment_complete: boolean;
  messages: { id: number; role: "user" | "assistant"; content: string; created_at: string | null }[];
  pathway: PathwayResult | null;
}

export interface EvaluationRecord {
  id: number;
  session_id: string;
  source: string;
  patient_id: number | null;
  primary_pathway: string | null;
  disposition: string | null;
  risk_percent: number | null;
  result: PathwayResult;
  created_at: string | null;
}

export type AppointmentStatus = "requested" | "scheduled" | "completed" | "cancelled";

export interface Appointment {
  id: number;
  patient_id: number;
  doctor_id: number | null;
  doctor_name: string | null;
  scheduled_for: string;
  duration_minutes: number;
  appointment_type: string;
  status: AppointmentStatus;
  reason: string | null;
  location: string | null;
  pathway_evaluation_id: number | null;
  created_at: string | null;
}

export interface DoctorNote {
  id: number;
  patient_id: number;
  doctor_id: number | null;
  author_name: string | null;
  note_type: string;
  content: string;
  visible_to_patient: boolean;
  created_at: string | null;
}

export interface Doctor {
  id: number;
  name: string;
  email: string;
}

export interface PatientSummary {
  patient: PatientRecord & { created_at?: string | null };
  latest_evaluation: EvaluationRecord | null;
  conversations: ConversationSummary[];
  appointments: Appointment[];
  notes: DoctorNote[];
}

export interface PatientChart extends PatientSummary {
  evaluations: EvaluationRecord[];
  transcripts: { session_id: string; messages: ChatTranscript["messages"] }[];
}

export interface ClinicianPatientRow extends PatientRecord {
  created_at?: string | null;
  pathway: {
    evaluation_id: number;
    primary_pathway: string | null;
    primary_pathway_name: string | null;
    likelihood: string | null;
    disposition: string | null;
    risk_percent: number | null;
    red_flags: string[];
    evaluated_at: string | null;
  } | null;
}

/* ------------------------------------------------------------------ */
/* Calls                                                               */
/* ------------------------------------------------------------------ */

export const api = {
  patientSummary: (patientId: number) => request<PatientSummary>(`/api/patients/${patientId}/summary`),
  chatTranscript: (sessionId: string) => request<ChatTranscript>(`/api/chat/${encodeURIComponent(sessionId)}/messages`),
  patientAppointments: (patientId: number) => request<Appointment[]>(`/api/patients/${patientId}/appointments`),
  createAppointment: (body: {
    patient_id: number;
    doctor_id?: number | null;
    scheduled_for: string;
    duration_minutes?: number;
    appointment_type?: string;
    reason?: string;
    location?: string;
    pathway_evaluation_id?: number | null;
  }) => request<Appointment>(`/api/appointments`, { method: "POST", body: JSON.stringify(body) }),
  updateAppointment: (id: number, body: Partial<Pick<Appointment, "scheduled_for" | "doctor_id" | "status" | "reason" | "location" | "appointment_type">>) =>
    request<Appointment>(`/api/appointments/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  patientNotes: (patientId: number, includePrivate = false) =>
    request<DoctorNote[]>(`/api/patients/${patientId}/notes${includePrivate ? "?include_private=true" : ""}`),
  addNote: (patientId: number, body: { content: string; note_type?: string; author_name?: string; doctor_id?: number | null; visible_to_patient?: boolean }) =>
    request<DoctorNote>(`/api/patients/${patientId}/notes`, { method: "POST", body: JSON.stringify(body) }),
  doctors: () => request<Doctor[]>(`/api/doctors`),
  clinicianPatients: () => request<ClinicianPatientRow[]>(`/api/clinician/patients`),
  patients: () => request<PatientRecord[]>(`/api/patients`),
  patientChart: (patientId: number) => request<PatientChart>(`/api/clinician/patients/${patientId}`),
  pathwayCatalog: () => request<Record<string, unknown>>(`/api/pathway/catalog`),
  evaluateFindings: (findings: Record<string, unknown>) =>
    request<PathwayResult>(`/api/pathway/evaluate`, { method: "POST", body: JSON.stringify({ findings }) }),
};

/* ------------------------------------------------------------------ */
/* Local "who am I" for the patient experience                         */
/* ------------------------------------------------------------------ */

const PATIENT_KEY = "agilance.patient_id";

export function rememberPatientId(id: number | string | null | undefined): void {
  if (id == null) return;
  try {
    window.localStorage.setItem(PATIENT_KEY, String(id));
  } catch {
    /* storage unavailable */
  }
}

export function recallPatientId(): number | null {
  try {
    const raw = window.localStorage.getItem(PATIENT_KEY);
    const n = raw ? Number(raw) : NaN;
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}
