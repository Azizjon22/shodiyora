"use client";

import { useRef, useState } from "react";
import { MENU_DISH_CATEGORIES, type MenuDishCategory } from "@shodiyora/shared";
import type { MenuDish } from "@/lib/types";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { UploadField } from "@/components/uploads/upload-field";
import { useT } from "@/components/i18n/locale-provider";
import { menuApi, errorText } from "./api";

export function DishModal({
  open,
  onClose,
  onSaved,
  menuId,
  dish,
  category,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  menuId: string;
  dish?: MenuDish;
  category?: MenuDishCategory;
}) {
  const t = useT();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | undefined>();
  // A ref, not state: the button click and the submit run in the same tick.
  const again = useRef(false);
  const [formKey, setFormKey] = useState(0);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    if (name.length < 2) return setError(t("menuStudio.dishNameRequired"));
    const photo = String(form.get("photoUrl") ?? "");
    const body = {
      category: form.get("category"),
      name,
      description: String(form.get("description") ?? "").trim(),
      photoUrl: photo || (dish ? null : undefined),
    };

    setBusy(true);
    setError(undefined);
    try {
      if (dish) await menuApi(`/${menuId}/dishes/${dish.id}`, "PATCH", body);
      else await menuApi(`/${menuId}/dishes`, "POST", body);
      onSaved();
      // "Save & add another" keeps the dialog open on a fresh form, same course.
      if (again.current && !dish) setFormKey((k) => k + 1);
      else onClose();
    } catch (err) {
      setError(errorText(err, t("common.genericError")));
    } finally {
      setBusy(false);
    }
  }

  const defaultCategory = dish?.category ?? category ?? "SALAD";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={dish ? t("menuStudio.editDish") : t("menuStudio.addDish")}
      size="lg"
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onClose} disabled={busy}>
            {t("common.cancel")}
          </Button>
          {!dish && (
            <Button type="submit" form="dish-form" variant="outline" disabled={busy} onClick={() => (again.current = true)}>
              {t("menuStudio.saveAndAddAnother")}
            </Button>
          )}
          <Button type="submit" form="dish-form" disabled={busy} onClick={() => (again.current = false)}>
            {busy ? t("common.saving") : t("common.save")}
          </Button>
        </>
      }
    >
      <form key={formKey} id="dish-form" onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-[220px_1fr]">
        <div className="sm:row-span-3">
          <UploadField name="photoUrl" label={t("menuStudio.photo")} folder="menus" aspect="square" defaultValue={dish?.photoUrl} />
        </div>
        <div>
          <Label htmlFor="dish-category">{t("menuStudio.category")}</Label>
          <Select id="dish-category" name="category" defaultValue={defaultCategory}>
            {MENU_DISH_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {t(`dishCategories.${c}`)}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="dish-name">{t("menuStudio.dishName")}</Label>
          <Input
            id="dish-name"
            name="name"
            defaultValue={dish?.name}
            placeholder={t("menuStudio.dishNamePlaceholder")}
            autoFocus
            required
          />
        </div>
        <div>
          <Label htmlFor="dish-description">{t("menuStudio.shortDescription")}</Label>
          <Textarea
            id="dish-description"
            name="description"
            rows={3}
            defaultValue={dish?.description ?? ""}
            placeholder={t("menuStudio.shortDescriptionPlaceholder")}
          />
        </div>
        {error && <p className="text-sm text-destructive sm:col-span-2">{error}</p>}
      </form>
    </Modal>
  );
}
