"use client";

import { useActionState } from "react";
import { markItemPurchasedAction, type FormActionState } from "@/lib/actions/shopping-lists.actions";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";

const initialState: FormActionState = undefined;

export function PurchaseItemForm({ listId, itemId }: { listId: string; itemId: string }) {
  const action = markItemPurchasedAction.bind(null, listId, itemId);
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex items-center gap-2">
      <Input name="unitPrice" type="number" min={0} placeholder="Narxi (1 dona)" className="h-8 w-32" required />
      <SubmitButton size="sm" variant="outline" pendingText="...">
        Sotib olindi
      </SubmitButton>
      {state?.error && <span className="text-xs text-destructive">{state.error}</span>}
    </form>
  );
}
