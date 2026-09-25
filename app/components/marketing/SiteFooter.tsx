"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Logo from "../brand/Logo";

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] =
  [
    {
      title: "Product",
      links: [
        { label: "Start an assessment", href: "/assessment" },
        { label: "Voice assistant", href: "/assessment?mode=voice" },
        { label: "How it works", href: "/#how-it-works" },
        { label: "Features", href: "/#features" },
      ],
    },
    {
      title: "Clinicians",
      links: [
        { label: "Clinician dashboard", href: "/dashboard" },
        { label: "Sign in", href: "/login" },
        { label: "Create an account", href: "/signup" },
      ],
    },
    {
      title: "Patients",
      links: [
        { label: "Patient home", href: "/patient" },
        { label: "When to call 911", href: "/#emergency" },
      ],
    },
  ];

export default function SiteFooter() {
  return (
    <footer id="contact" className="bg-slate-950 text-slate-300">
      <div className="container-x py-16">
        <div className="flex flex-col gap-8 border-b border-white/10 pb-12 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-md">
            <h2 className="font-display text-3xl font-semibold text-white">
              Let&apos;s connect
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Questions about bringing Agilance to your clinic, or feedback on
              the assessment? We read every message.
            </p>
          </div>
          <form
            className="flex w-full max-w-md items-center gap-2 rounded-full bg-white/5 p-1.5 ring-1 ring-white/10"
            onSubmit={(e) => e.preventDefault()}
          >
            <label htmlFor="footer-email" className="sr-only">
              Email address
            </label>
            <input
              id="footer-email"
              type="email"
              placeholder="Enter your email"
              className="min-w-0 flex-1 bg-transparent px-4 text-sm text-white placeholder:text-slate-500 focus:outline-none"
            />
            <button type="submit" className="btn-primary py-2">
              Contact
              <span className="btn-icon-pill">
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </button>
          </form>
        </div>

        <div className="grid gap-10 py-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Logo tone="light" />
            <p className="mt-4 max-w-xs text-sm leading-6 text-slate-400">
              Calm, evidence-informed chest pain triage for patients, with a
              clear queue for the clinicians who care for them.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold text-white">{col.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href + l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-slate-400 transition hover:text-white"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 pt-8 text-xs text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Agilance. All rights reserved.</p>
          <p className="max-w-xl md:text-right">
            Agilance provides general guidance and does not replace professional
            medical advice. If you have severe or worsening symptoms, call 911.
          </p>
        </div>
      </div>
    </footer>
  );
}
