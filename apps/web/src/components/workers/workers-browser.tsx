"use client";

import { useMemo, useState } from "react";
import { LayoutGrid, List, Search, X } from "lucide-react";
import {
  WORKER_GENDERS,
  WORKER_GENDER_LABELS_UZ,
  WORKER_POSITIONS,
  WORKER_POSITION_LABELS_UZ,
  WORKER_STATUSES,
  type StaffRole,
  type WorkerGender,
  type WorkerPosition,
  type WorkerStatus,
} from "@shodiyora/shared";
import type { WorkerSummary } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { WorkerCard } from "@/components/workers/worker-card";
import { WorkerTable } from "@/components/workers/worker-table";
import { AssignWorkerModal, type StaffingEvent } from "@/components/workers/assign-worker-modal";
import { STATUS_BADGE } from "@/components/workers/position-meta";
import { cn } from "@/lib/utils";

type View = "card" | "table";

export function WorkersBrowser({
  workers,
  role,
  events,
}: {
  workers: WorkerSummary[];
  role: StaffRole;
  events: StaffingEvent[];
}) {
  const [query, setQuery] = useState("");
  const [position, setPosition] = useState<WorkerPosition | "ALL">("ALL");
  const [status, setStatus] = useState<WorkerStatus | "ALL">("ALL");
  const [gender, setGender] = useState<WorkerGender | "ALL">("ALL");
  const [view, setView] = useState<View>("card");
  const [assigning, setAssigning] = useState<WorkerSummary | null>(null);

  const q = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    return workers.filter((w) => {
      if (position !== "ALL" && w.position !== position) return false;
      if (status !== "ALL" && w.status !== status) return false;
      if (gender !== "ALL" && w.gender !== gender) return false;
      if (q && !(w.fullName.toLowerCase().includes(q) || w.phone.includes(q))) return false;
      return true;
    });
  }, [workers, position, status, gender, q]);

  const positionCounts = WORKER_POSITIONS.map((p) => ({
    position: p,
    label: WORKER_POSITION_LABELS_UZ[p],
    count: workers.filter((w) => w.position === p).length,
  })).filter((p) => p.count > 0);

  const hasFilters = position !== "ALL" || status !== "ALL" || gender !== "ALL" || q.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ism yoki telefon bo'yicha qidirish..."
            className="pl-9 pr-9"
          />
          {q && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Qidiruvni tozalash"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <Select value={status} onChange={(e) => setStatus(e.target.value as WorkerStatus | "ALL")} className="sm:w-40">
          <option value="ALL">Barcha holatlar</option>
          {WORKER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_BADGE[s].label}
            </option>
          ))}
        </Select>

        <Select value={gender} onChange={(e) => setGender(e.target.value as WorkerGender | "ALL")} className="sm:w-32">
          <option value="ALL">Jinsi: barcha</option>
          {WORKER_GENDERS.map((g) => (
            <option key={g} value={g}>
              {WORKER_GENDER_LABELS_UZ[g]}
            </option>
          ))}
        </Select>

        <div className="flex gap-1 rounded-lg border border-border bg-muted p-1 text-xs font-medium">
          <button
            type="button"
            onClick={() => setView("card")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-colors",
              view === "card" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
            )}
          >
            <LayoutGrid className="h-3.5 w-3.5" /> Kartochka
          </button>
          <button
            type="button"
            onClick={() => setView("table")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-colors",
              view === "table" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
            )}
          >
            <List className="h-3.5 w-3.5" /> Jadval
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setPosition("ALL")}
          className={cn(
            "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
            position === "ALL" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted",
          )}
        >
          Barchasi ({workers.length})
        </button>
        {positionCounts.map(({ position: p, label, count }) => (
          <button
            key={p}
            type="button"
            onClick={() => setPosition(p)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              position === p ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted",
            )}
          >
            {label} ({count})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            {hasFilters ? "Hech kim topilmadi." : "Hozircha ishchi yo'q."}
          </CardContent>
        </Card>
      ) : view === "card" ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((w) => (
            <WorkerCard key={w.id} worker={w} role={role} onAssign={setAssigning} />
          ))}
        </div>
      ) : (
        <WorkerTable workers={filtered} role={role} onAssign={setAssigning} />
      )}

      {assigning && (
        <AssignWorkerModal key={assigning.id} worker={assigning} events={events} onClose={() => setAssigning(null)} />
      )}
    </div>
  );
}
