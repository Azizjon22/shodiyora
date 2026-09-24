import Link from "next/link";
import { CalendarDays, ChefHat, PackageX, PiggyBank, Users, Wallet } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { getSession } from "@/lib/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { formatDateTime, formatSom } from "@/lib/utils";
import { WORKER_POSITION_LABELS_UZ } from "@shodiyora/shared";

interface TomorrowEvent {
  id: string;
  clientName: string;
  eventDate: string;
  guestCount: number;
  tableCapacity: number;
  menuName: string;
  assignedWorkers: { id: string; fullName: string; position: keyof typeof WORKER_POSITION_LABELS_UZ }[];
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
  const [overview, session] = await Promise.all([
    apiFetch<DashboardOverview>("/dashboard/overview"),
    getSession(),
  ]);

  const isZavzal = session?.user.kind === "STAFF" && session.user.role === "ZAVZAL";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Boshqaruv paneli</h1>
        <p className="text-sm text-muted-foreground">Umumiy holat va ertangi to&apos;ylar</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Ertangi to'ylar"
          value={overview.tomorrowEvents.length}
          icon={<CalendarDays className="h-5 w-5" />}
          tone="primary"
          href="/dashboard/events"
        />
        <StatCard
          label="Kelgusi 7 kun"
          value={overview.upcomingEventsCount}
          icon={<CalendarDays className="h-5 w-5" />}
          tone="accent"
          href="/dashboard/events"
        />
        <StatCard
          label="Tasdiqlangan ishchilar"
          value={overview.workers.approved}
          icon={<Users className="h-5 w-5" />}
          tone="accent"
          href="/dashboard/workers"
        />
        <StatCard
          label="Kutilayotgan ishchilar"
          value={overview.workers.pending}
          icon={<Users className="h-5 w-5" />}
          tone={overview.workers.pending > 0 ? "destructive" : "default"}
          href="/dashboard/workers"
        />
      </div>

      {!isZavzal && overview.monthlyFinancials && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label="Shu oy to'langan"
            value={formatSom(overview.monthlyFinancials.totalCollected)}
            icon={<Wallet className="h-5 w-5" />}
            tone="primary"
            href="/dashboard/accounting"
          />
          <StatCard
            label="Shu oy sof foyda"
            value={formatSom(overview.monthlyFinancials.netProfit)}
            icon={<PiggyBank className="h-5 w-5" />}
            tone={Number(overview.monthlyFinancials.netProfit) >= 0 ? "accent" : "destructive"}
            href="/dashboard/accounting"
          />
          <StatCard
            label="Qarzdorlik"
            value={formatSom(overview.monthlyFinancials.totalOutstanding)}
            icon={<Wallet className="h-5 w-5" />}
            tone={Number(overview.monthlyFinancials.totalOutstanding) > 0 ? "destructive" : "default"}
            href="/dashboard/accounting"
          />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Ertangi to&apos;ylar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {overview.tomorrowEvents.length === 0 && (
            <p className="text-sm text-muted-foreground">Ertaga to&apos;y rejalashtirilmagan.</p>
          )}
          {overview.tomorrowEvents.map((event) => (
            <Link
              key={event.id}
              href={`/dashboard/events/${event.id}`}
              className="block rounded-md border border-border p-4 transition-colors hover:border-primary/40 hover:bg-muted/50"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium">{event.clientName}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDateTime(event.eventDate)} · {event.guestCount} mehmon · {event.tableCapacity} kishilik stol · {event.menuName}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {event.assignedWorkers.length === 0 && (
                  <Badge variant="destructive">Ishchilar hali belgilanmagan</Badge>
                )}
                {event.assignedWorkers.map((w) => (
                  <Badge key={w.id} variant="default">
                    {w.fullName} · {WORKER_POSITION_LABELS_UZ[w.position]}
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
                <PackageX className="h-4 w-4 text-destructive" /> Omborda kam qolgan mahsulotlar
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
              <p className="text-sm">
                <span className="font-medium">{overview.pendingShoppingLists}</span> ta yangi bozorlik ro&apos;yxati
                ko&apos;rib chiqilishini kutmoqda.
              </p>
            </CardContent>
          </Card>
        </Link>
      )}
    </div>
  );
}
