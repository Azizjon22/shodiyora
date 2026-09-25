import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { ShoppingList } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UNIT_LABELS_UZ } from "@shodiyora/shared";
import { formatDateTime } from "@/lib/utils";
import { ShoppingListForm } from "@/components/worker/shopping-list-form";
import { ShoppingListPdfButton } from "@/components/shopping-lists/shopping-list-pdf-button";
import { getLocale } from "@/i18n/locale";
import { getDictionary, translate } from "@/i18n/get-dictionary";

export default async function WorkerShoppingPage() {
  const [myLists, locale] = await Promise.all([apiFetch<ShoppingList[]>("/shopping-lists/mine"), getLocale()]);
  const dict = getDictionary(locale);
  const t = (key: string) => translate(dict, key);

  const statusLabels: Record<string, { label: string; variant: "default" | "primary" | "success" }> = {
    SUBMITTED: { label: locale === "ru" ? "Отправлен" : "Yuborildi", variant: "primary" },
    REVIEWED: { label: locale === "ru" ? "Просмотрен" : "Ko'rib chiqildi", variant: "default" },
    PURCHASED: { label: locale === "ru" ? "Куплен" : "Sotib olindi", variant: "success" },
    CLOSED: { label: locale === "ru" ? "Закрыт" : "Yopildi", variant: "default" },
  };

  return (
    <div className="space-y-4 animate-fade-up">
      <Link href="/worker" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> {t("common.back")}
      </Link>

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
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm text-muted-foreground">
                    {formatDateTime(list.createdAt, locale)}
                    {list.event && ` · ${list.event.clientName}`}
                  </p>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant={status.variant}>{status.label}</Badge>
                    <ShoppingListPdfButton list={list} />
                  </div>
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
