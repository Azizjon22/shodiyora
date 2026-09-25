"use client";

import { FileDown } from "lucide-react";
import type { ShoppingList } from "@/lib/types";
import { downloadShoppingListPdf } from "@/lib/shopping-list-pdf";
import { cn } from "@/lib/utils";

export function ShoppingListPdfButton({ list, className }: { list: ShoppingList; className?: string }) {
  return (
    <button
      type="button"
      onClick={() => downloadShoppingListPdf(list)}
      className={cn(
        "flex h-8 shrink-0 items-center gap-1.5 rounded-md border border-border px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        className,
      )}
    >
      <FileDown className="h-3.5 w-3.5" /> PDF
    </button>
  );
}
