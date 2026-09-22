import Link from "next/link";
import { ArrowLeft, Phone } from "lucide-react";
import { publicApiFetch } from "@/lib/api";
import type { Menu } from "@/lib/types";
import { PresentationHeader } from "@/components/layout/presentation-header";
import { Badge } from "@/components/ui/badge";
import { formatSom } from "@/lib/utils";
import { DishCard } from "@/components/menus/dish-card";
import { MediaGallery } from "@/components/menus/media-gallery";
import { MediaPlaceholder } from "@/components/menus/media-placeholder";
import { OrnamentalPattern } from "@/components/menus/ornamental-pattern";
import {
  MENU_DISH_CATEGORIES,
  MENU_DISH_CATEGORY_LABELS_UZ,
  MENU_MEDIA_SECTIONS,
  MENU_MEDIA_SECTION_LABELS_UZ,
} from "@shodiyora/shared";

export default async function MenuShowcaseDetailPage({ params }: PageProps<"/menyular/[id]">) {
  const { id } = await params;
  const menu = await publicApiFetch<Menu>(`/menus/${id}`);
  const phone = process.env.NEXT_PUBLIC_CONTACT_PHONE ?? "+998 90 000 00 00";

  const dishesByCategory = MENU_DISH_CATEGORIES.map((category) => ({
    category,
    dishes: menu.dishes.filter((d) => d.category === category),
  })).filter((group) => group.dishes.length > 0);

  // HALL ("Umumiy zal") is first in MENU_MEDIA_SECTIONS, so it renders before
  // table decor / kortej / photographer sections automatically.
  const mediaBySection = MENU_MEDIA_SECTIONS.map((section) => ({
    section,
    media: menu.media.filter((m) => m.section === section),
  })).filter((group) => group.media.length > 0);

  return (
    <div className="showcase-dark min-h-screen bg-background text-foreground">
      <PresentationHeader />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <Link
          href="/menyular"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Barcha menyular
        </Link>

        {/* Hero */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
          <div className="relative aspect-[16/7] w-full overflow-hidden">
            {menu.coverImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={menu.coverImageUrl} alt={menu.name} className="h-full w-full object-cover" />
            ) : (
              <MediaPlaceholder className="aspect-[16/7]" />
            )}
            {menu.isVip && (
              <Badge variant="accent" className="absolute right-4 top-4 text-sm">
                VIP
              </Badge>
            )}
          </div>
          <div className="space-y-3 p-6 sm:p-8">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{menu.name}</h1>
            <span className="inline-flex items-center rounded-full bg-primary/15 px-4 py-1.5 text-lg font-semibold text-primary">
              {formatSom(menu.pricePerPerson)} / kishi
            </span>
            {menu.description && <p className="text-muted-foreground">{menu.description}</p>}
          </div>
        </div>

        {/* Taomlar */}
        {dishesByCategory.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-5 text-xl font-semibold tracking-tight">Taomlar</h2>
            <div className="space-y-8">
              {dishesByCategory.map(({ category, dishes }) => (
                <div key={category}>
                  <h3 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">
                    {MENU_DISH_CATEGORY_LABELS_UZ[category]}
                  </h3>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {dishes.map((dish) => (
                      <DishCard key={dish.id} dish={dish} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Umumiy zal, stol bezatilishi, kortej, fotosuratchi */}
        {mediaBySection.map(({ section, media }) => (
          <section key={section} className="mt-12">
            <h2 className="mb-5 text-xl font-semibold tracking-tight">{MENU_MEDIA_SECTION_LABELS_UZ[section]}</h2>
            <MediaGallery items={media} />
          </section>
        ))}

        {/* CTA */}
        <section className="relative mt-14 overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/20 via-card to-card p-8 text-center sm:p-10">
          <OrnamentalPattern id="cta-ornament" className="text-accent opacity-[0.06]" />
          <div className="relative">
            <p className="text-lg font-medium">Ushbu menyu bilan to&apos;y band qilmoqchimisiz?</p>
            <p className="mt-1 text-sm text-muted-foreground">Bog&apos;lanish uchun qo&apos;ng&apos;iroq qiling:</p>
            <a
              href={`tel:${phone.replace(/\s/g, "")}`}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-xl font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:scale-105"
            >
              <Phone className="h-5 w-5" /> {phone}
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
