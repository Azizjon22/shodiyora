"use client";

import { useActionState } from "react";
import { WORKER_GENDERS, WORKER_GENDER_LABELS_UZ } from "@shodiyora/shared";
import { createWorkerByStaffAction, type FormActionState } from "@/lib/actions/workers.actions";
import { Input, Label, Select, FieldError } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";

const initialState: FormActionState = undefined;

export function CreateChefForm() {
  const [state, formAction] = useActionState(createWorkerByStaffAction, initialState);

  return (
    <form action={formAction} className="grid grid-cols-1 gap-4 sm:grid-cols-4">
      <input type="hidden" name="position" value="CHEF" />
      <div>
        <Label htmlFor="chef-fullName">Ism va familiya</Label>
        <Input id="chef-fullName" name="fullName" required />
      </div>
      <div>
        <Label htmlFor="chef-phone">Telefon raqami</Label>
        <Input id="chef-phone" name="phone" placeholder="+998901234567" required />
      </div>
      <div>
        <Label htmlFor="chef-pin">PIN kod (4 raqam)</Label>
        <Input id="chef-pin" name="pin" inputMode="numeric" maxLength={4} placeholder="****" required />
      </div>
      <div>
        <Label htmlFor="chef-gender">Jinsi</Label>
        <Select id="chef-gender" name="gender" defaultValue="FEMALE">
          {WORKER_GENDERS.map((g) => (
            <option key={g} value={g}>
              {WORKER_GENDER_LABELS_UZ[g]}
            </option>
          ))}
        </Select>
      </div>
      <FieldError>{state?.error}</FieldError>
      <SubmitButton pendingText="Qo'shilmoqda..." variant="outline" className="sm:w-fit">
        Oshpaz qo&apos;shish
      </SubmitButton>
    </form>
  );
}
