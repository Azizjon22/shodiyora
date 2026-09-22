import { UtensilsCrossed, Package, PackageX, Plus } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { InventoryItem } from "@/lib/types";
import { StatCard } from "@/components/ui/stat-card";
import { CollapsibleCard } from "@/components/ui/collapsible-card";
import { InventoryBrowser } from "@/components/inventory/inventory-browser";
import { CreateItemForm } from "@/components/inventory/create-item-form";
import { isLowStock } from "@/components/inventory/item-row";

export default async function InventoryPage() {
  const items = await apiFetch<InventoryItem[]>("/inventory");

  const dishwareItems = items.filter((item) => item.category === "DISHWARE");
  const productItems = items.filter((item) => item.category === "PRODUCT");
  const totalDishwareCount = dishwareItems.reduce((sum, item) => sum + Number(item.quantity), 0);
  const lowStockCount = items.filter(isLowStock).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Ombor</h1>
        <p className="text-sm text-muted-foreground">Idish-tovoqlar va mahsulotlar zaxirasi</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Idish-tovoq turlari" value={dishwareItems.length} icon={<UtensilsCrossed className="h-5 w-5" />} tone="primary" />
        <StatCard label="Jami idish-tovoqlar soni" value={`${totalDishwareCount} dona`} icon={<UtensilsCrossed className="h-5 w-5" />} tone="accent" />
        <StatCard label="Mahsulot turlari" value={productItems.length} icon={<Package className="h-5 w-5" />} />
        <StatCard
          label="Kam qolganlar"
          value={lowStockCount}
          icon={<PackageX className="h-5 w-5" />}
          tone={lowStockCount > 0 ? "destructive" : "default"}
        />
      </div>

      <InventoryBrowser items={items} />

      <CollapsibleCard icon={<Plus className="h-4 w-4 text-muted-foreground" />} title="Yangi qo'shish">
        <CreateItemForm />
      </CollapsibleCard>
    </div>
  );
}
