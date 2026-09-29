"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useT } from "@/components/i18n/locale-provider";
import { BrandMark } from "@/components/brand/brand-mark";

export function PresentationHeader() {
  const t = useT();
  const phone = process.env.NEXT_PUBLIC_CONTACT_PHONE ?? "+998 90 000 00 00";

  return (
    <header className="sticky top-0 z-20 border-b border-border/80 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 py-3 sm:gap-3 sm:px-6 sm:py-4 2xl:max-w-7xl">
        <Link href="/dashboard" className="flex min-w-0 items-center gap-2.5 text-foreground">
          <BrandMark className="h-8 w-8 shrink-0 text-lg shadow-sm shadow-primary/20" />
          <span className="font-display truncate text-lg font-semibold tracking-tight sm:text-xl">{t("common.brand")}</span>
        </Link>
        <div className="flex shrink-0 items-center gap-1.5 text-sm sm:gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          <a
            href={`tel:${phone.replace(/\s/g, "")}`}
            className="ml-1 hidden font-medium text-foreground hover:text-primary lg:inline"
          >
            {phone}
          </a>
          <Link
            href="/dashboard"
            className="ml-1 flex items-center gap-1 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">{t("presentation.backToDashboard")}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
