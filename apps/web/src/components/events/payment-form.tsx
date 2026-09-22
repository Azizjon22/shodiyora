"use client";

import { useActionState } from "react";
import { PAYMENT_METHODS } from "@shodiyora/shared";
import { addPaymentAction, type FormActionState } from "@/lib/actions/events.actions";
import { Input, Select, Label, FieldError } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";

const METHOD_LABEL: Record<string, string> = { CASH: "Naqd", CARD: "Karta", TRANSFER: "O'tkazma" };
const initialState: FormActionState = undefined;

export function PaymentForm({ eventId }: { eventId: string }) {
  const action = addPaymentAction.bind(null, eventId);
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1">
        <Label htmlFor="amount">Summa (so&apos;m)</Label>
        <Input id="amount" name="amount" type="number" min={1} required />
      </div>
      <div>
        <Label htmlFor="method">Usul</Label>
        <Select id="method" name="method" className="sm:w-36">
          {PAYMENT_METHODS.map((m) => (
            <option key={m} value={m}>
              {METHOD_LABEL[m]}
            </option>
          ))}
        </Select>
      </div>
      <div className="flex-1">
        <Label htmlFor="note">Izoh</Label>
        <Input id="note" name="note" />
      </div>
      <SubmitButton pendingText="Saqlanmoqda...">To&apos;lov qo&apos;shish</SubmitButton>
      <FieldError>{state?.error}</FieldError>
    </form>
  );
}
