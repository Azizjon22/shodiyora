"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";
import { extractErrorMessage } from "@/lib/errors";

export type FormActionState = { error?: string } | undefined;

export async function markItemPurchasedAction(
  listId: string,
  itemId: string,
  _prev: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const unitPrice = Number(formData.get("unitPrice"));
  if (!unitPrice || unitPrice < 0) {
    return { error: "Narxni to'g'ri kiriting" };
  }
  try {
    await apiFetch(`/shopping-lists/${listId}/items/${itemId}/purchase`, {
      method: "PATCH",
      body: JSON.stringify({ unitPrice }),
    });
  } catch (err) {
    return { error: extractErrorMessage(err, "Amalni bajarib bo'lmadi") };
  }
  revalidatePath("/dashboard/shopping-lists");
  return undefined;
}

export async function updateShoppingListStatusAction(listId: string, status: string) {
  await apiFetch(`/shopping-lists/${listId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  revalidatePath("/dashboard/shopping-lists");
}
