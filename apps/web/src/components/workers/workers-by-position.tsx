"use client";

import { useState } from "react";
import { ArrowLeft, CalendarPlus, ChefHat, Users, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import type { StaffRole, WorkerPosition } from "@shodiyora/shared";
import { WORKER_POSITIONS, WORKER_POSITION_LABELS_UZ } from "@shodiyora/shared";
import type { WorkerSummary } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WorkerActions } from "@/components/workers/worker-actions";
import { AssignWorkerModal, type StaffingEvent } from "@/components/workers/assign-worker-modal";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

const STATUS_BADGE: Record<string, { label: string; variant: "default" | "success" | "destructive" }> = {
  PENDING: { label: "Kutilmoqda", variant: "default" },
  APPROVED: { label: "Tasdiqlangan", variant: "success" },
  REJECTED: { label: "Rad etilgan", variant: "destructive" },
};

const POSITION_ICON: Record<WorkerPosition, ReactNode> = {
  WAITER_MALE: <UserRound className="h-6 w-6" />,
  WAITER_FEMALE: <UserRound className="h-6 w-6" />,
  CHEF: <ChefHat className="h-6 w-6" />,
  OTHER: <Users className="h-6 w-6" />,
};

const POSITION_TONE: Record<WorkerPosition, string> = {
  WAITER_MALE: "bg-primary/10 text-primary",
  WAITER_FEMALE: "bg-accent/15 text-accent",
  CHEF: "bg-success/15 text-success",
  OTHER: "bg-muted text-foreground",
};

function WorkerRow({
  worker,
  role,
  onAssign,
}: {
  worker: WorkerSummary;
  role: StaffRole;
  onAssign?: (worker: WorkerSummary) => void;
}) {
  const status = STATUS_BADGE[worker.status];
  return (
    <div className="flex items-center gap-3 rounded-md border border-border p-3">
      {worker.photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={worker.photoUrl} alt={worker.fullName} className="h-12 w-12 rounded-full object-cover" />
      ) : (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-sm font-medium">
          {worker.fullName.slice(0, 1)}
        </div>
      )}
      <div className="flex-1">
        <p className="text-sm font-medium">{worker.fullName}</p>
        <p className="text-xs text-muted-foreground">
          {worker.phone} · {formatDate(worker.createdAt)}
        </p>
      </div>
      <Badge variant={status.variant}>{status.label}</Badge>
      {onAssign && worker.status === "APPROVED" && (
        <button
          type="button"
          onClick={() => onAssign(worker)}
          aria-label="To'yga belgilash"
          className="flex h-8 w-8 items-center justify-center rounded-md text-primary hover:bg-primary/10"
        >
          <CalendarPlus className="h-4 w-4" />
        </button>
      )}
      <WorkerActions workerId={worker.id} status={worker.status} role={role} />
    </div>
  );
}

export function WorkersByPosition({
  workers,
  role,
  events,
}: {
  workers: WorkerSummary[];
  role: StaffRole;
  events: StaffingEvent[];
}) {
  const [active, setActive] = useState<WorkerPosition | null>(null);
  const [assigning, setAssigning] = useState<WorkerSummary | null>(null);

  const groups = WORKER_POSITIONS.map((position) => {
    const positionWorkers = workers.filter((w) => w.position === position);
    return {
      position,
      label: WORKER_POSITION_LABELS_UZ[position],
      pending: positionWorkers.filter((w) => w.status === "PENDING"),
      others: positionWorkers.filter((w) => w.status !== "PENDING"),
    };
  }).filter((g) => g.pending.length + g.others.length > 0);

  const activeGroup = groups.find((g) => g.position === active);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ishchilar ro&apos;yxati</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {groups.length === 0 && <p className="text-sm text-muted-foreground">Hozircha ishchi yo&apos;q.</p>}

        {activeGroup ? (
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setActive(null)}
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> Orqaga
            </button>
            <p className="text-sm font-medium">{activeGroup.label}</p>

            {activeGroup.pending.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Tasdiqlashni kutmoqda
                </p>
                {activeGroup.pending.map((w) => (
                  <WorkerRow key={w.id} worker={w} role={role} onAssign={setAssigning} />
                ))}
              </div>
            )}

            {activeGroup.others.length > 0 && (
              <div className="space-y-2">
                {activeGroup.pending.length > 0 && (
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Ro&apos;yxat</p>
                )}
                {activeGroup.others.map((w) => (
                  <WorkerRow key={w.id} worker={w} role={role} onAssign={setAssigning} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {groups.map((group) => (
              <button
                key={group.position}
                type="button"
                onClick={() => setActive(group.position)}
                className="rounded-lg border border-border bg-card p-4 text-left shadow-sm transition-shadow hover:shadow-md"
              >
                <div className={cn("mb-3 flex h-11 w-11 items-center justify-center rounded-full", POSITION_TONE[group.position])}>
                  {POSITION_ICON[group.position]}
                </div>
                <p className="font-semibold">{group.label}</p>
                <p className="text-xs text-muted-foreground">{group.others.length} ta tasdiqlangan</p>
                {group.pending.length > 0 && (
                  <Badge variant="primary" className="mt-2">
                    {group.pending.length} kutilmoqda
                  </Badge>
                )}
              </button>
            ))}
          </div>
        )}
      </CardContent>

      {assigning && (
        <AssignWorkerModal
          key={assigning.id}
          worker={assigning}
          events={events}
          onClose={() => setAssigning(null)}
        />
      )}
    </Card>
  );
}
