import { CalendarDays } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { getSession } from "@/lib/session";
import type { ShoppingList, UpcomingEvent } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UNIT_LABELS_UZ, WORKER_POSITION_LABELS_UZ } from "@shodiyora/shared";
import { formatDate, formatDateTime } from "@/lib/utils";
import { ShoppingListForm } from "@/components/worker/shopping-list-form";

const STATUS_LABEL: Record<string, { label: string; variant: "default" | "primary" | "success" }> = {
  SUBMITTED: { label: "Yuborildi", variant: "primary" },
  REVIEWED: { label: "Ko'rib chiqildi", variant: "default" },
  PURCHASED: { label: "Sotib olindi", variant: "success" },
  CLOSED: { label: "Yopildi", variant: "default" },
};

export default async function WorkerHomePage() {
  const session = await getSession();
  const isChef = session?.user.kind === "WORKER" && session.user.position === "CHEF";

  const [myLists, upcomingEvents] = await Promise.all([
    apiFetch<ShoppingList[]>("/shopping-lists/mine"),
    isChef ? apiFetch<UpcomingEvent[]>("/events/upcoming") : Promise.resolve<UpcomingEvent[]>([]),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Assalomu alaykum, {session?.user.fullName}</h1>
        {session?.user.kind === "WORKER" && (
          <p className="text-sm text-muted-foreground">{WORKER_POSITION_LABELS_UZ[session.user.position]}</p>
        )}
      </div>

      {isChef && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" /> To&apos;ylar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {upcomingEvents.length === 0 && (
              <p className="text-sm text-muted-foreground">Kelgusi to&apos;ylar yo&apos;q.</p>
            )}
            {upcomingEvents.map((event) => (
              <div key={event.id} className="rounded-md border border-border p-3">
                <p className="text-sm font-medium">{formatDate(event.eventDate)}</p>
                <p className="text-xs text-muted-foreground">{event.clientName}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Bozorlik ro&apos;yxati yuborish</CardTitle>
        </CardHeader>
        <CardContent>
          <ShoppingListForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mening ro&apos;yxatlarim</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {myLists.length === 0 && <p className="text-sm text-muted-foreground">Hali ro&apos;yxat yubormagansiz.</p>}
          {myLists.map((list) => {
            const status = STATUS_LABEL[list.status];
            return (
              <div key={list.id} className="rounded-md border border-border p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {formatDateTime(list.createdAt)}
                    {list.event && ` · ${list.event.clientName}`}
                  </p>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </div>
                <ul className="mt-2 space-y-1 text-sm">
                  {list.items.map((item) => (
                    <li key={item.id} className="flex items-center justify-between">
                      <span>{item.name}</span>
                      <span className="text-muted-foreground">
                        {item.quantity} {UNIT_LABELS_UZ[item.unit]} {item.isPurchased && "✓"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
