import Link from "next/link";
import { CalendarDays, ShoppingCart } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { getSession } from "@/lib/session";
import type { ShoppingList, UpcomingEvent } from "@/lib/types";
import { getLocale } from "@/i18n/locale";
import { getDictionary, translate } from "@/i18n/get-dictionary";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { cn } from "@/lib/utils";

export default async function WorkerHomePage() {
  const [session, locale] = await Promise.all([getSession(), getLocale()]);
  const dict = getDictionary(locale);
  const t = (key: string, params?: Record<string, string | number>) => translate(dict, key, params);
  const isChef = session?.user.kind === "WORKER" && session.user.position === "CHEF";

  const [myLists, upcomingEvents] = await Promise.all([
    apiFetch<ShoppingList[]>("/shopping-lists/mine"),
    isChef ? apiFetch<UpcomingEvent[]>("/events/upcoming") : Promise.resolve<UpcomingEvent[]>([]),
  ]);

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

      <div className={cn("grid gap-4", isChef ? "grid-cols-2" : "grid-cols-1")}>
        {isChef && (
          <Link
            href="/worker/events"
            className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-6 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <CalendarDays className="h-6 w-6" />
            </span>
            <span className="font-semibold">{t("workerApp.weddingDays")}</span>
            <span className="text-xs text-muted-foreground">{t("accounting.eventsCount", { count: upcomingEvents.length })}</span>
          </Link>
        )}
        <Link
          href="/worker/shopping"
          className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-6 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/15 text-accent">
            <ShoppingCart className="h-6 w-6" />
          </span>
          <span className="font-semibold">{t("nav.shoppingLists")}</span>
          <span className="text-xs text-muted-foreground">{myLists.length}</span>
        </Link>
      </div>
    </div>
  );
}
