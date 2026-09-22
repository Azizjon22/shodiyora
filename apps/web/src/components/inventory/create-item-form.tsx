"use client";

import { useState } from "react";
import { useActionState } from "react";
import {
  INVENTORY_CATEGORIES,
  INVENTORY_CATEGORY_LABELS_UZ,
  PRODUCT_CATEGORIES,
  PRODUCT_CATEGORY_LABELS_UZ,
  UNITS,
  UNIT_LABELS_UZ,
} from "@shodiyora/shared";
import { createInventoryItemAction, type FormActionState } from "@/lib/actions/inventory.actions";
import { Input, Label, Select, FieldError } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { UploadField } from "@/components/uploads/upload-field";

const initialState: FormActionState = undefined;

export function CreateItemForm() {
  const [state, formAction] = useActionState(createInventoryItemAction, initialState);
  const [category, setCategory] = useState<(typeof INVENTORY_CATEGORIES)[number]>("PRODUCT");
  const isDishware = category === "DISHWARE";

  return (
    <form action={formAction} className="grid grid-cols-1 gap-4 sm:grid-cols-5">
      <div className="sm:col-span-2">
        <Label htmlFor="name">Nomi</Label>
        <Input id="name" name="name" placeholder={isDishware ? "masalan: tarelka" : "masalan: guruch"} required />
      </div>
      <div>
        <Label htmlFor="category">Turi</Label>
        <Select
          id="category"
          name="category"
          value={category}
          onChange={(e) => setCategory(e.target.value as typeof category)}
        >
          {INVENTORY_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {INVENTORY_CATEGORY_LABELS_UZ[c]}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="unit">Birlik</Label>
        {isDishware ? (
          <>
            <input type="hidden" name="unit" value="DONA" />
            <Input value={UNIT_LABELS_UZ.DONA} disabled />
          </>
        ) : (
          <Select id="unit" name="unit">
            {UNITS.map((u) => (
              <option key={u} value={u}>
                {UNIT_LABELS_UZ[u]}
              </option>
            ))}
          </Select>
        )}
      </div>
      <div>
        <Label htmlFor="minThreshold">Minimal zaxira</Label>
        <Input id="minThreshold" name="minThreshold" type="number" min={0} />
      </div>

      {!isDishware && (
        <div>
          <Label htmlFor="productCategory">Oziq-ovqat turkumi</Label>
          <Select id="productCategory" name="productCategory">
            {PRODUCT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {PRODUCT_CATEGORY_LABELS_UZ[c]}
              </option>
            ))}
          </Select>
        </div>
      )}

      <div className="sm:col-span-2">
        <UploadField name="photoUrl" label="Rasm (ixtiyoriy)" folder="inventory" />
      </div>

      <FieldError>{state?.error}</FieldError>
      <SubmitButton pendingText="Qo'shilmoqda..." variant="outline" className="sm:w-fit">
        Qo&apos;shish
      </SubmitButton>
    </form>
  );
}
