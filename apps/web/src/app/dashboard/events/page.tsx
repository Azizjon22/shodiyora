import { Plus } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { EventDetail } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { EventsCalendar } from "@/components/events/events-calendar";
import { formatDateTime, formatSom } from "@/lib/utils";
import Link from "next/link";
import { getLocale } from "@/i18n/locale";
import { getDictionary, translate } from "@/i18n/get-dictionary";

export default async function EventsPage() {
  const [events, locale] = await Promise.all([apiFetch<EventDetail[]>("/events"), getLocale()]);
  const dict = getDictionary(locale);
  const t = (key: string, params?: Record<string, string | number>) => translate(dict, key, params);

  const statusVariant: Record<string, "default" | "primary" | "success" | "destructive"> = {
    PENDING: "default",
    CONFIRMED: "primary",
    COMPLETED: "success",
    CANCELLED: "destructive",
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">{t("events.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("events.subtitle")}</p>
        </div>
        <LinkButton href="/dashboard/events/new">
          <Plus className="h-4 w-4" /> {t("events.new")}
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
            <CardContent className="p-6 text-sm text-muted-foreground">{t("common.noData")}</CardContent>
          </Card>
        )}
        {events.map((event) => (
          <Link key={event.id} href={`/dashboard/events/${event.id}`}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardContent className="space-y-3 p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{event.clientName}</p>
                    <p className="text-sm text-muted-foreground">{formatDateTime(event.eventDate, locale)}</p>
                  </div>
                  <Badge variant={statusVariant[event.status] ?? "default"}>
                    {t(`eventStatus.${event.status}`)}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span>
                    {event.guestCount} {t("dashboard.guest")}
                  </span>
                  <span>
                    {event.tableCapacity} {t("dashboard.table")}
                  </span>
                  <span>{event.menu.name}</span>
                </div>
                {event.totalPrice && (
                  <p className="text-sm font-medium text-primary">{formatSom(event.totalPrice, locale)}</p>
                )}
                <div className="flex flex-wrap gap-1">
                  {event.assignments.length === 0 ? (
                    <span className="text-xs text-destructive">{t("dashboard.workersNotAssigned")}</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      {event.assignments.length} · {t("nav.workers")}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
