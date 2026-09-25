import { CalendarPlus } from "lucide-react";
import { WORKER_GENDER_LABELS_UZ, WORKER_POSITION_LABELS_UZ, type StaffRole } from "@shodiyora/shared";
import type { WorkerSummary } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { WorkerActions } from "@/components/workers/worker-actions";
import { STATUS_BADGE } from "@/components/workers/position-meta";
import { formatDate } from "@/lib/utils";

export function WorkerTable({
  workers,
  role,
  onAssign,
}: {
  workers: WorkerSummary[];
  role: StaffRole;
  onAssign?: (worker: WorkerSummary) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <th className="whitespace-nowrap px-4 py-3">Ism-familiya</th>
            <th className="whitespace-nowrap px-4 py-3">Jinsi</th>
            <th className="whitespace-nowrap px-4 py-3">Lavozim</th>
            <th className="whitespace-nowrap px-4 py-3">Telefon</th>
            <th className="whitespace-nowrap px-4 py-3">Qo&apos;shilgan sana</th>
            <th className="whitespace-nowrap px-4 py-3">Status</th>
            <th className="whitespace-nowrap px-4 py-3 text-right">Amallar</th>
          </tr>
        </thead>
        <tbody>
          {workers.map((worker) => {
            const status = STATUS_BADGE[worker.status];
            return (
              <tr key={worker.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                <td className="whitespace-nowrap px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    {worker.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={worker.photoUrl} alt={worker.fullName} className="h-8 w-8 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
                        {worker.fullName.slice(0, 1).toUpperCase()}
                      </div>
                    )}
                    <span className="font-medium">{worker.fullName}</span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                  {worker.gender ? WORKER_GENDER_LABELS_UZ[worker.gender] : "—"}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                  {WORKER_POSITION_LABELS_UZ[worker.position]}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{worker.phone}</td>
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{formatDate(worker.createdAt)}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  <Badge variant={status.variant}>{status.label}</Badge>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    {onAssign && worker.status === "APPROVED" && worker.position !== "CHEF" && (
                      <button
                        type="button"
                        onClick={() => onAssign(worker)}
                        aria-label="To'yga belgilash"
                        className="flex h-8 w-8 items-center justify-center rounded-md text-primary transition-colors hover:bg-primary/10"
                      >
                        <CalendarPlus className="h-4 w-4" />
                      </button>
                    )}
                    <WorkerActions workerId={worker.id} status={worker.status} role={role} position={worker.position} />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {workers.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">Hech kim topilmadi.</p>}
    </div>
  );
}
