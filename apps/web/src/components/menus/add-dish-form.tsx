"use client";

import { useActionState, useRef, useEffect } from "react";
import { MENU_DISH_CATEGORIES, MENU_DISH_CATEGORY_LABELS_UZ } from "@shodiyora/shared";
import { addDishAction, type FormActionState } from "@/lib/actions/menus.actions";
import { Input, Label, Select, Textarea, FieldError } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { UploadField } from "@/components/uploads/upload-field";

const initialState: FormActionState = undefined;

export function AddDishForm({ menuId }: { menuId: string }) {
  const action = addDishAction.bind(null, menuId);
  const [state, formAction] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state?.error) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <Label htmlFor="category">Turkum</Label>
        <Select id="category" name="category" required>
          {MENU_DISH_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {MENU_DISH_CATEGORY_LABELS_UZ[c]}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="name">Taom nomi</Label>
        <Input id="name" name="name" required />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="description">Qisqa tavsif (ixtiyoriy)</Label>
        <Textarea id="description" name="description" rows={2} />
      </div>
      <div className="sm:col-span-2">
        <UploadField name="photoUrl" label="Rasm (ixtiyoriy)" folder="menus" />
      </div>
      <FieldError>{state?.error}</FieldError>
      <SubmitButton pendingText="Qo'shilmoqda..." variant="outline" className="sm:w-fit">
        Taom qo&apos;shish
      </SubmitButton>
    </form>
  );
}
