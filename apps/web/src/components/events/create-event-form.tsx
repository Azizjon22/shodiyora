"use client";

import { useActionState } from "react";
import { createEventAction, type FormActionState } from "@/lib/actions/events.actions";
import { Input, Label, Select, Textarea, FieldError } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import type { Menu } from "@/lib/types";
import { formatSom } from "@/lib/utils";

const initialState: FormActionState = undefined;

export function CreateEventForm({ menus, defaultDate }: { menus: Menu[]; defaultDate?: string }) {
  const [state, formAction] = useActionState(createEventAction, initialState);
  const defaultDateTime = defaultDate ? `${defaultDate}T18:00` : undefined;

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="clientName">Mijoz ismi</Label>
          <Input id="clientName" name="clientName" required />
        </div>
        <div>
          <Label htmlFor="clientPhone">Mijoz telefoni</Label>
          <Input id="clientPhone" name="clientPhone" placeholder="+998901234567" required />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="eventDate">Sana va vaqt</Label>
          <Input id="eventDate" name="eventDate" type="datetime-local" defaultValue={defaultDateTime} required />
        </div>
        <div>
          <Label htmlFor="guestCount">Mehmonlar soni</Label>
          <Input id="guestCount" name="guestCount" type="number" min={1} required />
        </div>
        <div>
          <Label htmlFor="tableCapacity">Stol turi</Label>
          <Select id="tableCapacity" name="tableCapacity" required>
            <option value="10">10 kishilik</option>
            <option value="12">12 kishilik</option>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="menuId">Menyu</Label>
        <Select id="menuId" name="menuId" required>
          <option value="">Tanlang</option>
          {menus.map((menu) => (
            <option key={menu.id} value={menu.id}>
              {menu.name} — {formatSom(menu.pricePerPerson)} / kishi
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label htmlFor="notes">Izoh (ixtiyoriy)</Label>
        <Textarea id="notes" name="notes" rows={3} />
      </div>

      <FieldError>{state?.error}</FieldError>
      <SubmitButton pendingText="Yaratilmoqda...">To&apos;yni yaratish</SubmitButton>
    </form>
  );
}
