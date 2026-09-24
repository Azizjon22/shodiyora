"use client";

import { useActionState } from "react";
import { changeStaffPasswordAction, logoutAction, type AuthActionState } from "@/lib/actions/auth.actions";
import { PasswordInput, Label, FieldError } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";

const initialState: AuthActionState = undefined;

export function ChangePasswordForm() {
  const [state, formAction] = useActionState(changeStaffPasswordAction, initialState);

  return (
    <div className="w-full max-w-sm">
      <form action={formAction} className="space-y-4">
        <div>
          <Label htmlFor="currentPassword">Joriy parol (admin bergan)</Label>
          <PasswordInput id="currentPassword" name="currentPassword" required autoComplete="current-password" />
        </div>
        <div>
          <Label htmlFor="newPassword">Yangi parol</Label>
          <PasswordInput id="newPassword" name="newPassword" required minLength={6} autoComplete="new-password" />
        </div>
        <div>
          <Label htmlFor="confirmPassword">Yangi parolni tasdiqlang</Label>
          <PasswordInput id="confirmPassword" name="confirmPassword" required minLength={6} autoComplete="new-password" />
        </div>
        <FieldError>{state?.error}</FieldError>
        <SubmitButton className="w-full" pendingText="Saqlanmoqda...">
          Parolni saqlash va davom etish
        </SubmitButton>
      </form>
      <form action={logoutAction} className="mt-4 text-center">
        <button type="submit" className="text-sm text-muted-foreground hover:underline">
          Chiqish
        </button>
      </form>
    </div>
  );
}
