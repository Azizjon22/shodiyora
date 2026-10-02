import type { Menu } from "@/lib/types";
import type { MenuPackageType } from "@shodiyora/shared";

export const PACKAGE_TYPE_LABELS: Record<MenuPackageType, string> = {
  FULL: "To'liq paket (kortej, san'atkor, kamerachi)",
  FOOD_ONLY: "Faqat to'yxona taomlari",
};

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
