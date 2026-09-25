import Link from "next/link";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  CalendarCheck,
  Check,
  ClipboardList,
  Clock,
  Gauge,
  HeartPulse,
  Mic,
  MicOff,
  MessageSquare,
  Phone,
  PhoneOff,
  ShieldCheck,
  Stethoscope,
  Users,
  Volume2,
  Wind,
  Zap,
} from "lucide-react";
import SiteHeader from "./components/marketing/SiteHeader";
import SiteFooter from "./components/marketing/SiteFooter";
import { LogoMark } from "./components/brand/Logo";
import { RiskBadge } from "./components/shared/RiskBadge";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Small presentational helpers used by the illustrative UI mock-ups   */
/* ------------------------------------------------------------------ */

function Bubble({
  role,
  children,
  className,
}: {
  role: "assistant" | "user";
  children: React.ReactNode;
  className?: string;
}) {
  const isUser = role === "user";
  return (
    <div
      className={cn("flex items-end gap-2", isUser && "flex-row-reverse", className)}
    >
      {!isUser && (
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white ring-1 ring-slate-200">
          <LogoMark className="h-4 w-4" />
        </span>
      )}
      <p
        className={cn(
          "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-5",
          isUser
            ? "rounded-br-md bg-brand-600 text-white"
            : "rounded-bl-md bg-white text-slate-700 shadow-sm ring-1 ring-slate-200/70",
        )}
      >
        {children}
      </p>
    </div>
  );
}

function WaveBars({ bars = 9, className }: { bars?: number; className?: string }) {
  return (
    <div className={cn("flex h-10 items-center justify-center gap-1.5", className)}>
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          className="block w-1.5 origin-center rounded-full bg-brand-500 animate-wave"
          style={{
            height: `${[14, 24, 34, 40, 30, 38, 26, 20, 12][i % 9]}px`,
            animationDelay: `${(i % 5) * 0.12}s`,
          }}
        />
      ))}
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
}: {
  eyebrow: string;
  title: React.ReactNode;
  description?: string;
  align?: "center" | "left";
}) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" ? "mx-auto text-center" : "text-left",
      )}
    >
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-3 font-display text-3xl font-semibold leading-tight sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base leading-7 text-slate-600">{description}</p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <SiteHeader />

      <main className="flex-1">
        {/* ------------------------------------------------------------ */}
        {/* Hero                                                          */}
        {/* ------------------------------------------------------------ */}
        <section className="container-x pt-4 sm:pt-6">
          <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
            {/* Copy card */}
            <div className="relative overflow-hidden rounded-4xl bg-hero-glow p-8 ring-1 ring-slate-200/60 sm:p-12 lg:p-14">
              <div className="absolute inset-0 bg-grid-faint bg-[size:32px_32px] opacity-40 [mask-image:radial-gradient(70%_70%_at_30%_20%,black,transparent)]" />
              <div className="relative animate-fade-up">
                <span className="chip bg-white/80 text-brand-700 ring-brand-600/15 backdrop-blur">
                  <HeartPulse className="h-3.5 w-3.5" />
                  AI-guided chest pain triage
                </span>
                <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.08] sm:text-5xl lg:text-[56px]">
                  Understand your chest pain with{" "}
                  <span className="text-brand-600">expert-guided</span> care
                </h1>
                <p className="mt-6 max-w-lg text-base leading-7 text-slate-600 sm:text-lg">
                  Answer a few calm, clinically-structured questions by text or
                  voice. In minutes, Agilance gives you a clear risk picture and
                  the right next step — and lets your care team see who needs
                  attention first.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link href="/assessment" className="btn-primary px-6 py-3 text-[15px]">
                    Start assessment
                    <span className="btn-icon-pill">
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </Link>
                  <Link
                    href="/assessment?mode=voice"
                    className="btn-secondary px-6 py-3 text-[15px]"
                  >
                    <Mic className="h-4 w-4 text-brand-600" />
                    Talk to the voice assistant
                  </Link>
                </div>
                <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
                  {["No account needed", "About 3 minutes", "Private by design"].map(
                    (t) => (
                      <li key={t} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-brand-600" />
                        {t}
                      </li>
                    ),
                  )}
                </ul>
              </div>
            </div>

            {/* Live session mock */}
            <div className="relative overflow-hidden rounded-4xl bg-gradient-to-br from-brand-50 via-white to-cyan-50 p-5 ring-1 ring-slate-200/60 sm:p-6">
              <div className="flex items-center justify-between">
                <span className="chip bg-white text-slate-700 ring-slate-200/80 shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 animate-pulse-ring" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  Voice assistant · listening
                </span>
                <span className="text-xs font-medium tabular-nums text-slate-400">
                  01:24
                </span>
              </div>

              <div className="mt-6 space-y-3">
                <Bubble role="assistant">
                  Hi, I&apos;m Agilance. Can you tell me where the pain is and
                  what it feels like?
                </Bubble>
                <Bubble role="user">
                  A tight pressure in the centre of my chest, since this
                  morning.
                </Bubble>
                <Bubble role="assistant">
                  Thank you. Does it spread to your arm, jaw or back?
                </Bubble>
              </div>

              <div className="mt-6 rounded-2xl bg-white/80 p-4 ring-1 ring-slate-200/70 backdrop-blur">
                <WaveBars />
                <div className="mt-4 flex items-center justify-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-slate-100 text-slate-700">
                    <MicOff className="h-[18px] w-[18px]" />
                  </span>
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-rose-500 text-white shadow-[0_8px_20px_-8px_rgba(225,29,72,.7)]">
                    <PhoneOff className="h-5 w-5" />
                  </span>
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-slate-100 text-slate-700">
                    <Volume2 className="h-[18px] w-[18px]" />
                  </span>
                </div>
              </div>

              <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-brand-200/40 blur-3xl" />
            </div>
          </div>

          {/* Trust strip */}
          <dl className="mt-10 grid grid-cols-2 gap-6 border-y border-slate-200/70 py-8 sm:grid-cols-4">
            {[
              { k: "~3 min", v: "Average assessment" },
              { k: "10+", v: "Risk factors considered" },
              { k: "24/7", v: "Available, text or voice" },
              { k: "Instant", v: "Clinician-ready summary" },
            ].map((s) => (
              <div key={s.v}>
                <dt className="font-display text-2xl font-semibold text-slate-900">
                  {s.k}
                </dt>
                <dd className="mt-1 text-sm text-slate-500">{s.v}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ------------------------------------------------------------ */}
        {/* Features                                                      */}
        {/* ------------------------------------------------------------ */}
        <section id="features" className="container-x scroll-mt-24 py-20 sm:py-24">
          <SectionHeading
            eyebrow="Features"
            title={
              <>
                Everything you need to make a calm,
                <br className="hidden sm:block" /> informed decision
              </>
            }
            description="Built around the questions a cardiologist would ask — delivered in a way that feels like a conversation, not a form."
          />

          <div className="mt-14 grid gap-5 lg:grid-cols-2">
            {/* Text assessment */}
            <article className="surface overflow-hidden">
              <div className="p-8">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-600 text-white">
                  <MessageSquare className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-xl font-semibold">
                  Guided text assessment
                </h3>
                <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
                  Answer at your own pace. Agilance asks one clear question at a
                  time and adapts based on what you share.
                </p>
              </div>
              <div className="mx-8 mb-8 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200/60">
                <div className="space-y-3">
                  <Bubble role="assistant">
                    How would you describe the pain — sharp, pressure-like,
                    burning, or a dull ache?
                  </Bubble>
                  <Bubble role="user">Pressure-like, mostly in the centre.</Bubble>
                  <Bubble role="assistant">
                    Does it get worse with activity, like stairs or walking
                    uphill?
                  </Bubble>
                </div>
                <div className="mt-4 flex items-center gap-2 rounded-full bg-white px-4 py-2.5 ring-1 ring-slate-200/80">
                  <span className="flex-1 text-[13px] text-slate-400">
                    Type your answer…
                  </span>
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-600 text-white">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            </article>

            {/* Voice assistant */}
            <article className="surface overflow-hidden">
              <div className="p-8">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-600 text-white">
                  <Mic className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-xl font-semibold">
                  Hands-free voice assistant
                </h3>
                <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
                  When typing is hard, just talk. A natural voice conversation
                  with a live transcript you can review afterwards.
                </p>
              </div>
              <div className="mx-8 mb-8 rounded-2xl bg-gradient-to-br from-brand-50 to-cyan-50 p-6 ring-1 ring-slate-200/60">
                <div className="flex items-center justify-between">
                  <span className="chip bg-white text-brand-700 ring-brand-600/15">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
                    Listening
                  </span>
                  <span className="text-xs text-slate-500">Tap to pause</span>
                </div>
                <WaveBars bars={13} className="mt-6 h-16" />
                <p className="mt-5 rounded-xl bg-white/80 px-4 py-3 text-[13px] leading-5 text-slate-600 ring-1 ring-slate-200/70">
                  “It started about an hour ago while I was carrying groceries
                  up the stairs…”
                </p>
              </div>
            </article>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-3">
            <article className="surface p-7">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600">
                <Gauge className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-lg font-semibold">
                Evidence-informed risk score
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Symptoms, history and risk factors are weighed the way a
                cardiology triage would weigh them.
              </p>
              <div className="mt-5">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Estimated cardiac risk</span>
                  <span className="font-semibold text-slate-900">34%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full w-[34%] rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-amber-500" />
                </div>
                <div className="mt-2 flex justify-between text-[11px] text-slate-400">
                  <span>Low</span>
                  <span>Moderate</span>
                  <span>High</span>
                </div>
              </div>
            </article>

            <article className="surface p-7">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600">
                <Users className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-lg font-semibold">Clinician queue</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Every assessment lands in a prioritised list so your team sees
                the highest-risk patients first.
              </p>
              <ul className="mt-5 space-y-2">
                {[
                  { n: "M. Alvarez", a: "58 · M", l: "high" as const, p: 86 },
                  { n: "J. Chen", a: "47 · F", l: "moderate" as const, p: 61 },
                  { n: "R. Okafor", a: "39 · M", l: "low" as const, p: 18 },
                ].map((r) => (
                  <li
                    key={r.n}
                    className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-[13px]"
                  >
                    <span>
                      <span className="font-medium text-slate-800">{r.n}</span>
                      <span className="ml-2 text-slate-400">{r.a}</span>
                    </span>
                    <RiskBadge level={r.l} percent={r.p} />
                  </li>
                ))}
              </ul>
            </article>

            <article className="surface p-7">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600">
                <CalendarCheck className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-lg font-semibold">Clear next steps</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Whether it&apos;s monitoring at home, a cardiology visit or
                urgent care, you leave knowing exactly what to do.
              </p>
              <div className="mt-5 rounded-2xl border border-brand-100 bg-brand-50/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">
                  Recommendation
                </p>
                <p className="mt-1.5 text-sm font-medium text-slate-900">
                  Schedule a cardiology appointment within 48 hours
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Your summary is ready to share with the clinic.
                </p>
              </div>
            </article>
          </div>
        </section>

        {/* ------------------------------------------------------------ */}
        {/* How it works                                                  */}
        {/* ------------------------------------------------------------ */}
        <section id="how-it-works" className="scroll-mt-24 bg-[#F6F8FC] py-20 sm:py-24">
          <div className="container-x">
            <SectionHeading
              eyebrow="How it works"
              title="Three calm steps, start to finish"
            />
            <ol className="relative mt-14 grid gap-6 md:grid-cols-3">
              <div className="pointer-events-none absolute left-[16.6%] right-[16.6%] top-9 hidden h-px bg-gradient-to-r from-transparent via-brand-200 to-transparent md:block" />
              {[
                {
                  n: "01",
                  icon: ClipboardList,
                  t: "Tell us what you're feeling",
                  d: "Pick text or voice. Agilance asks about the pain, where it spreads, what triggers it and your history.",
                },
                {
                  n: "02",
                  icon: Activity,
                  t: "We weigh the signals",
                  d: "Your answers are scored against established cardiac risk factors to estimate how urgent things are.",
                },
                {
                  n: "03",
                  icon: Stethoscope,
                  t: "Get a clear next step",
                  d: "See your risk level, a plain-language recommendation, and connect with a clinician if needed.",
                },
              ].map((s) => (
                <li key={s.n} className="surface relative p-7">
                  <span className="grid h-[72px] w-[72px] place-items-center rounded-2xl bg-white ring-1 ring-slate-200/80 shadow-sm">
                    <s.icon className="h-7 w-7 text-brand-600" />
                  </span>
                  <p className="mt-5 text-xs font-semibold tracking-[0.2em] text-brand-600">
                    STEP {s.n}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold">{s.t}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{s.d}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ------------------------------------------------------------ */}
        {/* What we assess                                                */}
        {/* ------------------------------------------------------------ */}
        <section className="container-x py-20 sm:py-24">
          <SectionHeading
            eyebrow="What we assess"
            title="The same questions a cardiologist would ask"
            description="Each conversation covers the signals that matter most for chest pain, so nothing important is missed."
          />
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: HeartPulse,
                t: "Pain character",
                d: "Sharp, pressure-like, burning or dull — and how long it has lasted.",
              },
              {
                icon: Activity,
                t: "Where it spreads",
                d: "Radiation to the arm, jaw, neck, back or shoulders.",
              },
              {
                icon: Zap,
                t: "Triggers",
                d: "Whether exertion or emotional stress brings the pain on.",
              },
              {
                icon: Wind,
                t: "Associated symptoms",
                d: "Shortness of breath, sweating, nausea or light-headedness.",
              },
              {
                icon: ClipboardList,
                t: "Medical history",
                d: "Hypertension, diabetes, high cholesterol and prior cardiac events.",
              },
              {
                icon: ShieldCheck,
                t: "Lifestyle risk factors",
                d: "Smoking, age and sex — weighed together rather than in isolation.",
              },
            ].map((c) => (
              <div
                key={c.t}
                className="group rounded-3xl bg-white p-6 ring-1 ring-slate-200/70 transition hover:-translate-y-0.5 hover:shadow-soft"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-50 text-brand-600 ring-1 ring-slate-200/70 transition group-hover:bg-brand-50">
                  <c.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold">{c.t}</h3>
                <p className="mt-1.5 text-sm leading-6 text-slate-600">{c.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ------------------------------------------------------------ */}
        {/* For clinicians                                                */}
        {/* ------------------------------------------------------------ */}
        <section id="clinicians" className="scroll-mt-24 bg-[#F6F8FC] py-20 sm:py-24">
          <div className="container-x grid items-center gap-12 lg:grid-cols-2">
            <div>
              <SectionHeading
                align="left"
                eyebrow="For clinicians"
                title="See who needs you first — at a glance"
                description="A calm dashboard that turns every patient conversation into a structured, sortable summary: symptoms, history, risk factors and an estimated cardiac risk."
              />
              <ul className="mt-8 space-y-3">
                {[
                  "Prioritised patient queue sorted by risk",
                  "Structured symptom and history capture, no free-text hunting",
                  "One-click review of the full assessment transcript",
                  "Works alongside your existing scheduling",
                ].map((b) => (
                  <li key={b} className="flex items-start gap-3 text-sm text-slate-700">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-600 text-white">
                      <Check className="h-3 w-3" />
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/dashboard" className="btn-primary">
                  Open the clinician dashboard
                  <span className="btn-icon-pill">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
                <Link href="/signup" className="btn-secondary">
                  Create a clinician account
                </Link>
              </div>
            </div>

            {/* Dashboard mock */}
            <div className="surface overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div className="flex items-center gap-2">
                  <LogoMark className="h-6 w-6" />
                  <span className="text-sm font-semibold">Clinician overview</span>
                </div>
                <span className="chip bg-emerald-50 text-emerald-700 ring-emerald-600/15">
                  Live
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 p-5">
                {[
                  { l: "Patients", v: "128" },
                  { l: "High risk", v: "9", c: "text-rose-600" },
                  { l: "Avg. risk", v: "31%" },
                ].map((s) => (
                  <div key={s.l} className="rounded-2xl bg-slate-50 p-3.5">
                    <p className="text-[11px] font-medium text-slate-500">{s.l}</p>
                    <p
                      className={cn(
                        "mt-1 font-display text-xl font-semibold tabular-nums",
                        s.c ?? "text-slate-900",
                      )}
                    >
                      {s.v}
                    </p>
                  </div>
                ))}
              </div>
              <div className="px-5 pb-5">
                <div className="overflow-hidden rounded-2xl ring-1 ring-slate-200/70">
                  <div className="grid grid-cols-[1.4fr_1fr_1fr_0.9fr] bg-slate-50 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    <span>Patient</span>
                    <span>Pain</span>
                    <span>Factors</span>
                    <span className="text-right">Risk</span>
                  </div>
                  {[
                    { n: "M. Alvarez", a: "58 · M", p: "Pressure", f: "HTN, DM", l: "high" as const, s: 86 },
                    { n: "J. Chen", a: "47 · F", p: "Squeezing", f: "Smoking", l: "moderate" as const, s: 61 },
                    { n: "R. Okafor", a: "39 · M", p: "Sharp", f: "—", l: "low" as const, s: 18 },
                    { n: "L. Novak", a: "64 · F", p: "Burning", f: "HLD", l: "moderate" as const, s: 54 },
                  ].map((r) => (
                    <div
                      key={r.n}
                      className="grid grid-cols-[1.4fr_1fr_1fr_0.9fr] items-center border-t border-slate-100 px-4 py-2.5 text-[13px]"
                    >
                      <span>
                        <span className="font-medium text-slate-800">{r.n}</span>
                        <span className="ml-1.5 text-slate-400">{r.a}</span>
                      </span>
                      <span className="text-slate-600">{r.p}</span>
                      <span className="text-slate-600">{r.f}</span>
                      <span className="flex justify-end">
                        <RiskBadge level={r.l} percent={r.s} />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------ */}
        {/* Emergency note + CTA                                          */}
        {/* ------------------------------------------------------------ */}
        <section id="emergency" className="container-x scroll-mt-24 py-20 sm:py-24">
          <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-rose-100 bg-rose-50/60 p-6 sm:flex-row sm:items-center">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white text-rose-600 ring-1 ring-rose-100">
              <Phone className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-900">
                If your chest pain is severe, crushing, or comes with trouble
                breathing, fainting or sweating — call 911 now.
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Agilance offers guidance, not emergency care. Don&apos;t wait
                for an assessment to finish.
              </p>
            </div>
            <a href="tel:911" className="btn-dark shrink-0 bg-rose-600 hover:bg-rose-700">
              <Phone className="h-4 w-4" />
              Call 911
            </a>
          </div>

          <div className="relative overflow-hidden rounded-4xl bg-brand-600 px-8 py-14 text-center text-white sm:px-16">
            <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -right-10 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" />
            <div className="relative mx-auto max-w-2xl">
              <h2 className="font-display text-3xl font-semibold text-white sm:text-4xl">
                Not sure whether your chest pain is serious?
              </h2>
              <p className="mt-4 text-base leading-7 text-brand-100">
                Take three minutes to talk it through. You&apos;ll leave with a
                clear picture and a calm plan.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  href="/assessment"
                  className="btn bg-white px-6 py-3 text-[15px] text-brand-700 hover:bg-brand-50"
                >
                  Start assessment
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-600 text-white">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
                <Link
                  href="/assessment?mode=voice"
                  className="btn px-6 py-3 text-[15px] text-white ring-1 ring-white/40 hover:bg-white/10"
                >
                  <Mic className="h-4 w-4" />
                  Use voice instead
                </Link>
              </div>
              <p className="mt-6 flex items-center justify-center gap-2 text-xs text-brand-100/90">
                <Clock className="h-3.5 w-3.5" />
                Available any time, on any device
              </p>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
