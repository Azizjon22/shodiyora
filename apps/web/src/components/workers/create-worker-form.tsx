"use client";

import { useActionState, useState } from "react";
import { WORKER_GENDERS, WORKER_GENDER_LABELS_UZ, WORKER_POSITIONS, WORKER_POSITION_LABELS_UZ } from "@shodiyora/shared";
import { createWorkerByStaffAction, type FormActionState } from "@/lib/actions/workers.actions";
import { Input, Label, Select, FieldError } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { UploadField } from "@/components/uploads/upload-field";

const initialState: FormActionState = undefined;

export function CreateWorkerForm() {
  const [state, formAction] = useActionState(createWorkerByStaffAction, initialState);
  const [position, setPosition] = useState<(typeof WORKER_POSITIONS)[number]>("WAITER_MALE");
  const needsPin = position === "CHEF";

  return (
    <form action={formAction} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <Label htmlFor="fullName">Ism va familiya</Label>
        <Input id="fullName" name="fullName" required />
      </div>
      <div>
        <Label htmlFor="phone">Telefon raqami</Label>
        <Input id="phone" name="phone" placeholder="+998901234567" required />
      </div>
      <div>
        <Label htmlFor="position">Lavozim</Label>
        <Select
          id="position"
          name="position"
          value={position}
          onChange={(e) => setPosition(e.target.value as typeof position)}
        >
          {WORKER_POSITIONS.map((p) => (
            <option key={p} value={p}>
              {WORKER_POSITION_LABELS_UZ[p]}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="gender">Jinsi</Label>
        <Select id="gender" name="gender" defaultValue="MALE" required>
          {WORKER_GENDERS.map((g) => (
            <option key={g} value={g}>
              {WORKER_GENDER_LABELS_UZ[g]}
            </option>
          ))}
        </Select>
      </div>
      {needsPin && (
        <div>
          <Label htmlFor="pin">PIN kod (4 raqam)</Label>
          <Input id="pin" name="pin" inputMode="numeric" maxLength={4} placeholder="****" required />
        </div>
      )}
      <div className="sm:col-span-2">
        <UploadField name="photoUrl" label="Rasm (ixtiyoriy)" folder="workers" aspect="square" />
      </div>
      <FieldError>{state?.error}</FieldError>
      <SubmitButton pendingText="Qo'shilmoqda..." variant="outline" className="sm:w-fit">
        Ishchi qo&apos;shish
      </SubmitButton>
    </form>
  );
}
