"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createMenuSchema,
  createMenuDishSchema,
  createMenuMediaSchema,
} from "@shodiyora/shared";
import { apiFetch } from "@/lib/api";
import { extractErrorMessage } from "@/lib/errors";

export type FormActionState = { error?: string } | undefined;

export async function createMenuAction(
  _prev: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const parsed = createMenuSchema.safeParse({
    name: formData.get("name"),
    pricePerPerson: formData.get("pricePerPerson"),
    description: formData.get("description") || undefined,
    isVip: formData.get("isVip") === "on",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ma'lumotlar noto'g'ri" };
  }

  try {
    await apiFetch("/menus", { method: "POST", body: JSON.stringify(parsed.data) });
  } catch (err) {
    return { error: extractErrorMessage(err, "Menyu yaratib bo'lmadi") };
  }
  revalidatePath("/dashboard/menus");
  return undefined;
}

export async function deleteMenuAction(menuId: string) {
  await apiFetch(`/menus/${menuId}`, { method: "DELETE" });
  revalidatePath("/dashboard/menus");
  redirect("/dashboard/menus");
}

export async function addDishAction(
  menuId: string,
  _prev: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const parsed = createMenuDishSchema.safeParse({
    category: formData.get("category"),
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    photoUrl: formData.get("photoUrl") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ma'lumotlar noto'g'ri" };
  }

  try {
    await apiFetch(`/menus/${menuId}/dishes`, { method: "POST", body: JSON.stringify(parsed.data) });
  } catch (err) {
    return { error: extractErrorMessage(err, "Taomni qo'shib bo'lmadi") };
  }
  revalidatePath(`/dashboard/menus/${menuId}`);
  return undefined;
}

export async function removeDishAction(menuId: string, dishId: string) {
  await apiFetch(`/menus/${menuId}/dishes/${dishId}`, { method: "DELETE" });
  revalidatePath(`/dashboard/menus/${menuId}`);
}

export async function addMediaAction(
  menuId: string,
  _prev: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const parsed = createMenuMediaSchema.safeParse({
    section: formData.get("section"),
    mediaType: formData.get("mediaType"),
    url: formData.get("url"),
    caption: formData.get("caption") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ma'lumotlar noto'g'ri" };
  }

  try {
    await apiFetch(`/menus/${menuId}/media`, { method: "POST", body: JSON.stringify(parsed.data) });
  } catch (err) {
    return { error: extractErrorMessage(err, "Faylni qo'shib bo'lmadi") };
  }
  revalidatePath(`/dashboard/menus/${menuId}`);
  return undefined;
}

export async function removeMediaAction(menuId: string, mediaId: string) {
  await apiFetch(`/menus/${menuId}/media/${mediaId}`, { method: "DELETE" });
  revalidatePath(`/dashboard/menus/${menuId}`);
}
