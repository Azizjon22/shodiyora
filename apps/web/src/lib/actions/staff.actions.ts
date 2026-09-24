"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { STAFF_ROLES } from "@shodiyora/shared";
import { apiFetch } from "@/lib/api";
import { extractErrorMessage } from "@/lib/errors";

export type FormActionState = { error?: string } | undefined;

const createStaffSchema = z.object({
  fullName: z.string().trim().min(3),
  phone: z.string().regex(/^\+?[0-9]{9,15}$/),
  password: z.string().min(6),
  role: z.enum(STAFF_ROLES),
});

export async function createStaffAction(_prev: FormActionState, formData: FormData): Promise<FormActionState> {
  const parsed = createStaffSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ma'lumotlar noto'g'ri" };
  }

  try {
    await apiFetch("/staff-users", { method: "POST", body: JSON.stringify(parsed.data) });
  } catch (err) {
    return { error: extractErrorMessage(err, "Hisob yaratib bo'lmadi") };
  }
  revalidatePath("/dashboard/staff");
  return undefined;
}

export async function toggleStaffActiveAction(staffId: string, isActive: boolean) {
  await apiFetch(`/staff-users/${staffId}`, { method: "PATCH", body: JSON.stringify({ isActive }) });
  revalidatePath("/dashboard/staff");
}

export async function deleteStaffAction(staffId: string) {
  await apiFetch(`/staff-users/${staffId}`, { method: "DELETE" });
  revalidatePath("/dashboard/staff");
}

export async function resetStaffPasswordAction(
  staffId: string,
  newPassword: string,
): Promise<{ error?: string }> {
  if (newPassword.length < 6) {
    return { error: "Parol kamida 6 belgidan iborat bo'lishi kerak" };
  }
  try {
    await apiFetch(`/staff-users/${staffId}`, {
      method: "PATCH",
      body: JSON.stringify({ password: newPassword }),
    });
  } catch (err) {
    return { error: extractErrorMessage(err, "Parolni tiklab bo'lmadi") };
  }
  revalidatePath("/dashboard/staff");
  return {};
}
