import { Plus } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { EventDetail } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { EventsCalendar } from "@/components/events/events-calendar";
import { formatDateTime, formatSom } from "@/lib/utils";
import Link from "next/link";

const STATUS_LABEL: Record<string, { label: string; variant: "default" | "primary" | "success" | "destructive" }> = {
  PENDING: { label: "Kutilmoqda", variant: "default" },
  CONFIRMED: { label: "Tasdiqlangan", variant: "primary" },
  COMPLETED: { label: "Yakunlangan", variant: "success" },
  CANCELLED: { label: "Bekor qilingan", variant: "destructive" },
};

export default async function EventsPage() {
  const events = await apiFetch<EventDetail[]>("/events");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">To&apos;y buyurtmalari</h1>
          <p className="text-sm text-muted-foreground">Barcha rejalashtirilgan va o&apos;tgan to&apos;ylar</p>
        </div>
        <LinkButton href="/dashboard/events/new">
          <Plus className="h-4 w-4" /> Yangi to&apos;y
        </LinkButton>
      </div>

      <EventsCalendar
        events={events
          .filter((e) => e.status !== "CANCELLED")
          .map((e) => ({ id: e.id, clientName: e.clientName, eventDate: e.eventDate }))}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {events.length === 0 && (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">Hozircha to&apos;ylar yo&apos;q.</CardContent>
          </Card>
        )}
        {events.map((event) => {
          const status = STATUS_LABEL[event.status];
          return (
            <Link key={event.id} href={`/dashboard/events/${event.id}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{event.clientName}</p>
                      <p className="text-sm text-muted-foreground">{formatDateTime(event.eventDate)}</p>
                    </div>
                    <Badge variant={status?.variant ?? "default"}>{status?.label ?? event.status}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span>{event.guestCount} mehmon</span>
                    <span>{event.tableCapacity} kishilik stol</span>
                    <span>{event.menu.name}</span>
                  </div>
                  {event.totalPrice && (
                    <p className="text-sm font-medium text-primary">{formatSom(event.totalPrice)}</p>
                  )}
                  <div className="flex flex-wrap gap-1">
                    {event.assignments.length === 0 ? (
                      <span className="text-xs text-destructive">Ishchilar belgilanmagan</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        {event.assignments.length} ta ishchi belgilangan
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
