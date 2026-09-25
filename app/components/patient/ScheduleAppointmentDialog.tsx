"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { CalendarPlus, Loader2 } from "lucide-react";
import Modal from "../shared/Modal";
import { api, type Appointment, type Doctor } from "@/lib/api";
import type { DispositionRecommendation } from "@/lib/pathway";
import { toLocalInputValue } from "@/lib/format";

const TYPES = [
  { value: "follow_up", label: "Follow-up visit" },
  { value: "urgent", label: "Urgent evaluation" },
  { value: "new_patient", label: "New patient consult" },
  { value: "telehealth", label: "Telehealth" },
];

const FALLBACK_DOCTORS: Doctor[] = [
  { id: 2, name: "Dr. Priya Patel", email: "ppatel@example.org" },
  { id: 3, name: "Dr. Marcus Lee", email: "mlee@example.org" },
];

function suggestedStart(scheduling: DispositionRecommendation["scheduling"] | undefined): Date {
  const d = new Date();
  d.setSeconds(0, 0);
  if (scheduling === "same_day") {
    d.setHours(d.getHours() + 2);
  } else if (scheduling === "within_72_hours") {
    d.setDate(d.getDate() + 1);
    d.setHours(10, 0, 0, 0);
  } else {
    d.setDate(d.getDate() + 7);
    d.setHours(10, 0, 0, 0);
  }
  return d;
}

export default function ScheduleAppointmentDialog({
  open,
  onClose,
  patientId,
  disposition,
  evaluationId,
  defaultDoctorId,
  demo = false,
  onScheduled,
}: {
  open: boolean;
  onClose: () => void;
  patientId: number | null;
  disposition?: DispositionRecommendation | null;
  evaluationId?: number | null;
  defaultDoctorId?: number | null;
  /** When true the backend is unavailable; the appointment is added locally only. */
  demo?: boolean;
  onScheduled: (appointment: Appointment) => void;
}) {
  const [doctors, setDoctors] = useState<Doctor[]>(FALLBACK_DOCTORS);
  const [doctorId, setDoctorId] = useState<string>(defaultDoctorId ? String(defaultDoctorId) : "");
  const [when, setWhen] = useState(() => toLocalInputValue(suggestedStart(disposition?.scheduling)));
  const [type, setType] = useState(disposition?.level === "urgent" ? "urgent" : "follow_up");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setWhen(toLocalInputValue(suggestedStart(disposition?.scheduling)));
    setType(disposition?.level === "urgent" ? "urgent" : "follow_up");
    setReason(disposition?.reasons?.[0] ? `Agilance assessment: ${disposition.reasons[0]}` : "");
    setError(null);
    if (!demo) {
      api
        .doctors()
        .then((list) => {
          if (list.length) setDoctors(list);
        })
        .catch(() => undefined);
    }
  }, [open, disposition, demo]);

  const hint = useMemo(() => {
    switch (disposition?.scheduling) {
      case "same_day":
        return "Your assessment recommends same-day care. If you're unwell now, go to an emergency department instead of waiting for this appointment.";
      case "within_72_hours":
        return "Your assessment recommends being seen within 72 hours. We've suggested the next available morning.";
      case "routine":
        return "A routine visit within the next two weeks is appropriate.";
      default:
        return "Pick a time that works for you. Your care team will confirm.";
    }
  }, [disposition]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const scheduledFor = new Date(when);
    if (Number.isNaN(scheduledFor.getTime())) {
      setError("Please choose a valid date and time.");
      return;
    }
    const doctor = doctors.find((d) => String(d.id) === doctorId) ?? null;
    const draft: Appointment = {
      id: -Date.now(),
      patient_id: patientId ?? 0,
      doctor_id: doctor?.id ?? null,
      doctor_name: doctor?.name ?? null,
      scheduled_for: scheduledFor.toISOString(),
      duration_minutes: 30,
      appointment_type: type,
      status: "requested",
      reason: reason || null,
      location: null,
      pathway_evaluation_id: evaluationId ?? null,
      created_at: new Date().toISOString(),
    };

    if (demo || patientId == null) {
      onScheduled(draft);
      onClose();
      return;
    }

    setSubmitting(true);
    try {
      const created = await api.createAppointment({
        patient_id: patientId,
        doctor_id: doctor?.id ?? null,
        scheduled_for: scheduledFor.toISOString(),
        appointment_type: type,
        reason: reason || undefined,
        pathway_evaluation_id: evaluationId ?? null,
      });
      onScheduled(created);
      onClose();
    } catch (err) {
      console.error(err);
      setError("We couldn't save the appointment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Schedule an appointment"
      description="Request a visit with your care team. They'll confirm the time."
    >
      <form onSubmit={submit} className="space-y-5">
        <p className="rounded-2xl bg-brand-50/70 px-4 py-3 text-sm leading-6 text-brand-900 ring-1 ring-brand-100">
          {hint}
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="appt-doctor" className="field-label">
              Clinician
            </label>
            <select
              id="appt-doctor"
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
              className="field-input"
            >
              <option value="">Any available clinician</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="appt-when" className="field-label">
              Date &amp; time
            </label>
            <input
              id="appt-when"
              type="datetime-local"
              required
              value={when}
              min={toLocalInputValue(new Date())}
              onChange={(e) => setWhen(e.target.value)}
              className="field-input"
            />
          </div>
          <div>
            <label htmlFor="appt-type" className="field-label">
              Visit type
            </label>
            <select id="appt-type" value={type} onChange={(e) => setType(e.target.value)} className="field-input">
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="appt-reason" className="field-label">
              Reason for visit
            </label>
            <textarea
              id="appt-reason"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="What would you like to discuss?"
              className="field-input resize-none"
            />
          </div>
        </div>

        {error && (
          <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-100">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarPlus className="h-4 w-4" />}
            Request appointment
          </button>
        </div>
      </form>
    </Modal>
  );
}
