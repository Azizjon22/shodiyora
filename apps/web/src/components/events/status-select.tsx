"use client";

import { useTransition } from "react";
import { EVENT_STATUSES } from "@shodiyora/shared";
import { Select } from "@/components/ui/input";
import { updateEventStatusAction } from "@/lib/actions/events.actions";
import { useT } from "@/components/i18n/locale-provider";

export function StatusSelect({ eventId, status }: { eventId: string; status: string }) {
  const t = useT();
  const [isPending, startTransition] = useTransition();

  return (
    <Select
      defaultValue={status}
      disabled={isPending}
      className="w-auto"
      onChange={(e) => {
        const value = e.target.value;
        startTransition(() => {
          updateEventStatusAction(eventId, value);
        });
      }}
    >
      {EVENT_STATUSES.map((s) => (
        <option key={s} value={s}>
          {t(`eventStatus.${s}`)}
        </option>
      ))}
    </Select>
  );
}
