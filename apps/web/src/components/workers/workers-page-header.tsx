"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateWorkerModal } from "@/components/workers/create-worker-modal";
import { useT } from "@/components/i18n/locale-provider";

export function WorkersPageHeader() {
  const t = useT();
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">{t("workers.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("workers.subtitle")}</p>
        </div>
        <Button type="button" onClick={() => setOpen(true)} className="shrink-0">
          <Plus className="h-4 w-4" />
          {t("workers.create")}
        </Button>
      </div>
      <CreateWorkerModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
