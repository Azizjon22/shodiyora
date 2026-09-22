import type { StaffRole } from "@shodiyora/shared";

export interface NavItem {
  href: string;
  label: string;
  roles: StaffRole[];
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Boshqaruv paneli", roles: ["SUPER_ADMIN", "ADMIN", "ZAVZAL"] },
  { href: "/dashboard/events", label: "To'ylar", roles: ["SUPER_ADMIN", "ADMIN", "ZAVZAL"] },
  { href: "/dashboard/menus", label: "Menyular", roles: ["SUPER_ADMIN", "ADMIN"] },
  { href: "/menyular", label: "Mijozga taqdimot", roles: ["SUPER_ADMIN", "ADMIN"] },
  { href: "/dashboard/workers", label: "Ishchilar", roles: ["SUPER_ADMIN", "ADMIN", "ZAVZAL"] },
  { href: "/dashboard/inventory", label: "Ombor", roles: ["SUPER_ADMIN", "ADMIN"] },
  { href: "/dashboard/shopping-lists", label: "Bozorlik ro'yxatlari", roles: ["SUPER_ADMIN", "ADMIN"] },
  { href: "/dashboard/accounting", label: "Hisob-kitob", roles: ["SUPER_ADMIN", "ADMIN"] },
  { href: "/dashboard/staff", label: "Xodimlar", roles: ["SUPER_ADMIN"] },
];
