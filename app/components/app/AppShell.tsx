"use client";

import { useState, type ComponentType, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, LogOut, Menu, Search, X } from "lucide-react";
import Logo from "../brand/Logo";
import { cn } from "@/lib/utils";

export type NavItem = {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  badge?: string | number;
};

export type ShellUser = {
  name: string;
  role: string;
  initials: string;
};

type AppShellProps = {
  nav: NavItem[];
  user: ShellUser;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  onSignOut?: () => void;
  /** Override the active nav href (e.g. when tabs live in a query string). */
  activeHref?: string;
  children: ReactNode;
};

/**
 * Authenticated application chrome shared by the patient and clinician
 * experiences: a calm sidebar, a slim top bar and a scrollable content area.
 */
export default function AppShell({
  nav,
  user,
  title,
  subtitle,
  actions,
  onSignOut,
  activeHref,
  children,
}: AppShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (activeHref) return href === activeHref;
    return pathname === href || (href !== "/" && pathname?.startsWith(href + "/"));
  };

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-[72px] items-center justify-between px-6">
        <Logo />
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
          className="grid h-9 w-9 place-items-center rounded-full text-slate-500 hover:bg-slate-100 lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-4 pt-2" aria-label="Sidebar">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-brand-50 text-brand-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              )}
            >
              <Icon
                className={cn(
                  "h-[18px] w-[18px] shrink-0",
                  active ? "text-brand-600" : "text-slate-400 group-hover:text-slate-600",
                )}
              />
              <span className="flex-1">{item.label}</span>
              {item.badge !== undefined && (
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums",
                    active
                      ? "bg-white text-brand-700"
                      : "bg-slate-100 text-slate-600",
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200/70 p-4">
        <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-600 text-sm font-semibold text-white">
            {user.initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-900">
              {user.name}
            </p>
            <p className="truncate text-xs text-slate-500">{user.role}</p>
          </div>
          {onSignOut && (
            <button
              type="button"
              onClick={onSignOut}
              aria-label="Sign out"
              title="Sign out"
              className="grid h-8 w-8 place-items-center rounded-full text-slate-400 transition hover:bg-white hover:text-slate-700"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F6F8FC]">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] border-r border-slate-200/70 bg-white lg:block">
        {sidebar}
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-slate-900/30 backdrop-blur-[2px]"
          />
          <aside className="absolute inset-y-0 left-0 w-[288px] max-w-[85vw] bg-white shadow-lift">
            {sidebar}
          </aside>
        </div>
      )}

      <div className="lg:pl-[264px]">
        <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/85 backdrop-blur-md">
          <div className="flex h-[72px] items-center gap-4 px-5 sm:px-8">
            <button
              type="button"
              aria-label="Open navigation"
              onClick={() => setMobileOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-full text-slate-700 hover:bg-slate-100 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="min-w-0 flex-1">
              <h1 className="truncate font-display text-lg font-semibold text-slate-900">
                {title}
              </h1>
              {subtitle && (
                <p className="truncate text-xs text-slate-500">{subtitle}</p>
              )}
            </div>

            <div className="hidden items-center gap-2 md:flex">
              <label className="relative">
                <span className="sr-only">Search</span>
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  placeholder="Search"
                  className="h-10 w-56 rounded-full bg-slate-100 pl-9 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-brand-500/40"
                />
              </label>
              <button
                type="button"
                aria-label="Notifications"
                className="relative grid h-10 w-10 place-items-center rounded-full text-slate-600 hover:bg-slate-100"
              >
                <Bell className="h-[18px] w-[18px]" />
                <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-brand-500 ring-2 ring-white" />
              </button>
            </div>
            {actions}
          </div>
        </header>

        <main className="px-5 py-6 sm:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
