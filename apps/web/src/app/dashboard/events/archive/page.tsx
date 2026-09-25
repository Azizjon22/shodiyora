import { ArrowLeft } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { EventDetail } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { EventCard } from "@/components/events/event-card";
import { getLocale } from "@/i18n/locale";
import { getDictionary, translate } from "@/i18n/get-dictionary";

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export default async function ArchivedEventsPage() {
  const [events, locale] = await Promise.all([apiFetch<EventDetail[]>("/events"), getLocale()]);
  const dict = getDictionary(locale);
  const t = (key: string) => translate(dict, key);

  const today = startOfDay(new Date());
  const archived = events
    .filter((e) => startOfDay(new Date(e.eventDate)) < today)
    .sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <LinkButton href="/dashboard/events" variant="ghost" size="sm" className="mb-2 -ml-2">
            <ArrowLeft className="h-4 w-4" /> {t("common.back")}
          </LinkButton>
          <h1 className="font-display text-2xl font-semibold tracking-tight">{t("events.archive")}</h1>
          <p className="text-sm text-muted-foreground">{t("events.archiveSubtitle")}</p>
        </div>
      </div>

      {archived.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">{t("events.noArchived")}</CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {archived.map((event) => (
            <EventCard key={event.id} event={event} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}
