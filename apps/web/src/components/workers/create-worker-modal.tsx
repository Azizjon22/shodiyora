"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateWorkerForm } from "@/components/workers/create-worker-form";

export function CreateWorkerModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> Yangi ishchi qo&apos;shish
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-border bg-card shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border p-4">
              <p className="font-semibold">Yangi ishchi qo&apos;shish</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Yopish"
                className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4">
              <CreateWorkerForm />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
