"use client";

import { useTransition } from "react";
import { useState } from "react";
import { X } from "lucide-react";
import { toggleEventAssignmentAction } from "@/lib/actions/events.actions";
import { formatDateTime } from "@/lib/utils";

export interface StaffingEvent {
  id: string;
  clientName: string;
  eventDate: string;
  assignedWorkerIds: string[];
}

export function AssignWorkerModal({
  worker,
  events,
  onClose,
}: {
  worker: { id: string; fullName: string };
  events: StaffingEvent[];
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [assigned, setAssigned] = useState<Set<string>>(
    () => new Set(events.filter((e) => e.assignedWorkerIds.includes(worker.id)).map((e) => e.id)),
  );

  function toggle(eventId: string, value: boolean) {
    setAssigned((prev) => {
      const next = new Set(prev);
      if (value) next.add(eventId);
      else next.delete(eventId);
      return next;
    });
    startTransition(() => toggleEventAssignmentAction(eventId, worker.id, value));
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[80vh] w-full max-w-md overflow-hidden rounded-lg border border-border bg-card shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border p-4">
          <div>
            <p className="font-semibold">{worker.fullName}</p>
            <p className="text-xs text-muted-foreground">Qaysi to&apos;yga belgilaymiz?</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Yopish"
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[60vh] space-y-2 overflow-y-auto p-4">
          {events.length === 0 && (
            <p className="text-sm text-muted-foreground">Hozircha kelgusi to&apos;ylar yo&apos;q.</p>
          )}
          {events.map((event) => {
            const checked = assigned.has(event.id);
            return (
              <label
                key={event.id}
                className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/5"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={isPending}
                  onChange={() => toggle(event.id, !checked)}
                  className="h-4 w-4 rounded border-input"
                />
                <span className="flex-1">
                  <span className="block font-medium">{formatDateTime(event.eventDate)}</span>
                  <span className="block text-xs text-muted-foreground">{event.clientName}</span>
                </span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
