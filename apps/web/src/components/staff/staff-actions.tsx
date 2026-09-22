"use client";

import { useTransition } from "react";
import { Power, Trash2 } from "lucide-react";
import { toggleStaffActiveAction, deleteStaffAction } from "@/lib/actions/staff.actions";

export function StaffActions({ staffId, isActive }: { staffId: string; isActive: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-1">
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
