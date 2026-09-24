"use server";

import { revalidatePath } from "next/cache";
import { workerRegisterSchema } from "@shodiyora/shared";
import { apiFetch } from "@/lib/api";
import { extractErrorMessage } from "@/lib/errors";

export type FormActionState = { error?: string; success?: boolean } | undefined;

export async function createWorkerByStaffAction(
  _prev: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const position = formData.get("position");
  const parsed = workerRegisterSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    position,
    photoUrl: formData.get("photoUrl") || undefined,
    pin: position === "CHEF" ? formData.get("pin") || undefined : undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ma'lumotlar noto'g'ri" };
  }

  try {
    await apiFetch("/workers", { method: "POST", body: JSON.stringify(parsed.data) });
  } catch (err) {
    return { error: extractErrorMessage(err, "Ishchini qo'shib bo'lmadi") };
  }
  revalidatePath("/dashboard/workers");
  return { success: true };
}

export async function approveWorkerAction(workerId: string) {
  await apiFetch(`/workers/${workerId}/approve`, { method: "PATCH" });
  revalidatePath("/dashboard/workers");
}

export async function rejectWorkerAction(workerId: string) {
  await apiFetch(`/workers/${workerId}/reject`, { method: "PATCH" });
  revalidatePath("/dashboard/workers");
}

export async function deleteWorkerAction(workerId: string) {
  await apiFetch(`/workers/${workerId}`, { method: "DELETE" });
  revalidatePath("/dashboard/workers");
}
