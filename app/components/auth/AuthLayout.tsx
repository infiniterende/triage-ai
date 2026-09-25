import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import Logo from "../brand/Logo";

const POINTS = [
  "Prioritised patient queue sorted by cardiac risk",
  "Structured symptom and history capture",
  "Full assessment transcripts, one click away",
];

export default function AuthLayout({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-[1fr_1.1fr]">
      {/* Brand panel */}
      <aside className="relative hidden overflow-hidden bg-brand-600 p-12 text-white lg:flex lg:flex-col">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="relative">
          <Logo tone="light" />
        </div>
        <div className="relative mt-auto">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-100">
            Clinician portal
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold leading-tight text-white">
            See who needs you first.
          </h2>
          <ul className="mt-8 space-y-3">
            {POINTS.map((p) => (
              <li key={p} className="flex items-start gap-3 text-sm text-brand-50">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white/20">
                  <Check className="h-3 w-3" />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Form panel */}
      <main className="flex flex-col px-6 py-8 sm:px-12">
        <div className="flex items-center justify-between">
          <div className="lg:hidden">
            <Logo />
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-12">
          <h1 className="font-display text-3xl font-semibold">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-8 text-center text-sm text-slate-600">{footer}</div>}
        </div>
      </main>
    </div>
  );
}
