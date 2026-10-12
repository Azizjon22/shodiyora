"use client";

import { cn } from "@/lib/utils";
import type { KgMode } from "./quantity";

/** "kg | gram" for a kg product: whole kilos, or grams for the small amounts. */
export function KgModeSwitch({ mode, onChange }: { mode: KgMode; onChange: (mode: KgMode) => void }) {
  return (
    <div className="grid grid-cols-2 gap-1 px-2 pb-2" role="radiogroup" aria-label="O'lchov">
      {(
        [
          ["kg", "kg"],
          ["g", "gram"],
        ] as const
      ).map(([value, label]) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={mode === value}
          onClick={() => mode !== value && onChange(value)}
          className={cn(
            "h-7 rounded-md text-xs font-medium transition",
            mode === value ? "bg-primary/15 text-primary ring-1 ring-primary/40" : "text-muted-foreground hover:bg-muted",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
