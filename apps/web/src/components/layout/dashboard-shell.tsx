"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Menu, X, LogOut } from "lucide-react";
import type { StaffRole } from "@shodiyora/shared";
import { STAFF_ROLE_LABELS_UZ } from "@shodiyora/shared";
import { NAV_ITEMS } from "./nav-config";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/lib/actions/auth.actions";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function DashboardShell({
  fullName,
  role,
  pendingShoppingListsCount = 0,
  children,
}: {
  fullName: string;
  role: StaffRole;
  pendingShoppingListsCount?: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const items = NAV_ITEMS.filter((item) => item.roles.includes(role));

  return (
    <div className="flex min-h-screen">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 shrink-0 transform border-r border-border bg-background transition-transform md:static md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <span className="flex items-center gap-2 text-[15px] font-semibold text-foreground">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              S
            </span>
            Shodiyora
          </span>
          <button className="md:hidden" onClick={() => setOpen(false)} aria-label="Yopish">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex flex-col gap-0.5 px-3 pb-3">
          {items.map((item) => {
            const active = item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href);
            const showBadge = item.href === "/dashboard/shopping-lists" && pendingShoppingListsCount > 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-foreground/75 hover:bg-muted hover:text-foreground",
                )}
              >
                {item.label}
                {showBadge && (
                  <span
                    className={cn(
                      "flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-semibold",
                      active ? "bg-primary/20 text-primary" : "bg-destructive text-destructive-foreground",
                    )}
                  >
                    {pendingShoppingListsCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      {open && (
        <button
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
          aria-label="Menyuni yopish"
        />
      )}

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border bg-background px-4 sm:px-6">
          <button className="md:hidden" onClick={() => setOpen(true)} aria-label="Menyu">
            <Menu className="h-6 w-6" />
          </button>
          <div className="hidden md:block" />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {pendingShoppingListsCount > 0 && (
              <Link
                href="/dashboard/shopping-lists"
                className="relative flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label={`${pendingShoppingListsCount} ta yangi bozorlik ro'yxati`}
              >
                <Bell className="h-4 w-4" />
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
                  {pendingShoppingListsCount}
                </span>
              </Link>
            )}
            <div className="text-right">
              <p className="text-sm font-medium leading-none">{fullName}</p>
              <p className="text-xs text-muted-foreground">{STAFF_ROLE_LABELS_UZ[role]}</p>
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Chiqish"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </header>
        <main className="flex-1 bg-background p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
