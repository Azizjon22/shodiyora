"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Menu } from "@/lib/types";
import { PresentationHeader } from "@/components/layout/presentation-header";
import { MediaPlaceholder } from "@/components/menus/media-placeholder";
import { ShowcaseHero } from "@/components/menus/showcase-hero";
import { Badge } from "@/components/ui/badge";
import { formatSom, cn } from "@/lib/utils";
import { useLocale } from "@/components/i18n/locale-provider";

export function MenuShowcaseList({ menus }: { menus: Menu[] }) {
  const { t, locale } = useLocale();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PresentationHeader />
      <ShowcaseHero title={t("presentation.heroTitle")} subtitle={t("presentation.heroSubtitle")} />
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="flex flex-wrap justify-center gap-6">
          {menus.map((menu) => (
            <Link
              key={menu.id}
              href={`/showcase/${menu.id}`}
              className={cn(
                "group relative w-full overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300",
                "hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10",
                "sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]",
              )}
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
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-70" />
                {menu.isVip && (
                  <Badge variant="accent" className="absolute right-3 top-3 shadow-md">
                    {t("common.vip")}
                  </Badge>
                )}
              </div>
              <div className="space-y-1.5 p-5">
                <p className="font-semibold">{menu.name}</p>
                <p className="text-lg font-semibold text-primary">
                  {formatSom(menu.pricePerPerson, locale)} {t("common.perPerson")}
                </p>
                {menu.description && (
                  <p className="line-clamp-2 text-sm text-muted-foreground">{menu.description}</p>
                )}
                <p className="flex items-center gap-1 pt-1 text-xs font-medium text-accent opacity-0 transition-opacity group-hover:opacity-100">
                  {t("common.details")} <ArrowRight className="h-3 w-3" />
                </p>
              </div>
            </Link>
          ))}
        </div>
        {menus.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">{t("presentation.empty")}</p>
        )}
      </main>
    </div>
  );
}
