import Link from "next/link";
import { apiFetch } from "@/lib/api";
import type { Menu } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatSom } from "@/lib/utils";
import { CreateMenuForm } from "@/components/menus/create-menu-form";
import { getLocale } from "@/i18n/locale";
import { getDictionary, translate } from "@/i18n/get-dictionary";

export default async function MenusPage() {
  const [menus, locale] = await Promise.all([apiFetch<Menu[]>("/menus"), getLocale()]);
  const t = (key: string) => translate(getDictionary(locale), key);

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">{t("menus.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("presentation.heroSubtitle")}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {menus.map((menu) => (
          <Link key={menu.id} href={`/dashboard/menus/${menu.id}`}>
            <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
              <div className="flex h-32 items-center justify-center bg-muted text-muted-foreground">
                {menu.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={menu.coverImageUrl} alt={menu.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-sm">Rasm yo&apos;q</span>
                )}
              </div>
              <CardContent className="space-y-2 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{menu.name}</p>
                  {menu.isVip && <Badge variant="accent">VIP</Badge>}
                </div>
                <p className="text-sm text-primary">{formatSom(menu.pricePerPerson, locale)} / kishi</p>
                <p className="text-xs text-muted-foreground">{menu.dishes.length} ta taom</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Yangi menyu qo&apos;shish</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateMenuForm />
        </CardContent>
      </Card>
    </div>
  );
}
