import { Wallet, TrendingDown, PiggyBank, CalendarDays, Receipt } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { DailyReport } from "@/lib/types";
import { CollapsibleCard } from "@/components/ui/collapsible-card";
import { StatCard } from "@/components/ui/stat-card";
import { DailyBreakdown } from "@/components/accounting/daily-breakdown";
import { ExpensesByDay } from "@/components/accounting/expenses-by-day";
import { ProfitTrendChart } from "@/components/accounting/profit-trend-chart";
import { ExpensesCategoryChart } from "@/components/accounting/expenses-category-chart";
import { formatSom } from "@/lib/utils";
import { getLocale } from "@/i18n/locale";
import { getDictionary, translate } from "@/i18n/get-dictionary";

export default async function AccountingPage() {
  const [report, locale] = await Promise.all([apiFetch<DailyReport>("/payments/daily-report"), getLocale()]);
  const dict = getDictionary(locale);
  const t = (key: string) => translate(dict, key);

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">{t("accounting.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("accounting.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label={t("accounting.totalPaid")}
          value={formatSom(report.totalPaid, locale)}
          icon={<Wallet className="h-5 w-5" />}
          tone="primary"
        />
        <StatCard
          label={t("accounting.totalExpenses")}
          value={formatSom(report.totalExpenses, locale)}
          icon={<TrendingDown className="h-5 w-5" />}
          tone="destructive"
        />
        <StatCard
          label={t("accounting.netProfit")}
          value={formatSom(report.netProfit, locale)}
          icon={<PiggyBank className="h-5 w-5" />}
          tone={Number(report.netProfit) >= 0 ? "accent" : "destructive"}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <ProfitTrendChart days={report.days} />
        </div>
        <div className="lg:col-span-2">
          <ExpensesCategoryChart expensesByCategory={report.expensesByCategory} />
        </div>
      </div>

      <CollapsibleCard
        icon={<CalendarDays className="h-4 w-4 text-muted-foreground" />}
        title={t("accounting.dailyProfit")}
      >
        <DailyBreakdown days={report.days} valueKey="netProfit" tone="success" />
      </CollapsibleCard>

      <div>
        <h2 className="mb-3 flex items-center gap-2 text-base font-semibold">
          <Receipt className="h-4 w-4 text-muted-foreground" /> {t("accounting.dailyExpenses")}
        </h2>
        <ExpensesByDay days={report.days} />
      </div>
    </div>
  );
}
