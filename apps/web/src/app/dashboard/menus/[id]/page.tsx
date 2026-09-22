import { apiFetch } from "@/lib/api";
import type { Menu } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatSom } from "@/lib/utils";
import { MENU_DISH_CATEGORY_LABELS_UZ, MENU_MEDIA_SECTION_LABELS_UZ } from "@shodiyora/shared";
import { AddDishForm } from "@/components/menus/add-dish-form";
import { AddMediaForm } from "@/components/menus/add-media-form";
import { DeleteIconButton } from "@/components/ui/delete-icon-button";
import { removeDishAction, removeMediaAction } from "@/lib/actions/menus.actions";

export default async function MenuDetailPage({ params }: PageProps<"/dashboard/menus/[id]">) {
  const { id } = await params;
  const menu = await apiFetch<Menu>(`/menus/${id}`);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{menu.name}</h1>
          <p className="text-sm text-primary">{formatSom(menu.pricePerPerson)} / kishi</p>
        </div>
        {menu.isVip && <Badge variant="accent">VIP</Badge>}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Taomlar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {menu.dishes.map((dish) => (
              <div key={dish.id} className="flex items-center gap-3 rounded-md border border-border p-3">
                {dish.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={dish.photoUrl} alt={dish.name} className="h-14 w-14 rounded-md object-cover" />
                ) : (
                  <div className="h-14 w-14 rounded-md bg-muted" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium">{dish.name}</p>
                  <p className="text-xs text-muted-foreground">{MENU_DISH_CATEGORY_LABELS_UZ[dish.category]}</p>
                  {dish.description && <p className="mt-0.5 text-xs text-muted-foreground">{dish.description}</p>}
                </div>
                <DeleteIconButton action={removeDishAction.bind(null, menu.id, dish.id)} />
              </div>
            ))}
            {menu.dishes.length === 0 && (
              <p className="text-sm text-muted-foreground sm:col-span-2">Hali taom qo&apos;shilmagan.</p>
            )}
          </div>
          <AddDishForm menuId={menu.id} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Media (zal, stol bezatilishi, kortej, fotosuratchi)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {menu.media.map((item) => (
              <div key={item.id} className="relative overflow-hidden rounded-md border border-border">
                {item.mediaType === "PHOTO" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.url} alt={item.caption ?? ""} className="h-32 w-full object-cover" />
                ) : (
                  <video src={item.url} className="h-32 w-full object-cover" controls />
                )}
                <div className="flex items-center justify-between p-2">
                  <span className="text-xs text-muted-foreground">{MENU_MEDIA_SECTION_LABELS_UZ[item.section]}</span>
                  <DeleteIconButton action={removeMediaAction.bind(null, menu.id, item.id)} />
                </div>
              </div>
            ))}
            {menu.media.length === 0 && (
              <p className="text-sm text-muted-foreground sm:col-span-3">Hali fayl qo&apos;shilmagan.</p>
            )}
          </div>
          <AddMediaForm menuId={menu.id} />
        </CardContent>
      </Card>
    </div>
  );
}
