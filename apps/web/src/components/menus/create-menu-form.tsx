"use client";

import { useActionState } from "react";
import { createMenuAction, type FormActionState } from "@/lib/actions/menus.actions";
import { Input, Label, Textarea, FieldError } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { SubmitButton } from "@/components/ui/submit-button";

const initialState: FormActionState = undefined;

export function CreateMenuForm() {
  const [state, formAction] = useActionState(createMenuAction, initialState);

  return (
    <form action={formAction} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <Label htmlFor="name">Menyu nomi</Label>
        <Input id="name" name="name" placeholder="masalan: 200 ming menyu" required />
      </div>
      <div>
        <Label htmlFor="pricePerPerson">1 kishiga narx (so&apos;m)</Label>
        <Input id="pricePerPerson" name="pricePerPerson" type="number" min={0} required />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="description">Tavsif</Label>
        <Textarea id="description" name="description" rows={2} />
      </div>
      <Checkbox id="isVip" name="isVip" label="VIP menyu" className="sm:col-span-2" />
      <FieldError>{state?.error}</FieldError>
      <SubmitButton pendingText="Yaratilmoqda..." className="sm:col-span-2 sm:w-fit">
        Menyu qo&apos;shish
      </SubmitButton>
    </form>
  );
}
