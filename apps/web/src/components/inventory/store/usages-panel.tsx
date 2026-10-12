"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CalendarHeart, ChefHat, PackageMinus, Undo2 } from "lucide-react";
import type { RecentStockUsage } from "@/lib/types";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { formatDateTime, formatSom, cn } from "@/lib/utils";
import { inventoryApi, qty } from "./helpers";

/**
 * Who took what from the warehouse, for which wedding — kept apart from
 * "Bozorlik ro'yxatlari" (which buys fresh at the market for one wedding
 * and never touches warehouse stock, by design).
 */
export function UsagesPanel({
  usages,
  canSeeCosts,
  canReturn,
}: {
  usages: RecentStockUsage[];
  canSeeCosts: boolean;
  canReturn: boolean;
}) {
  const router = useRouter();
  const [returning, setReturning] = useState<RecentStockUsage | null>(null);

  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <h2 className="flex items-center gap-2 text-sm font-semibold">
        <PackageMinus className="h-4 w-4 text-muted-foreground" /> Ombordan olinganlar
      </h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Oshpazlar to&apos;ylar uchun ombordan nima olgani. Bozorlik ro&apos;yxatidan farqli — bu yerda qoldiq kamayadi.
      </p>
      {usages.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">Hali ombordan hech narsa olinmagan.</p>
      ) : (
        <ul className="mt-3 divide-y divide-border">
          {usages.map((u) => {
            const cost = u.items.reduce((s, i) => s + Number(i.totalCost ?? 0), 0);
            return (
              <li key={u.id} className="py-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link
                      href={`/dashboard/events/${u.event.id}`}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold hover:underline"
                    >
                      <CalendarHeart className="h-3.5 w-3.5 shrink-0 text-primary" />
                      <span className="truncate">{u.event.clientName}</span>
                    </Link>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <ChefHat className="h-3 w-3" /> {u.worker.fullName} · {formatDateTime(u.createdAt)}
                    </p>
                  </div>
                  {canReturn && (
                    <button
                      type="button"
                      onClick={() => setReturning(u)}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground transition hover:border-destructive/40 hover:text-destructive"
                    >
                      <Undo2 className="h-3.5 w-3.5" /> Qaytarish
                    </button>
                  )}
                </div>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {u.items.map((i) => `${i.name} ${qty(i.quantity, i.unit)}`).join(" · ")}
                </p>
                {canSeeCosts && cost > 0 && (
                  <p className={cn("mt-1 text-xs font-medium tabular-nums text-destructive")}>{formatSom(cost)}</p>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {returning && (
        <ConfirmDialog
          open
          onClose={() => setReturning(null)}
          title="Omborga qaytarilsinmi?"
          message={`"${returning.event.clientName}" to'yi uchun ${returning.worker.fullName} olgan mahsulotlar omborga qaytariladi.`}
          confirmLabel="Qaytarish"
          onConfirm={async () => {
            await inventoryApi(`/usages/${returning.id}`, "DELETE");
            router.refresh();
          }}
        />
      )}
    </section>
  );
}
