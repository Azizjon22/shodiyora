import type { InventoryItem } from "@/lib/types";
import { UNIT_LABELS_UZ } from "@shodiyora/shared";
import { Badge } from "@/components/ui/badge";
import { AdjustStock } from "./adjust-stock";
import { ProductCategoryIcon } from "./product-category-icon";
import { cn } from "@/lib/utils";

export function isLowStock(item: InventoryItem) {
  return item.minThreshold != null && Number(item.quantity) <= Number(item.minThreshold);
}

function stockRatio(item: InventoryItem) {
  if (item.minThreshold == null) return null;
  const min = Number(item.minThreshold);
  if (min <= 0) return null;
  return Math.min(Number(item.quantity) / (min * 2), 1);
}

export function ItemRow({ item }: { item: InventoryItem }) {
  const low = isLowStock(item);
  const ratio = stockRatio(item);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 rounded-lg border p-3 transition-colors",
        low ? "border-destructive/30 bg-destructive/[0.04]" : "border-border bg-card hover:border-input",
      )}
    >
      {item.category === "PRODUCT" &&
        (item.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.photoUrl} alt={item.name} className="h-11 w-11 shrink-0 rounded-lg object-cover" />
        ) : (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            {item.productCategory && <ProductCategoryIcon category={item.productCategory} className="h-5 w-5" />}
          </div>
        ))}
      <div className="min-w-40 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">{item.name}</p>
          {low && <Badge variant="destructive">Kam qoldi</Badge>}
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {item.quantity} {UNIT_LABELS_UZ[item.unit]}
          {item.minThreshold && ` · min: ${item.minThreshold}`}
        </p>
        {ratio != null && (
          <div className="mt-1.5 h-1 w-28 max-w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full transition-[width]",
                low ? "bg-destructive" : ratio < 0.6 ? "bg-accent" : "bg-success",
              )}
              style={{ width: `${Math.round(ratio * 100)}%` }}
            />
          </div>
        )}
      </div>
      <AdjustStock itemId={item.id} />
    </div>
  );
}
