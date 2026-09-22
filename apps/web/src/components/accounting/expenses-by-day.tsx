"use client";

import { useMemo, useState } from "react";
import { EVENT_EXPENSE_CATEGORY_LABELS_UZ } from "@shodiyora/shared";
import { CollapsibleCard } from "@/components/ui/collapsible-card";
import type { DailyReportDay } from "@/lib/types";
import { formatDate, formatSom } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Period = "all" | "year" | "month";

const PERIOD_OPTIONS: [Period, string][] = [
  ["all", "Barchasi"],
  ["year", "Bu yil"],
  ["month", "Bu oy"],
];

function parseDayLocal(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function ExpensesByDay({ days }: { days: DailyReportDay[] }) {
  const [period, setPeriod] = useState<Period>("all");

  const filtered = useMemo(() => {
    const now = new Date();
    if (period === "month") {
      return days.filter((d) => {
        const date = parseDayLocal(d.date);
        return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
      });
    }
    if (period === "year") {
      return days.filter((d) => parseDayLocal(d.date).getFullYear() === now.getFullYear());
    }
    return days;
  }, [days, period]);

  return (
    <div className="space-y-3">
      <div className="flex gap-1 rounded-lg border border-border bg-muted p-1 text-xs font-medium w-fit">
        {PERIOD_OPTIONS.map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setPeriod(value)}
            className={cn(
              "rounded-md px-2.5 py-1.5 transition-colors",
              period === value ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground">Bu davrda to&apos;y bo&apos;lmagan.</p>
        )}
        {filtered.map((day) => (
          <CollapsibleCard
            key={day.date}
            title={formatDate(parseDayLocal(day.date)) + (day.eventCount > 1 ? ` · ${day.eventCount} ta to'y` : "")}
            meta={<span className="text-sm font-semibold text-destructive">{formatSom(day.totalExpenses)}</span>}
          >
            <div className="space-y-2">
              {day.expensesByCategory.length === 0 && (
                <p className="text-sm text-muted-foreground">Bu kunga xarajat kiritilmagan.</p>
              )}
              {day.expensesByCategory.map((item) => (
                <div
                  key={item.category}
                  className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm"
                >
                  <span>{EVENT_EXPENSE_CATEGORY_LABELS_UZ[item.category]}</span>
                  <span className="font-medium text-destructive">{formatSom(item.amount)}</span>
                </div>
              ))}
            </div>
          </CollapsibleCard>
        ))}
      </div>
    </div>
  );
}
