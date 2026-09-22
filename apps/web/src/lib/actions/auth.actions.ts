"use server";

import { redirect } from "next/navigation";
import { staffLoginSchema, workerLoginSchema } from "@shodiyora/shared";
import { clearSession, setSession } from "@/lib/session";
import { publicApiUrl } from "@/lib/api";

export type AuthActionState = { error?: string } | undefined;

export async function loginStaffAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = staffLoginSchema.safeParse({
    phone: formData.get("phone"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ma'lumotlar noto'g'ri" };
  }

  const res = await fetch(publicApiUrl("/auth/staff/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    return { error: body?.message ?? "Login yoki parol noto'g'ri" };
  }

  const data = await res.json();
  await setSession({ accessToken: data.accessToken, refreshToken: data.refreshToken, user: data.user });
  redirect("/dashboard");
}

export async function loginWorkerAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = workerLoginSchema.safeParse({
    phone: formData.get("phone"),
    pin: formData.get("pin"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ma'lumotlar noto'g'ri" };
  }

  const res = await fetch(publicApiUrl("/auth/worker/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    return { error: body?.message ?? "Login yoki PIN noto'g'ri" };
  }

  const data = await res.json();
  await setSession({ accessToken: data.accessToken, refreshToken: data.refreshToken, user: data.user });
  redirect("/worker");
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}
