import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { publicApiFetch } from "@/lib/api";
import type { Menu } from "@/lib/types";
import { PresentationHeader } from "@/components/layout/presentation-header";
import { MediaPlaceholder } from "@/components/menus/media-placeholder";
import { ShowcaseHero } from "@/components/menus/showcase-hero";
import { Badge } from "@/components/ui/badge";
import { formatSom } from "@/lib/utils";

export const metadata = {
  title: "Menyular | Shodiyora to'yxonasi",
  description: "Shodiyora to'yxonasining to'y menyu paketlari: taomlar, narxlar va rasmlar.",
};

export default async function MenuShowcasePage() {
  const menus = await publicApiFetch<Menu[]>("/menus");

  return (
    <div className="showcase-dark min-h-screen bg-background text-foreground">
      <PresentationHeader />

      <ShowcaseHero
        title="To'y menyu paketlari"
        subtitle="O'zingizga mos menyuni tanlang — har birida taomlar, stol bezatilishi va boshqa tafsilotlarni ko'rishingiz mumkin."
      />

      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {menus.map((menu) => (
            <Link
              key={menu.id}
              href={`/menyular/${menu.id}`}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-accent/50 hover:shadow-2xl hover:shadow-primary/10"
            >
              <div className="relative aspect-video w-full overflow-hidden">
                {menu.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={menu.coverImageUrl}
                    alt={menu.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <MediaPlaceholder />
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-60" />
                {menu.isVip && (
                  <Badge variant="accent" className="absolute right-3 top-3 shadow-md">
                    VIP
                  </Badge>
                )}
              </div>
              <div className="space-y-1.5 p-5">
                <p className="font-semibold">{menu.name}</p>
                <p className="text-lg font-semibold text-primary">{formatSom(menu.pricePerPerson)} / kishi</p>
                {menu.description && (
                  <p className="line-clamp-2 text-sm text-muted-foreground">{menu.description}</p>
                )}
                <p className="flex items-center gap-1 pt-1 text-xs font-medium text-accent opacity-0 transition-opacity group-hover:opacity-100">
                  Batafsil ko&apos;rish <ArrowRight className="h-3 w-3" />
                </p>
              </div>
            </Link>
          ))}
        </div>

        {menus.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">Hozircha menyular qo&apos;shilmagan.</p>
        )}
      </main>
    </div>
  );
}
