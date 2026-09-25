import { apiFetch } from "@/lib/api";
import type { ProductCatalogItem, ShoppingList } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UNIT_LABELS_UZ } from "@shodiyora/shared";
import { formatDateTime, formatSom } from "@/lib/utils";
import { PurchaseItemForm } from "@/components/shopping-lists/purchase-item-form";
import { ShoppingListPdfButton } from "@/components/shopping-lists/shopping-list-pdf-button";
import { ProductCategoryIcon } from "@/components/inventory/product-category-icon";

const STATUS_LABEL: Record<string, { label: string; variant: "default" | "primary" | "success" }> = {
  SUBMITTED: { label: "Yangi", variant: "primary" },
  REVIEWED: { label: "Ko'rib chiqilgan", variant: "default" },
  PURCHASED: { label: "Sotib olingan", variant: "success" },
  CLOSED: { label: "Yopilgan", variant: "default" },
};

import { getLocale } from "@/i18n/locale";
import { getDictionary, translate } from "@/i18n/get-dictionary";

export default async function ShoppingListsPage() {
  const [lists, catalog, locale] = await Promise.all([
    apiFetch<ShoppingList[]>("/shopping-lists"),
    apiFetch<ProductCatalogItem[]>("/inventory/catalog"),
    getLocale(),
  ]);
  const t = (key: string) => translate(getDictionary(locale), key);
  const catalogByName = new Map(catalog.map((c) => [c.name, c]));

  // Opening this page counts as "seen" — clears the notification badge in the
  // sidebar/header on the next load without requiring further action.
  await apiFetch("/shopping-lists/mark-all-seen", { method: "PATCH" }).catch(() => undefined);

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">{t("shoppingLists.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("nav.shoppingLists")}</p>
      </div>

      {lists.length === 0 && (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">Hozircha ro&apos;yxatlar yo&apos;q.</CardContent>
        </Card>
      )}

      {lists.map((list) => {
        const status = STATUS_LABEL[list.status];
        return (
          <Card key={list.id}>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>{list.createdByWorker.fullName}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {formatDateTime(list.createdAt)}
                  {list.event && ` · ${list.event.clientName}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={status.variant}>{status.label}</Badge>
                <ShoppingListPdfButton list={list} />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {list.items.map((item) => {
                const catalogItem = catalogByName.get(item.name);
                return (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center gap-3 rounded-md border border-border p-3"
                  >
                    {catalogItem?.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={catalogItem.photoUrl}
                        alt={item.name}
                        className="h-10 w-10 rounded-md object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted text-muted-foreground">
                        {catalogItem?.productCategory && (
                          <ProductCategoryIcon category={catalogItem.productCategory} className="h-5 w-5" />
                        )}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity} {UNIT_LABELS_UZ[item.unit]}
                        {item.note && ` · ${item.note}`}
                      </p>
                    </div>
                    {item.isPurchased ? (
                      <Badge variant="success">
                        Sotib olindi{item.unitPrice ? ` · ${formatSom(item.unitPrice)}` : ""}
                      </Badge>
                    ) : (
                      <PurchaseItemForm listId={list.id} itemId={item.id} />
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
