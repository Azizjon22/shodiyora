"use client";

import { useState, useTransition } from "react";
import { Check, X, Trash2, KeyRound } from "lucide-react";
import {
  approveWorkerAction,
  rejectWorkerAction,
  deleteWorkerAction,
  resetWorkerPinAction,
} from "@/lib/actions/workers.actions";
import { Input } from "@/components/ui/input";
import type { StaffRole, WorkerPosition, WorkerStatus } from "@shodiyora/shared";

export function WorkerActions({
  workerId,
  status,
  role,
  position,
}: {
  workerId: string;
  status: WorkerStatus;
  role: StaffRole;
  position?: WorkerPosition;
}) {
  const [isPending, startTransition] = useTransition();
  const [resetting, setResetting] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [error, setError] = useState<string | undefined>();
  const canApprove = role === "SUPER_ADMIN" || role === "ADMIN";
  const canDelete = role === "SUPER_ADMIN";
  const canResetPin = canApprove && position === "CHEF" && status === "APPROVED";

  function run(action: () => Promise<{ error?: string }>) {
    startTransition(async () => {
      const result = await action();
      if (result?.error) window.alert(result.error);
    });
  }

  function submitReset() {
    setError(undefined);
    startTransition(async () => {
      const res = await resetWorkerPinAction(workerId, newPin);
      if (res?.error) {
        setError(res.error);
      } else {
        setResetting(false);
        setNewPin("");
      }
    });
  }

  if (resetting) {
    return (
      <div className="flex flex-col items-end gap-1">
        <div className="flex items-center gap-1">
          <Input
            value={newPin}
            onChange={(e) => setNewPin(e.target.value)}
            inputMode="numeric"
            maxLength={4}
            placeholder="Yangi PIN"
            className="h-8 w-24 text-sm"
            autoFocus
          />
          <button
            type="button"
            disabled={isPending}
            onClick={submitReset}
            className="flex h-8 items-center rounded-md bg-primary px-2 text-xs font-medium text-primary-foreground disabled:opacity-50"
          >
            Saqlash
          </button>
          <button
            type="button"
            onClick={() => {
              setResetting(false);
              setError(undefined);
              setNewPin("");
            }}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
            aria-label="Bekor qilish"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {status === "PENDING" && canApprove && (
        <>
          <button
            disabled={isPending}
            onClick={() => run(() => approveWorkerAction(workerId))}
            className="flex h-8 w-8 items-center justify-center rounded-md text-success hover:bg-success/10 disabled:opacity-50"
            aria-label="Tasdiqlash"
          >
            <Check className="h-4 w-4" />
          </button>
          <button
            disabled={isPending}
            onClick={() => run(() => rejectWorkerAction(workerId))}
            className="flex h-8 w-8 items-center justify-center rounded-md text-destructive hover:bg-destructive/10 disabled:opacity-50"
            aria-label="Rad etish"
          >
            <X className="h-4 w-4" />
          </button>
        </>
      )}
      {canResetPin && (
        <button
          disabled={isPending}
          onClick={() => setResetting(true)}
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted disabled:opacity-50"
          aria-label="PIN kodni tiklash"
          title="PIN kodni tiklash"
        >
          <KeyRound className="h-4 w-4" />
        </button>
      )}
      {canDelete && (
        <button
          disabled={isPending}
          onClick={() => run(() => deleteWorkerAction(workerId))}
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted disabled:opacity-50"
          aria-label="O'chirish"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
