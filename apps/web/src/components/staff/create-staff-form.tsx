"use client";

import { useActionState } from "react";
import { STAFF_ROLES, STAFF_ROLE_LABELS_UZ } from "@shodiyora/shared";
import { createStaffAction, type FormActionState } from "@/lib/actions/staff.actions";
import { Input, Label, Select, FieldError } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";

const initialState: FormActionState = undefined;

export function CreateStaffForm() {
  const [state, formAction] = useActionState(createStaffAction, initialState);

  return (
    <form action={formAction} className="grid grid-cols-1 gap-4 sm:grid-cols-4">
      <div>
        <Label htmlFor="fullName">Ism-familiya</Label>
        <Input id="fullName" name="fullName" required />
      </div>
      <div>
        <Label htmlFor="phone">Telefon</Label>
        <Input id="phone" name="phone" placeholder="+998901234567" required />
      </div>
      <div>
        <Label htmlFor="password">Parol</Label>
        <Input id="password" name="password" type="password" required minLength={6} />
      </div>
      <div>
        <Label htmlFor="role">Rol</Label>
        <Select id="role" name="role">
          {STAFF_ROLES.filter((r) => r !== "SUPER_ADMIN").map((r) => (
            <option key={r} value={r}>
              {STAFF_ROLE_LABELS_UZ[r]}
            </option>
          ))}
        </Select>
      </div>
      <FieldError>{state?.error}</FieldError>
      <SubmitButton pendingText="Yaratilmoqda..." variant="outline" className="sm:w-fit">
        Hisob yaratish
      </SubmitButton>
    </form>
  );
}
