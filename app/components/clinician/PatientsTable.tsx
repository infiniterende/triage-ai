"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Search, ShieldAlert } from "lucide-react";
import type { ClinicianPatientRow } from "@/lib/api";
import type { DispositionLevel } from "@/lib/pathway";
import { FlagChip, RiskBadge, riskLevelFromPercent, toPercent } from "../shared/RiskBadge";
import { DispositionPill } from "../pathway/PathwayResultCard";
import { initialsOf } from "@/lib/format";
import { cn } from "@/lib/utils";

const yes = (v: string | undefined) => (v ?? "").trim().toLowerCase() === "yes";

/** Headline risk: the pathway engine's number when available, else the CAD model. */
export function rowRisk(p: ClinicianPatientRow): number {
  return p.pathway?.risk_percent ?? toPercent(p.probability);
}

const columns: ColumnDef<ClinicianPatientRow>[] = [
  {
    id: "patient",
    accessorFn: (r) => r.name,
    header: "Patient",
    cell: ({ row }) => {
      const p = row.original;
      return (
        <Link href={`/dashboard/patients/${p.id}`} className="group flex items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700">
            {initialsOf(p.name)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900 group-hover:text-brand-700">{p.name}</p>
            <p className="text-xs text-slate-500">
              {p.age} · {p.gender} · {p.phone_number}
            </p>
          </div>
        </Link>
      );
    },
  },
  {
    id: "pathway",
    accessorFn: (r) => r.pathway?.disposition ?? "",
    header: "Pathway",
    cell: ({ row }) => {
      const pw = row.original.pathway;
      if (!pw) return <span className="text-xs text-slate-400">Not evaluated</span>;
      return (
        <div className="flex flex-col items-start gap-1">
          <div className="flex items-center gap-1.5">
            {pw.disposition && <DispositionPill level={pw.disposition as DispositionLevel} />}
            {pw.red_flags.length > 0 && (
              <span className="chip bg-rose-50 text-rose-700 ring-rose-600/15" title={pw.red_flags.join("; ")}>
                <ShieldAlert className="h-3 w-3" /> {pw.red_flags.length}
              </span>
            )}
          </div>
          {pw.primary_pathway_name && <p className="text-xs text-slate-600">{pw.primary_pathway_name}</p>}
        </div>
      );
    },
  },
  {
    id: "pain",
    accessorFn: (r) => r.pain_quality,
    header: "Pain",
    cell: ({ row }) => {
      const p = row.original;
      return (
        <div>
          <p className="text-sm capitalize text-slate-800">{p.pain_quality || "—"}</p>
          <p className="text-xs text-slate-500">{yes(p.location) ? "Substernal" : "Not substernal"}</p>
        </div>
      );
    },
  },
  {
    id: "factors",
    header: "Risk factors",
    enableSorting: false,
    cell: ({ row }) => {
      const p = row.original;
      return (
        <div className="flex flex-wrap gap-1.5">
          <FlagChip label="HTN" active={yes(p.hypertension)} />
          <FlagChip label="DM" active={yes(p.diabetes)} />
          <FlagChip label="HLD" active={yes(p.hyperlipidemia)} />
          <FlagChip label="Smoking" active={yes(p.smoking)} />
          <FlagChip label="SOB" active={yes(p.sob)} />
        </div>
      );
    },
  },
  {
    id: "risk",
    accessorFn: (r) => rowRisk(r),
    header: "Risk",
    cell: ({ getValue }) => {
      const pct = getValue<number>();
      return (
        <div className="flex items-center justify-end gap-3">
          <div className="hidden h-1.5 w-20 overflow-hidden rounded-full bg-slate-100 md:block">
            <div
              className={cn("h-full rounded-full", pct >= 80 ? "bg-rose-500" : pct >= 50 ? "bg-amber-500" : "bg-emerald-500")}
              style={{ width: `${pct}%` }}
            />
          </div>
          <RiskBadge level={riskLevelFromPercent(pct)} percent={pct} />
        </div>
      );
    },
  },
];

export default function PatientsTable({
  data,
  compact = false,
  pageSize = 10,
}: {
  data: ClinicianPatientRow[];
  /** Hide the toolbar and pagination for embedded overview use. */
  compact?: boolean;
  pageSize?: number;
}) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "risk", desc: true }]);
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _columnId, value) =>
      (row.original.name ?? "").toLowerCase().includes(String(value).toLowerCase()),
    getRowId: (row) => String(row.id),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  });

  const total = table.getFilteredRowModel().rows.length;
  const { pageIndex } = table.getState().pagination;
  const from = total === 0 ? 0 : pageIndex * pageSize + 1;
  const to = Math.min(total, (pageIndex + 1) * pageSize);

  const rows = table.getRowModel().rows;
  const emptyMessage = useMemo(
    () => (globalFilter ? "No patients match your search." : "No patients yet."),
    [globalFilter],
  );

  return (
    <div className="surface overflow-hidden">
      {!compact && (
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-semibold">All patients</h3>
            <p className="text-xs text-slate-500">Sorted by estimated cardiac risk, highest first. Click a patient to open their chart.</p>
          </div>
          <label className="relative w-full sm:w-72">
            <span className="sr-only">Search patients</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search by name"
              className="h-10 w-full rounded-full bg-slate-100 pl-9 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-brand-500/40"
            />
          </label>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[880px] text-sm">
          <thead className="bg-slate-50/80">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();
                  const isRisk = header.column.id === "risk";
                  return (
                    <th
                      key={header.id}
                      scope="col"
                      className={cn(
                        "px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500",
                        isRisk && "text-right",
                      )}
                    >
                      {canSort ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className={cn("inline-flex items-center gap-1 rounded-md hover:text-slate-800", isRisk && "flex-row-reverse")}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {sorted === "asc" ? (
                            <ArrowUp className="h-3 w-3" />
                          ) : sorted === "desc" ? (
                            <ArrowDown className="h-3 w-3" />
                          ) : (
                            <ArrowUpDown className="h-3 w-3 opacity-50" />
                          )}
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-14 text-center text-sm text-slate-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="transition hover:bg-slate-50/70">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-5 py-3.5 align-middle">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!compact && total > 0 && (
        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
          <span>
            Showing <span className="font-medium text-slate-800">{from}–{to}</span> of{" "}
            <span className="font-medium text-slate-800">{total}</span>
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              aria-label="Previous page"
              className="grid h-8 w-8 place-items-center rounded-full text-slate-600 hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-2 tabular-nums">
              {pageIndex + 1} / {Math.max(1, table.getPageCount())}
            </span>
            <button
              type="button"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              aria-label="Next page"
              className="grid h-8 w-8 place-items-center rounded-full text-slate-600 hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
