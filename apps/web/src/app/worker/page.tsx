import { apiFetch } from "@/lib/api";
import { getSession } from "@/lib/session";
import type { ShoppingList, UpcomingEvent } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UNIT_LABELS_UZ } from "@shodiyora/shared";
import { formatDateTime } from "@/lib/utils";
import { ShoppingListForm } from "@/components/worker/shopping-list-form";
import { EventsCalendar } from "@/components/events/events-calendar";
import { getLocale } from "@/i18n/locale";
import { getDictionary, translate } from "@/i18n/get-dictionary";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";

export default async function WorkerHomePage() {
  const [session, locale] = await Promise.all([getSession(), getLocale()]);
  const dict = getDictionary(locale);
  const t = (key: string, params?: Record<string, string | number>) => translate(dict, key, params);
  const isChef = session?.user.kind === "WORKER" && session.user.position === "CHEF";

  const [myLists, upcomingEvents] = await Promise.all([
    apiFetch<ShoppingList[]>("/shopping-lists/mine"),
    isChef ? apiFetch<UpcomingEvent[]>("/events/upcoming") : Promise.resolve<UpcomingEvent[]>([]),
  ]);

  const statusLabels: Record<string, { label: string; variant: "default" | "primary" | "success" }> = {
    SUBMITTED: { label: locale === "ru" ? "Отправлен" : "Yuborildi", variant: "primary" },
    REVIEWED: { label: locale === "ru" ? "Просмотрен" : "Ko'rib chiqildi", variant: "default" },
    PURCHASED: { label: locale === "ru" ? "Куплен" : "Sotib olindi", variant: "success" },
    CLOSED: { label: locale === "ru" ? "Закрыт" : "Yopildi", variant: "default" },
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            {t("workerApp.greeting", { name: session?.user.fullName ?? "" })}
          </h1>
          {session?.user.kind === "WORKER" && (
            <p className="text-sm text-muted-foreground">{t(`workerPositions.${session.user.position}`)}</p>
          )}
        </div>
        <LanguageSwitcher />
      </div>

      {isChef && (
        <div>
          <h2 className="mb-3 text-base font-semibold">{t("workerApp.weddingDays")}</h2>
          <EventsCalendar events={upcomingEvents} readOnly />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t("workerApp.sendList")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ShoppingListForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("workerApp.myLists")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {myLists.length === 0 && <p className="text-sm text-muted-foreground">{t("common.noData")}</p>}
          {myLists.map((list) => {
            const status = statusLabels[list.status] ?? statusLabels.SUBMITTED;
            return (
              <div key={list.id} className="rounded-xl border border-border p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {formatDateTime(list.createdAt, locale)}
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
