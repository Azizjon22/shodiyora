import Link from "next/link";
import { apiFetch } from "@/lib/api";
import type { DailyReport, EventDetail } from "@/lib/types";
import { CollapsibleCard } from "@/components/ui/collapsible-card";
import { StatCard } from "@/components/ui/stat-card";
import { DailyBreakdown } from "@/components/accounting/daily-breakdown";
import { ExpensesByDay } from "@/components/accounting/expenses-by-day";
import { formatDate, formatSom } from "@/lib/utils";
import { Wallet, TrendingDown, PiggyBank, CalendarDays, Receipt, AlertCircle } from "lucide-react";

export default async function AccountingPage() {
  const [report, events] = await Promise.all([
    apiFetch<DailyReport>("/payments/daily-report"),
    apiFetch<EventDetail[]>("/events"),
  ]);

  const outstandingEvents = events
    .filter((e) => e.status !== "CANCELLED" && e.balance && Number(e.balance) > 0)
    .sort((a, b) => Number(b.balance) - Number(a.balance));
  const totalOutstanding = outstandingEvents.reduce((sum, e) => sum + Number(e.balance ?? 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Hisob-kitob</h1>
        <p className="text-sm text-muted-foreground">Bugungacha bo&apos;lgan to&apos;ylardan olingan aniq sof foyda va xarajatlar</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Jami olingan (bugungacha)" value={formatSom(report.totalPaid)} icon={<Wallet className="h-5 w-5" />} tone="primary" />
        <StatCard label="Jami xarajat" value={formatSom(report.totalExpenses)} icon={<TrendingDown className="h-5 w-5" />} tone="destructive" />
        <StatCard
          label="Sof foyda"
          value={formatSom(report.netProfit)}
          icon={<PiggyBank className="h-5 w-5" />}
          tone={Number(report.netProfit) >= 0 ? "accent" : "destructive"}
        />
      </div>

      <CollapsibleCard
        icon={<AlertCircle className="h-4 w-4 text-muted-foreground" />}
        title="Qarzdor to'ylar"
        meta={
          outstandingEvents.length > 0 ? (
            <span className="text-sm font-semibold text-destructive">{formatSom(totalOutstanding)}</span>
          ) : undefined
        }
        defaultOpen={outstandingEvents.length > 0}
      >
        <div className="space-y-2">
          {outstandingEvents.length === 0 && (
            <p className="text-sm text-muted-foreground">Qarzdorlik yo&apos;q — barcha to&apos;lovlar amalga oshirilgan.</p>
          )}
          {outstandingEvents.map((event) => (
            <Link
              key={event.id}
              href={`/dashboard/events/${event.id}`}
              className="flex items-center justify-between rounded-md border border-border p-3 text-sm transition-colors hover:border-primary/40 hover:bg-muted/50"
            >
              <div>
                <p className="font-medium">{event.clientName}</p>
                <p className="text-xs text-muted-foreground">{formatDate(event.eventDate)}</p>
              </div>
              <span className="font-medium text-destructive">{formatSom(event.balance ?? "0")}</span>
            </Link>
          ))}
        </div>
      </CollapsibleCard>

      <CollapsibleCard icon={<CalendarDays className="h-4 w-4 text-muted-foreground" />} title="Kunlar bo'yicha sof foyda">
        <DailyBreakdown days={report.days} valueKey="netProfit" tone="success" />
      </CollapsibleCard>

      <div>
        <h2 className="mb-3 flex items-center gap-2 text-base font-semibold">
          <Receipt className="h-4 w-4 text-muted-foreground" /> Kunlar bo&apos;yicha xarajatlar
        </h2>
        <ExpensesByDay days={report.days} />
      </div>
    </div>
  );
}
