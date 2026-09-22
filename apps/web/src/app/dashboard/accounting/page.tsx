import { apiFetch } from "@/lib/api";
import type { DailyReport } from "@/lib/types";
import { CollapsibleCard } from "@/components/ui/collapsible-card";
import { StatCard } from "@/components/ui/stat-card";
import { DailyBreakdown } from "@/components/accounting/daily-breakdown";
import { ExpensesByDay } from "@/components/accounting/expenses-by-day";
import { formatSom } from "@/lib/utils";
import { Wallet, TrendingDown, PiggyBank, CalendarDays, Receipt } from "lucide-react";

export default async function AccountingPage() {
  const report = await apiFetch<DailyReport>("/payments/daily-report");

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
