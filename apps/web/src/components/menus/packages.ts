import type { Menu } from "@/lib/types";
import type { MenuPackageType } from "@shodiyora/shared";
import type { TranslationKey } from "@/i18n/get-dictionary";

type T = (key: TranslationKey | string, params?: Record<string, string | number>) => string;

export function packageTypeLabel(t: T, type: MenuPackageType): string {
  return type === "FULL" ? t("menuStudio.packageFull") : t("menuStudio.packageFoodOnly");
}

/** FULL before FOOD_ONLY, then by guest count, then by price. */
export function sortMenus<T extends Pick<Menu, "packageType" | "guestCount" | "price">>(
  menus: T[],
): T[] {
  return [...menus].sort((a, b) => {
    if (a.packageType !== b.packageType) {
      return a.packageType === "FULL" ? -1 : 1;
    }
    if (a.guestCount !== b.guestCount) return a.guestCount - b.guestCount;
    return Number(a.price) - Number(b.price);
  });
}
