import { CalendarDays, ChefHat, PackageX, Users, Wallet } from "lucide-react";
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
        <StatCard label="Ertangi to'ylar" value={overview.tomorrowEvents.length} icon={<CalendarDays className="h-5 w-5" />} tone="primary" />
        <StatCard label="Kelgusi 7 kun" value={overview.upcomingEventsCount} icon={<CalendarDays className="h-5 w-5" />} />
        <StatCard label="Tasdiqlangan ishchilar" value={overview.workers.approved} icon={<Users className="h-5 w-5" />} tone="accent" />
        <StatCard label="Kutilayotgan ishchilar" value={overview.workers.pending} icon={<Users className="h-5 w-5" />} />
      </div>

      {!isZavzal && overview.monthlyFinancials && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            label="Shu oy kutilayotgan tushum"
            value={formatSom(overview.monthlyFinancials.totalExpected)}
            icon={<Wallet className="h-5 w-5" />}
            tone="primary"
          />
          <StatCard
            label="Shu oy to'langan"
            value={formatSom(overview.monthlyFinancials.totalCollected)}
            icon={<Wallet className="h-5 w-5" />}
            tone="accent"
          />
          <StatCard
            label="Qarzdorlik"
            value={formatSom(overview.monthlyFinancials.totalOutstanding)}
            icon={<Wallet className="h-5 w-5" />}
            tone="destructive"
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
            <div key={event.id} className="rounded-md border border-border p-4">
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
            </div>
          ))}
        </CardContent>
      </Card>

      {!isZavzal && overview.lowStockItems && overview.lowStockItems.length > 0 && (
        <Card>
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
      )}

      {!isZavzal && typeof overview.pendingShoppingLists === "number" && overview.pendingShoppingLists > 0 && (
        <Card>
          <CardContent className="flex items-center gap-3 p-4 sm:p-5">
            <ChefHat className="h-5 w-5 text-accent" />
            <p className="text-sm">
              <span className="font-medium">{overview.pendingShoppingLists}</span> ta yangi bozorlik ro&apos;yxati ko&apos;rib chiqilishini kutmoqda.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
