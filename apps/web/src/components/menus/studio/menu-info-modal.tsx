"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Menu } from "@/lib/types";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { UploadField } from "@/components/uploads/upload-field";
import { MENU_GUEST_COUNTS, MENU_PACKAGE_TYPES } from "@shodiyora/shared";
import { packageTypeLabel } from "../packages";
import { useT } from "@/components/i18n/locale-provider";
import { menuApi, errorText } from "./api";

/** Create a menu (menu = undefined) or edit its name, price, text, cover, VIP flag. */
export function MenuInfoModal({ open, onClose, menu }: { open: boolean; onClose: () => void; menu?: Menu }) {
  const t = useT();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | undefined>();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const price = Number(form.get("price"));
    const guestCount = Number(form.get("guestCount"));
    const packageType = String(form.get("packageType") ?? "");
    if (name.length < 2) return setError(t("menuStudio.nameRequired"));
    if (!(price > 0)) return setError(t("menuStudio.priceRequired"));
    if (!(guestCount > 0)) return setError(t("menuStudio.guestCountRequired"));

    const cover = String(form.get("coverImageUrl") ?? "");
    const body = {
      name,
      price,
      guestCount,
      packageType,
      description: String(form.get("description") ?? "").trim(),
      isVip: form.get("isVip") === "on",
      coverImageUrl: cover || (menu ? null : undefined),
    };

    setBusy(true);
    setError(undefined);
    try {
      if (menu) {
        await menuApi(`/${menu.id}`, "PATCH", body);
        onClose();
        router.refresh();
      } else {
        const created = await menuApi<{ id: string }>("", "POST", body);
        router.push(`/dashboard/menus/${created.id}`);
      }
    } catch (err) {
      setError(errorText(err, t("common.genericError")));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={menu ? t("menuStudio.editMenuTitle") : t("menuStudio.newMenuTitle")}
      description={menu ? undefined : t("menuStudio.newMenuDescription")}
      size="lg"
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onClose} disabled={busy}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" form="menu-info-form" disabled={busy}>
            {busy ? t("common.saving") : menu ? t("common.save") : t("menuStudio.createMenu")}
          </Button>
        </>
      }
    >
      <form id="menu-info-form" onSubmit={onSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-[260px_minmax(0,1fr)]">
        <div className="sm:row-span-2">
          <UploadField
            name="coverImageUrl"
            label={t("menuStudio.coverImage")}
            folder="menus"
            minWidth={1920}
            minHeight={1080}
            defaultValue={menu?.coverImageUrl}
          />
          <p className="mt-1.5 text-xs text-muted-foreground">{t("menuStudio.coverImageHint")}</p>
        </div>
        <div>
          <Label htmlFor="menu-name">{t("menuStudio.menuName")}</Label>
          <Input
            id="menu-name"
            name="name"
            defaultValue={menu?.name}
            placeholder={t("menuStudio.menuNamePlaceholder")}
            required
          />
        </div>
        <div>
          <Label htmlFor="menu-package-type">{t("menuStudio.packageType")}</Label>
          <Select id="menu-package-type" name="packageType" defaultValue={menu?.packageType ?? "FULL"} required>
            {MENU_PACKAGE_TYPES.map((type) => (
              <option key={type} value={type}>
                {packageTypeLabel(t, type)}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="menu-guest-count">{t("menuStudio.guestCount")}</Label>
          <Select id="menu-guest-count" name="guestCount" defaultValue={menu?.guestCount ?? 100} required>
            {(menu && !MENU_GUEST_COUNTS.includes(menu.guestCount as (typeof MENU_GUEST_COUNTS)[number])
              ? [...MENU_GUEST_COUNTS, menu.guestCount].sort((a, b) => a - b)
              : MENU_GUEST_COUNTS
            ).map((count) => (
              <option key={count} value={count}>
                {t("menuStudio.guestsCount", { count })}
              </option>
            ))}
          </Select>
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="menu-price">{t("menuStudio.packagePrice")}</Label>
          <Input
            id="menu-price"
            name="price"
            type="number"
            min={1}
            defaultValue={menu ? Number(menu.price) : undefined}
            required
          />
          {menu && <p className="mt-1 text-xs text-muted-foreground">{t("menuStudio.priceLockedHint")}</p>}
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="menu-description">{t("menuStudio.descriptionLabel")}</Label>
          <Textarea
            id="menu-description"
            name="description"
            rows={3}
            defaultValue={menu?.description ?? ""}
            placeholder={t("menuStudio.descriptionPlaceholder")}
          />
        </div>
        <div className="sm:col-span-2">
          <Switch name="isVip" defaultChecked={menu?.isVip} label={t("menuStudio.vipSwitch")} />
        </div>
        {error && <p className="text-sm text-destructive sm:col-span-2">{error}</p>}
      </form>
    </Modal>
  );
}
