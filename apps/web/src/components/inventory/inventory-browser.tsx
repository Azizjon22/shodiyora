"use client";

import { useMemo, useState } from "react";
import { Search, UtensilsCrossed, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CollapsibleCard } from "@/components/ui/collapsible-card";
import { Badge } from "@/components/ui/badge";
import { PRODUCT_CATEGORIES, PRODUCT_CATEGORY_LABELS_UZ } from "@shodiyora/shared";
import type { InventoryItem } from "@/lib/types";
import { ItemRow, isLowStock } from "./item-row";
import { ProductCategoryIcon } from "./product-category-icon";

export function InventoryBrowser({ items }: { items: InventoryItem[] }) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const searching = q.length > 0;

  const filtered = useMemo(
    () => (q ? items.filter((item) => item.name.toLowerCase().includes(q)) : items),
    [items, q],
  );

  const dishwareItems = filtered.filter((item) => item.category === "DISHWARE");
  const productItems = filtered.filter((item) => item.category === "PRODUCT");
  const productGroups = PRODUCT_CATEGORIES.map((category) => ({
    category,
    items: productItems.filter((item) => (item.productCategory ?? "OTHER") === category),
  })).filter((group) => group.items.length > 0);

  const noMatches = searching && dishwareItems.length === 0 && productGroups.length === 0;

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Mahsulot yoki idish qidirish..."
          className="pl-9 pr-9"
        />
        {searching && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Qidiruvni tozalash"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {noMatches && (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            &quot;{query}&quot; bo&apos;yicha hech narsa topilmadi.
          </CardContent>
        </Card>
      )}

      {dishwareItems.length > 0 && (
        <CollapsibleCard
          key={`dishware-${searching}`}
          icon={<UtensilsCrossed className="h-4 w-4 text-muted-foreground" />}
          title="Idish-tovoqlar"
          meta={<Badge variant="default">{dishwareItems.length}</Badge>}
          defaultOpen={searching}
        >
          <div className="space-y-2">
            {dishwareItems.map((item) => (
              <ItemRow key={item.id} item={item} />
            ))}
          </div>
        </CollapsibleCard>
      )}

      {productItems.length === 0 && !searching && (
        <Card>
          <CardHeader>
            <CardTitle>Mahsulotlar</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Hali mahsulot qo&apos;shilmagan.</p>
          </CardContent>
        </Card>
      )}

      {productGroups.map(({ category, items: categoryItems }) => {
        const lowCount = categoryItems.filter(isLowStock).length;
        return (
          <CollapsibleCard
            key={`${category}-${searching}`}
            icon={<ProductCategoryIcon category={category} className="h-4 w-4 text-muted-foreground" />}
            title={PRODUCT_CATEGORY_LABELS_UZ[category]}
            meta={
              <div className="flex items-center gap-2">
                {lowCount > 0 && <Badge variant="destructive">{lowCount} kam qoldi</Badge>}
                <Badge variant="default">{categoryItems.length}</Badge>
              </div>
            }
            defaultOpen={searching}
          >
            <div className="space-y-2">
              {categoryItems.map((item) => (
                <ItemRow key={item.id} item={item} />
              ))}
            </div>
          </CollapsibleCard>
        );
      })}
    </div>
  );
}
