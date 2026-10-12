import { formatQuantity } from "@shodiyora/shared";
import type { ShoppingListItem } from "@/lib/types";

/** "5 kg", or "8 → 5 kg" when SUPER_ADMIN corrected the chef's figure. */
export function ItemQuantity({ item }: { item: Pick<ShoppingListItem, "quantity" | "originalQuantity" | "unit"> }) {
  const original = item.originalQuantity === null ? null : Number(item.originalQuantity);

  if (original === 0) {
    return (
      <span>
        {formatQuantity(item.quantity, item.unit)} <span className="text-xs text-accent">(qo&apos;shildi)</span>
      </span>
    );
  }
  if (original !== null) {
    return (
      <span>
        <span className="text-muted-foreground line-through">{formatQuantity(original, item.unit)}</span> →{" "}
        {formatQuantity(item.quantity, item.unit)}
      </span>
    );
  }
  return (
    <span>{formatQuantity(item.quantity, item.unit)}</span>
  );
}
