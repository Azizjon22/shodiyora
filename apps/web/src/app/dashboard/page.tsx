import Link from "next/link";
import { CalendarDays, ChefHat, PackageX, PiggyBank, Users, Wallet } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { getSession } from "@/lib/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { formatDateTime, formatSom } from "@/lib/utils";
import { getLocale } from "@/i18n/locale";
import { getDictionary, translate } from "@/i18n/get-dictionary";

interface TomorrowEvent {
  id: string;
  clientName: string;
  eventDate: string;
  guestCount: number;
  tableCapacity: number;
  menuName: string;
  assignedWorkers: { id: string; fullName: string; position: string }[];
}

interface DashboardOverview {
  tomorrowEvents: TomorrowEvent[];
  upcomingEventsCount: number;
  workers: { pending: number; approved: number };
  lowStockItems?: { id: string; name: string; quantity: string; unit: string }[];
  pendingShoppingLists?: number;
  monthlyFinancials?: {
    eventCount: number;
    totalExpected: string;
    totalCollected: string;
    totalOutstanding: string;
    totalExpenses: string;
    netProfit: string;
  };
}

export default async function DashboardOverviewPage() {
  const [overview, session, locale] = await Promise.all([
    apiFetch<DashboardOverview>("/dashboard/overview"),
    getSession(),
    getLocale(),
  ]);
  const dict = getDictionary(locale);
  const t = (key: string, params?: Record<string, string | number>) => translate(dict, key, params);

  const isZavzal = session?.user.kind === "STAFF" && session.user.role === "ZAVZAL";

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">{t("dashboard.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("dashboard.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t("dashboard.tomorrowWeddings")}
          value={overview.tomorrowEvents.length}
          icon={<CalendarDays className="h-5 w-5" />}
          tone="primary"
          href="/dashboard/events"
        />
        <StatCard
          label={t("dashboard.upcoming")}
          value={overview.upcomingEventsCount}
          icon={<CalendarDays className="h-5 w-5" />}
          tone="accent"
          href="/dashboard/events"
        />
        <StatCard
          label={t("dashboard.approvedWorkers")}
          value={overview.workers.approved}
          icon={<Users className="h-5 w-5" />}
          tone="accent"
          href="/dashboard/workers"
        />
        <StatCard
          label={t("dashboard.pendingWorkers")}
          value={overview.workers.pending}
          icon={<Users className="h-5 w-5" />}
          tone={overview.workers.pending > 0 ? "destructive" : "default"}
          href="/dashboard/workers"
        />
      </div>

      {!isZavzal && overview.monthlyFinancials && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label={t("dashboard.monthCollected")}
            value={formatSom(overview.monthlyFinancials.totalCollected, locale)}
            icon={<Wallet className="h-5 w-5" />}
            tone="primary"
            href="/dashboard/accounting"
          />
          <StatCard
            label={t("dashboard.netProfit")}
            value={formatSom(overview.monthlyFinancials.netProfit, locale)}
            icon={<PiggyBank className="h-5 w-5" />}
            tone={Number(overview.monthlyFinancials.netProfit) >= 0 ? "accent" : "destructive"}
            href="/dashboard/accounting"
          />
          <StatCard
            label={t("dashboard.outstanding")}
            value={formatSom(overview.monthlyFinancials.totalOutstanding, locale)}
            icon={<Wallet className="h-5 w-5" />}
            tone={Number(overview.monthlyFinancials.totalOutstanding) > 0 ? "destructive" : "default"}
            href="/dashboard/accounting"
          />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.tomorrowWeddings")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {overview.tomorrowEvents.length === 0 && (
            <p className="text-sm text-muted-foreground">{t("dashboard.noTomorrow")}</p>
          )}
          {overview.tomorrowEvents.map((event) => (
            <Link
              key={event.id}
              href={`/dashboard/events/${event.id}`}
              className="block rounded-xl border border-border p-4 transition-colors hover:border-primary/40 hover:bg-muted/50"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium">{event.clientName}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDateTime(event.eventDate, locale)} · {event.guestCount} {t("dashboard.guest")} ·{" "}
                    {event.tableCapacity} {t("dashboard.table")} · {event.menuName}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {event.assignedWorkers.length === 0 && (
                  <Badge variant="destructive">{t("dashboard.workersNotAssigned")}</Badge>
                )}
                {event.assignedWorkers.map((w) => (
                  <Badge key={w.id} variant="default">
                    {w.fullName} · {t(`workerPositions.${w.position}`)}
                  </Badge>
                ))}
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>

      {!isZavzal && overview.lowStockItems && overview.lowStockItems.length > 0 && (
        <Link href="/dashboard/inventory" className="block">
          <Card className="transition-colors hover:border-destructive/40 hover:bg-muted/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PackageX className="h-4 w-4 text-destructive" /> {t("dashboard.lowStock")}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {overview.lowStockItems.map((item) => (
                <Badge key={item.id} variant="destructive">
                  {item.name}: {item.quantity} {item.unit}
                </Badge>
              ))}
            </CardContent>
          </Card>
        </Link>
      )}

      {!isZavzal && typeof overview.pendingShoppingLists === "number" && overview.pendingShoppingLists > 0 && (
        <Link href="/dashboard/shopping-lists" className="block">
          <Card className="transition-colors hover:border-primary/40 hover:bg-muted/50">
            <CardContent className="flex items-center gap-3 p-4 sm:p-5">
              <ChefHat className="h-5 w-5 text-accent" />
              <p className="text-sm">{t("dashboard.pendingLists", { count: overview.pendingShoppingLists })}</p>
            </CardContent>
          </Card>
        </Link>
      )}
    </div>
  );
}
