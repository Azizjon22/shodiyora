import { publicApiFetch } from "@/lib/api";
import type { Menu } from "@/lib/types";
import { MenuShowcaseList } from "@/components/menus/templates/menu-showcase-list";

export const metadata = {
  title: "Menyular | Shodiyora",
  description: "Shodiyora to'yxonasining to'y menyu paketlari.",
};

export default async function MenuShowcasePage() {
  const menus = await publicApiFetch<Menu[]>("/menus");
  return <MenuShowcaseList menus={menus} />;
}
