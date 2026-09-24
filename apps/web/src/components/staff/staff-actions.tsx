"use client";

import { useState, useTransition } from "react";
import { KeyRound, Power, Trash2, X } from "lucide-react";
import { toggleStaffActiveAction, deleteStaffAction, resetStaffPasswordAction } from "@/lib/actions/staff.actions";
import { PasswordInput } from "@/components/ui/input";

export function StaffActions({ staffId, isActive }: { staffId: string; isActive: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [resetting, setResetting] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | undefined>();

  function submitReset() {
    setError(undefined);
    startTransition(async () => {
      const res = await resetStaffPasswordAction(staffId, newPassword);
      if (res?.error) {
        setError(res.error);
      } else {
        setResetting(false);
        setNewPassword("");
      }
    });
  }

  if (resetting) {
    return (
      <div className="flex flex-col items-end gap-1">
        <div className="flex items-center gap-1">
          <PasswordInput
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Yangi vaqtinchalik parol"
            className="h-8 w-40 text-sm"
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
              setNewPassword("");
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
      <button
        disabled={isPending}
        onClick={() => setResetting(true)}
        className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted disabled:opacity-50"
        aria-label="Parolni tiklash"
        title="Parolni tiklash"
      >
        <KeyRound className="h-4 w-4" />
      </button>
      <button
        disabled={isPending}
        onClick={() => startTransition(() => toggleStaffActiveAction(staffId, !isActive))}
        className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted disabled:opacity-50"
        aria-label={isActive ? "Faolsizlantirish" : "Faollashtirish"}
      >
        <Power className={`h-4 w-4 ${isActive ? "text-success" : "text-destructive"}`} />
      </button>
      <button
        disabled={isPending}
        onClick={() => startTransition(() => deleteStaffAction(staffId))}
        className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
        aria-label="O'chirish"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
