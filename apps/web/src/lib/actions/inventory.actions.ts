"use server";

import { revalidatePath } from "next/cache";
import { createInventoryItemSchema } from "@shodiyora/shared";
import { apiFetch } from "@/lib/api";
import { extractErrorMessage } from "@/lib/errors";

export type FormActionState = { error?: string } | undefined;

export async function createInventoryItemAction(
  _prev: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const parsed = createInventoryItemSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category") || undefined,
    productCategory: formData.get("productCategory") || undefined,
    photoUrl: formData.get("photoUrl") || undefined,
    unit: formData.get("unit"),
    quantity: formData.get("quantity") || undefined,
    minThreshold: formData.get("minThreshold") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ma'lumotlar noto'g'ri" };
  }

  try {
    await apiFetch("/inventory", { method: "POST", body: JSON.stringify(parsed.data) });
  } catch (err) {
    return { error: extractErrorMessage(err, "Mahsulotni qo'shib bo'lmadi") };
  }
  revalidatePath("/dashboard/inventory");
  return undefined;
}

export async function addInventoryTransactionAction(itemId: string, type: "IN" | "OUT", quantity: number) {
  await apiFetch(`/inventory/${itemId}/transactions`, {
    method: "POST",
    body: JSON.stringify({ type, quantity }),
  });
  revalidatePath("/dashboard/inventory");
}

export async function deleteInventoryItemAction(itemId: string) {
  await apiFetch(`/inventory/${itemId}`, { method: "DELETE" });
  revalidatePath("/dashboard/inventory");
}
