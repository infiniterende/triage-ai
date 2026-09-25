"use client";

import { Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PatientDashboard, { type PatientTab } from "../components/patient/PatientDashboard";

const TABS: PatientTab[] = ["overview", "conversations", "appointments", "history", "notes"];

function PatientPageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const rawTab = params.get("tab");
  const tab: PatientTab = TABS.includes(rawTab as PatientTab) ? (rawTab as PatientTab) : "overview";
  const patientParam = params.get("patient");
  const patientId = patientParam && Number.isFinite(Number(patientParam)) ? Number(patientParam) : null;
  const openScheduler = params.get("schedule") === "1";

  const onTabChange = useCallback(
    (next: PatientTab) => {
      const q = new URLSearchParams();
      q.set("tab", next);
      if (patientId != null) q.set("patient", String(patientId));
      router.replace(`/patient?${q.toString()}`, { scroll: false });
    },
    [router, patientId],
  );

  return (
    <PatientDashboard
      tab={tab}
      onTabChange={onTabChange}
      patientIdFromUrl={patientId}
      openScheduler={openScheduler}
    />
  );
}

export default function PatientPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F6F8FC]" />}>
      <PatientPageInner />
    </Suspense>
  );
}
