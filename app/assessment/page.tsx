"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, ArrowLeft, MessageSquare, Mic, Phone } from "lucide-react";
import Logo from "../components/brand/Logo";
import TextAssessment from "../components/assessment/TextAssessment";
import VoiceAssessment from "../components/assessment/VoiceAssessment";
import type { ModeType } from "../types";
import { cn } from "@/lib/utils";

function AssessmentContent() {
  const router = useRouter();
  const params = useSearchParams();
  const initial: ModeType = params.get("mode") === "voice" ? "voice" : "text";
  const [mode, setMode] = useState<ModeType>(initial);

  useEffect(() => {
    setMode(params.get("mode") === "voice" ? "voice" : "text");
  }, [params]);

  const switchMode = (next: ModeType) => {
    setMode(next);
    router.replace(next === "voice" ? "/assessment?mode=voice" : "/assessment", {
      scroll: false,
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F6F8FC]">
      <header className="border-b border-slate-200/70 bg-white/85 backdrop-blur-md">
        <div className="container-x flex h-[72px] items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="hidden items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 sm:inline-flex"
            >
              <ArrowLeft className="h-4 w-4" /> Home
            </Link>
            <span className="hidden h-5 w-px bg-slate-200 sm:block" />
            <Logo />
          </div>
          <a
            href="tel:911"
            className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700 ring-1 ring-rose-100 hover:bg-rose-100"
          >
            <Phone className="h-3.5 w-3.5" />
            Emergency? Call 911
          </a>
        </div>
      </header>

      <main className="container-x flex flex-1 flex-col py-6 sm:py-10">
        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col">
          <div className="mb-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <div>
              <p className="eyebrow">Symptom assessment</p>
              <h1 className="mt-1 font-display text-2xl font-semibold sm:text-3xl">
                Let&apos;s talk about your chest pain
              </h1>
            </div>

            <div
              role="tablist"
              aria-label="Assessment mode"
              className="inline-flex rounded-full bg-white p-1 ring-1 ring-slate-200/80 shadow-sm"
            >
              {(
                [
                  { id: "text", label: "Text", icon: MessageSquare },
                  { id: "voice", label: "Voice", icon: Mic },
                ] as const
              ).map((t) => {
                const active = mode === t.id;
                return (
                  <button
                    key={t.id}
                    role="tab"
                    type="button"
                    aria-selected={active}
                    onClick={() => switchMode(t.id)}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition",
                      active
                        ? "bg-brand-600 text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-900",
                    )}
                  >
                    <t.icon className="h-4 w-4" />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50/70 px-4 py-3 text-sm text-amber-900">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <p>
              <span className="font-semibold">This is guidance, not a diagnosis.</span>{" "}
              If your symptoms are severe or getting worse, call 911 or go to
              the nearest emergency department.
            </p>
          </div>

          <section
            className="surface flex min-h-[560px] flex-1 flex-col overflow-hidden sm:h-[calc(100vh-320px)] sm:min-h-[600px]"
            aria-live="polite"
          >
            {mode === "text" ? (
              <TextAssessment key="text" />
            ) : (
              <VoiceAssessment key="voice" />
            )}
          </section>

          <p className="mt-5 text-center text-xs leading-5 text-slate-500">
            Agilance is for informational purposes only and does not replace
            advice from a qualified healthcare professional.
          </p>
        </div>
      </main>
    </div>
  );
}

export default function AssessmentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F6F8FC]" />}>
      <AssessmentContent />
    </Suspense>
  );
}
