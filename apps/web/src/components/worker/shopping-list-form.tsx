"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Search, Trash2, X } from "lucide-react";
import {
  PRODUCT_CATEGORIES,
  PRODUCT_CATEGORY_LABELS_UZ,
  UNIT_LABELS_UZ,
  UNITS,
  type ProductCategory,
  type Unit,
} from "@shodiyora/shared";
import type { ProductCatalogItem, UpcomingEvent } from "@/lib/types";
import { Input, Label, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCategoryIcon } from "@/components/inventory/product-category-icon";
import { formatDate } from "@/lib/utils";

interface CustomRow {
  name: string;
  quantity: string;
  unit: Unit;
}

function emptyCustomRow(): CustomRow {
  return { name: "", quantity: "", unit: "KG" };
}

export function ShoppingListForm() {
  const router = useRouter();
  const [catalog, setCatalog] = useState<ProductCatalogItem[] | null>(null);
  const [catalogError, setCatalogError] = useState<string | undefined>();
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [eventId, setEventId] = useState<string>("");
  const [quantities, setQuantities] = useState<Record<string, string>>({});
  const [customRows, setCustomRows] = useState<CustomRow[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [activeCategory, setActiveCategory] = useState<ProductCategory | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/api/proxy/inventory/catalog")
      .then((res) => {
        if (!res.ok) throw new Error("Katalogni yuklab bo'lmadi");
        return res.json();
      })
      .then((data: ProductCatalogItem[]) => setCatalog(data))
      .catch((err) => setCatalogError(err instanceof Error ? err.message : "Xatolik yuz berdi"));

    fetch("/api/proxy/events/upcoming")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: UpcomingEvent[]) => setUpcomingEvents(data))
      .catch(() => undefined);
  }, []);

  function updateCustomRow(index: number, patch: Partial<CustomRow>) {
    setCustomRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function selectedCountFor(items: ProductCatalogItem[]) {
    return items.filter((item) => Number(quantities[item.id]) > 0).length;
  }

  const groupedCatalog = PRODUCT_CATEGORIES.map((category) => ({
    category,
    items: (catalog ?? []).filter((item) => item.productCategory === category),
  })).filter((group) => group.items.length > 0);

  const activeGroup = groupedCatalog.find((g) => g.category === activeCategory);

  const trimmedQuery = query.trim().toLowerCase();
  const searchResults = useMemo(() => {
    if (!trimmedQuery) return [];
    return (catalog ?? []).filter((item) => item.name.toLowerCase().includes(trimmedQuery));
  }, [catalog, trimmedQuery]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(undefined);

    const fromCatalog = (catalog ?? [])
      .filter((item) => Number(quantities[item.id]) > 0)
      .map((item) => ({ name: item.name, quantity: Number(quantities[item.id]), unit: item.unit }));

    const fromCustom = customRows
      .filter((r) => r.name.trim() && Number(r.quantity) > 0)
      .map((r) => ({ name: r.name.trim(), quantity: Number(r.quantity), unit: r.unit }));

    const items = [...fromCatalog, ...fromCustom];
    if (items.length === 0) {
      setError("Kamida bitta mahsulot tanlang yoki kiriting");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/proxy/shopping-lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, eventId: eventId || undefined }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message ?? "Yuborishda xatolik yuz berdi");
      }
      setQuantities({});
      setCustomRows([]);
      setActiveCategory(null);
      setEventId("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xatolik yuz berdi");
    } finally {
      setSubmitting(false);
    }
  }

  function renderCatalogItem(item: ProductCatalogItem, fallbackCategory: ProductCategory = "OTHER") {
    const selected = Number(quantities[item.id]) > 0;
    return (
      <div
        key={item.id}
        className={`overflow-hidden rounded-lg border bg-card transition-colors ${
          selected ? "border-primary ring-1 ring-primary" : "border-border"
        }`}
      >
        <div className="flex aspect-square w-full items-center justify-center bg-muted">
          {item.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.photoUrl} alt={item.name} className="h-full w-full object-cover" />
          ) : (
            <ProductCategoryIcon category={item.productCategory ?? fallbackCategory} className="h-8 w-8 text-muted-foreground" />
          )}
        </div>
        <div className="space-y-1.5 p-2">
          <p className="truncate text-xs font-medium sm:text-sm">{item.name}</p>
          <div className="flex items-center gap-1">
            <Input
              type="number"
              min={0}
              value={quantities[item.id] ?? ""}
              onChange={(e) => setQuantities((prev) => ({ ...prev, [item.id]: e.target.value }))}
              placeholder="0"
              className="h-8 text-sm"
            />
            <span className="text-xs text-muted-foreground">{UNIT_LABELS_UZ[item.unit]}</span>
          </div>
        </div>
      </div>
    );
  }

  if (activeGroup) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setActiveCategory(null)}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Barcha turkumlar
        </button>
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <ProductCategoryIcon category={activeGroup.category} className="h-5 w-5 text-muted-foreground" />
          {PRODUCT_CATEGORY_LABELS_UZ[activeGroup.category]}
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {activeGroup.items.map((item) => renderCatalogItem(item, activeGroup.category))}
        </div>
        <Button type="button" onClick={() => setActiveCategory(null)} className="w-full sm:w-fit">
          Tayyor — turkumlarga qaytish
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {catalogError && <p className="text-sm text-destructive">{catalogError}</p>}
      {!catalog && !catalogError && <p className="text-sm text-muted-foreground">Yuklanmoqda...</p>}

      {upcomingEvents.length > 0 && (
        <div className="rounded-lg border-2 border-primary/30 bg-primary/5 p-3">
          <Label htmlFor="eventId" className="text-sm font-semibold">
            Bu ro&apos;yxatni qaysi to&apos;yga yozamiz?
          </Label>
          <p className="mb-2 text-xs text-muted-foreground">
            Tanlangan to&apos;y sahifasida bu bozorlikka ketgan xarajat ko&apos;rinadi.
          </p>
          <Select id="eventId" value={eventId} onChange={(e) => setEventId(e.target.value)}>
            <option value="">Tanlanmagan — umumiy zaxira uchun</option>
            {upcomingEvents.map((event) => (
              <option key={event.id} value={event.id}>
                {formatDate(event.eventDate)} — {event.clientName}
              </option>
            ))}
          </Select>
        </div>
      )}

      <div>
        <Label htmlFor="catalog-search">Mahsulot qidirish</Label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="catalog-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Masalan: kartoshka, sabzi..."
            className="pl-9 pr-9"
          />
          {query && (
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
      </div>

      {trimmedQuery ? (
        searchResults.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {searchResults.map((item) => renderCatalogItem(item))}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
            &quot;{query}&quot; topilmadi. Pastdagi &quot;Ro&apos;yxatda yo&apos;q mahsulot&quot; orqali qo&apos;lda
            qo&apos;shishingiz mumkin.
          </p>
        )
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {groupedCatalog.map(({ category, items }) => {
            const selectedCount = selectedCountFor(items);
            return (
              <button
                type="button"
                key={category}
                onClick={() => setActiveCategory(category)}
                className="group overflow-hidden rounded-lg border border-border bg-card text-left shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="relative flex aspect-video w-full items-center justify-center bg-muted">
                  <ProductCategoryIcon category={category} className="h-10 w-10 text-muted-foreground" />
                  {selectedCount > 0 && (
                    <Badge variant="primary" className="absolute right-2 top-2">
                      {selectedCount} tanlandi
                    </Badge>
                  )}
                </div>
                <div className="space-y-0.5 p-3">
                  <p className="font-semibold">{PRODUCT_CATEGORY_LABELS_UZ[category]}</p>
                  <p className="text-xs text-muted-foreground">{items.length} ta mahsulot</p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <div>
        <p className="mb-2 text-sm font-medium">Ro&apos;yxatda yo&apos;q mahsulot</p>
        <div className="space-y-3">
          {customRows.map((row, index) => (
            <div key={index} className="grid grid-cols-[1fr_90px_100px_auto] items-end gap-2">
              <Input
                value={row.name}
                onChange={(e) => updateCustomRow(index, { name: e.target.value })}
                placeholder="mahsulot nomi"
              />
              <Input
                type="number"
                min={0}
                value={row.quantity}
                onChange={(e) => updateCustomRow(index, { quantity: e.target.value })}
                placeholder="miqdor"
              />
              <Select value={row.unit} onChange={(e) => updateCustomRow(index, { unit: e.target.value as Unit })}>
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {UNIT_LABELS_UZ[u]}
                  </option>
                ))}
              </Select>
              <button
                type="button"
                onClick={() => setCustomRows((prev) => prev.filter((_, i) => i !== index))}
                className="flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                aria-label="O'chirish"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={() => setCustomRows((prev) => [...prev, emptyCustomRow()])}
        >
          <Plus className="h-4 w-4" /> Boshqa mahsulot qo&apos;shish
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={submitting} className="w-full sm:w-fit">
        {submitting ? "Yuborilmoqda..." : "Ro'yxatni yuborish"}
      </Button>
    </form>
  );
}
