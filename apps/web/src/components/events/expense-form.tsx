"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { EVENT_EXPENSE_CATEGORIES, type EventExpenseCategory } from "@shodiyora/shared";
import { addExpenseAction, type FormActionState } from "@/lib/actions/events.actions";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input, Label, Select } from "@/components/ui/input";
import { AmountInput } from "@/components/ui/amount-input";
import { useT } from "@/components/i18n/locale-provider";

const initialState: FormActionState = undefined;

/**
 * One "+ Xarajat qo'shish" button that opens a modal instead of ten
 * always-visible rows — on a phone, adding one expense used to grow the
 * list above the form and push it (and whichever row you were in) further
 * down the screen every time, so you lost your place. A modal has nothing
 * to scroll past in the first place.
 */
export function ExpenseForm({
  eventId,
  suggestedAmounts,
}: {
  eventId: string;
  suggestedAmounts?: Partial<Record<EventExpenseCategory, number>>;
}) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<EventExpenseCategory>(EVENT_EXPENSE_CATEGORIES[0]);
  const action = addExpenseAction.bind(null, eventId);
  const [state, formAction, isPending] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !isPending && !state?.error) {
      formRef.current?.reset();
      setCategory(EVENT_EXPENSE_CATEGORIES[0]);
      setOpen(false);
    }
    wasPending.current = isPending;
  }, [isPending, state]);

  const suggestedAmount = suggestedAmounts?.[category];
  const suggestedNote = suggestedAmount
    ? t(category === "STOCK" ? "events.fromStock" : "events.fromShoppingLists")
    : undefined;

  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> {t("events.addExpense")}
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={t("events.addExpense")}
        size="sm"
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={isPending}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" form="expense-form" disabled={isPending}>
              {isPending ? t("events.addingPending") : t("common.add")}
            </Button>
          </>
        }
      >
        <form id="expense-form" ref={formRef} action={formAction} className="space-y-3">
          <div>
            <Label htmlFor="expense-category">{t("events.category")}</Label>
            <Select
              id="expense-category"
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as EventExpenseCategory)}
            >
              {EVENT_EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {t(`expenseCategories.${c}`)}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="expense-amount">{t("events.amountPlaceholder")}</Label>
            <AmountInput
              id="expense-amount"
              name="amount"
              key={`amount-${category}`}
              defaultValue={suggestedAmount}
              required
            />
          </div>
          <div>
            <Label htmlFor="expense-note">{t("events.notesOptional")}</Label>
            <Input id="expense-note" name="note" key={`note-${category}`} defaultValue={suggestedNote} />
          </div>
          {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
        </form>
      </Modal>
    </>
  );
}
