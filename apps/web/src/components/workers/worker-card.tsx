import { CalendarPlus, Phone } from "lucide-react";
import { WORKER_GENDER_LABELS_UZ, WORKER_POSITION_LABELS_UZ, type StaffRole } from "@shodiyora/shared";
import type { WorkerSummary } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { WorkerActions } from "@/components/workers/worker-actions";
import { POSITION_TONE, STATUS_BADGE } from "@/components/workers/position-meta";
import { cn } from "@/lib/utils";

export function WorkerCard({
  worker,
  role,
  onAssign,
}: {
  worker: WorkerSummary;
  role: StaffRole;
  onAssign?: (worker: WorkerSummary) => void;
}) {
  const status = STATUS_BADGE[worker.status];
  const pending = worker.status === "PENDING";

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border p-4 transition-colors",
        pending ? "border-primary/30 bg-primary/[0.04]" : "border-border bg-card hover:border-input",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          {worker.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={worker.photoUrl} alt={worker.fullName} className="h-12 w-12 shrink-0 rounded-full object-cover" />
          ) : (
            <div
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                POSITION_TONE[worker.position],
              )}
            >
              {worker.fullName.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-tight">{worker.fullName}</p>
            <p className="text-xs text-muted-foreground">
              {WORKER_POSITION_LABELS_UZ[worker.position]}
              {worker.gender && ` · ${WORKER_GENDER_LABELS_UZ[worker.gender]}`}
            </p>
          </div>
        </div>
        <WorkerActions workerId={worker.id} status={worker.status} role={role} position={worker.position} />
      </div>

      <Badge variant={status.variant} className="w-fit">
        {status.label}
      </Badge>

      <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
        <a
          href={`tel:${worker.phone}`}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary"
        >
          <Phone className="h-3.5 w-3.5" /> {worker.phone}
        </a>
        {onAssign && worker.status === "APPROVED" && worker.position !== "CHEF" && (
          <button
            type="button"
            onClick={() => onAssign(worker)}
            aria-label="To'yga belgilash"
            className="flex h-7 w-7 items-center justify-center rounded-md text-primary transition-colors hover:bg-primary/10"
          >
            <CalendarPlus className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
