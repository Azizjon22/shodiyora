import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { getSession } from "@/lib/session";
import type { UpcomingEvent } from "@/lib/types";
import { EventsCalendar } from "@/components/events/events-calendar";
import { getLocale } from "@/i18n/locale";
import { getDictionary, translate } from "@/i18n/get-dictionary";

export default async function WorkerEventsPage() {
  const session = await getSession();
  if (session?.user.kind !== "WORKER" || session.user.position !== "CHEF") {
    redirect("/worker");
  }

  const [locale, upcomingEvents] = await Promise.all([getLocale(), apiFetch<UpcomingEvent[]>("/events/upcoming")]);
  const dict = getDictionary(locale);
  const t = (key: string, params?: Record<string, string | number>) => translate(dict, key, params);

  return (
    <div className="space-y-4 animate-fade-up">
      <Link href="/worker" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> {t("common.back")}
      </Link>
      <div>
        <h1 className="font-display text-xl font-semibold tracking-tight">{t("workerApp.weddingDays")}</h1>
        <p className="text-sm text-muted-foreground">{t("accounting.eventsCount", { count: upcomingEvents.length })}</p>
      </div>
      <EventsCalendar events={upcomingEvents} readOnly />
    </div>
  );
}
