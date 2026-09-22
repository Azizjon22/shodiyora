"use client";

import { useTransition } from "react";
import { X } from "lucide-react";
import { unassignWorkerAction } from "@/lib/actions/events.actions";

export function UnassignButton({ eventId, workerId }: { eventId: string; workerId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => unassignWorkerAction(eventId, workerId))}
      className="ml-1 rounded-full p-0.5 hover:bg-black/10 disabled:opacity-50"
      aria-label="Ishchini olib tashlash"
    >
      <X className="h-3 w-3" />
    </button>
  );
}
