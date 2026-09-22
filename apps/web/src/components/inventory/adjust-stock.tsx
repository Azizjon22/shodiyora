"use client";

import { useState, useTransition } from "react";
import { Plus, Minus, Trash2 } from "lucide-react";
import { addInventoryTransactionAction, deleteInventoryItemAction } from "@/lib/actions/inventory.actions";

export function AdjustStock({ itemId }: { itemId: string }) {
  const [value, setValue] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDelete] = useTransition();

  function submit(type: "IN" | "OUT") {
    const quantity = Number(value);
    if (!quantity || quantity <= 0) return;
    startTransition(async () => {
      await addInventoryTransactionAction(itemId, type, quantity);
      setValue("");
    });
  }

  return (
    <div className="ml-auto flex items-center gap-1.5">
      <div className="flex items-center overflow-hidden rounded-lg border border-input bg-card">
        <button
          type="button"
          disabled={isPending}
          onClick={() => submit("OUT")}
          className="flex h-8 w-8 items-center justify-center text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-40"
          aria-label="Chiqim"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          type="number"
          min={0}
          placeholder="0"
          disabled={isPending}
          className="h-8 w-14 border-x border-input bg-transparent text-center text-sm outline-none disabled:opacity-50 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <button
          type="button"
          disabled={isPending}
          onClick={() => submit("IN")}
          className="flex h-8 w-8 items-center justify-center text-success transition-colors hover:bg-success/10 disabled:opacity-40"
          aria-label="Kirim"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
      <button
        type="button"
        disabled={isDeleting}
        onClick={() => startDelete(() => deleteInventoryItemAction(itemId))}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground/60 transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"
        aria-label="O'chirish"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
