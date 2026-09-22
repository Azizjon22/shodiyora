"use client";

import { useTransition } from "react";
import { Check, X, Trash2 } from "lucide-react";
import { approveWorkerAction, rejectWorkerAction, deleteWorkerAction } from "@/lib/actions/workers.actions";
import type { StaffRole, WorkerStatus } from "@shodiyora/shared";

export function WorkerActions({
  workerId,
  status,
  role,
}: {
  workerId: string;
  status: WorkerStatus;
  role: StaffRole;
}) {
  const [isPending, startTransition] = useTransition();
  const canApprove = role === "SUPER_ADMIN" || role === "ADMIN";
  const canDelete = role === "SUPER_ADMIN";

  return (
    <div className="flex items-center gap-1">
      {status === "PENDING" && canApprove && (
        <>
          <button
            disabled={isPending}
            onClick={() => startTransition(() => approveWorkerAction(workerId))}
            className="flex h-8 w-8 items-center justify-center rounded-md text-success hover:bg-success/10 disabled:opacity-50"
            aria-label="Tasdiqlash"
          >
            <Check className="h-4 w-4" />
          </button>
          <button
            disabled={isPending}
            onClick={() => startTransition(() => rejectWorkerAction(workerId))}
            className="flex h-8 w-8 items-center justify-center rounded-md text-destructive hover:bg-destructive/10 disabled:opacity-50"
            aria-label="Rad etish"
          >
            <X className="h-4 w-4" />
          </button>
        </>
      )}
      {canDelete && (
        <button
          disabled={isPending}
          onClick={() => startTransition(() => deleteWorkerAction(workerId))}
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted disabled:opacity-50"
          aria-label="O'chirish"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
