"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";
import Logo from "../brand/Logo";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "Features", href: "/#features" },
  { label: "For clinicians", href: "/#clinicians" },
  { label: "Contact", href: "/#contact" },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-slate-200/70 bg-white/85 backdrop-blur-md"
          : "bg-transparent",
      )}
    >
      <div className="container-x flex h-[72px] items-center justify-between">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link href="/login" className="btn-ghost">
            Clinician sign in
          </Link>
          <Link href="/assessment" className="btn-primary">
            Start assessment
            <span className="btn-icon-pill">
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        </div>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="grid h-10 w-10 place-items-center rounded-full text-slate-700 hover:bg-slate-100 md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-200/70 bg-white md:hidden">
          <div className="container-x flex flex-col gap-1 py-4">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-2">
              <Link
                href="/assessment"
                onClick={() => setOpen(false)}
                className="btn-primary justify-center"
              >
                Start assessment
              </Link>
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="btn-secondary justify-center"
              >
                Clinician sign in
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
