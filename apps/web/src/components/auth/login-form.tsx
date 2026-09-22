"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { loginStaffAction, loginWorkerAction, type AuthActionState } from "@/lib/actions/auth.actions";
import { Input, Label, FieldError } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { cn } from "@/lib/utils";

const initialState: AuthActionState = undefined;

export function LoginForm() {
  const [mode, setMode] = useState<"staff" | "worker">("staff");
  const [staffState, staffFormAction] = useActionState(loginStaffAction, initialState);
  const [workerState, workerFormAction] = useActionState(loginWorkerAction, initialState);

  return (
    <div className="w-full max-w-sm">
      <div className="mb-6 grid grid-cols-2 rounded-lg border border-border bg-muted p-1 text-sm font-medium">
        <button
          type="button"
          onClick={() => setMode("staff")}
          className={cn(
            "rounded-md py-2 transition-colors",
            mode === "staff" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground",
          )}
        >
          Xodim (admin)
        </button>
        <button
          type="button"
          onClick={() => setMode("worker")}
          className={cn(
            "rounded-md py-2 transition-colors",
            mode === "worker" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground",
          )}
        >
          Oshpaz
        </button>
      </div>

      {mode === "staff" ? (
        <form action={staffFormAction} className="space-y-4">
          <div>
            <Label htmlFor="phone">Telefon raqami</Label>
            <Input id="phone" name="phone" placeholder="+998901234567" required autoComplete="tel" />
          </div>
          <div>
            <Label htmlFor="password">Parol</Label>
            <Input id="password" name="password" type="password" required autoComplete="current-password" />
          </div>
          <FieldError>{staffState?.error}</FieldError>
          <SubmitButton className="w-full" pendingText="Kirilmoqda...">
            Kirish
          </SubmitButton>
        </form>
      ) : (
        <form action={workerFormAction} className="space-y-4">
          <div>
            <Label htmlFor="worker-phone">Telefon raqami</Label>
            <Input id="worker-phone" name="phone" placeholder="+998901234567" required autoComplete="tel" />
          </div>
          <div>
            <Label htmlFor="pin">PIN kod</Label>
            <Input id="pin" name="pin" inputMode="numeric" maxLength={4} placeholder="****" required />
          </div>
          <FieldError>{workerState?.error}</FieldError>
          <SubmitButton className="w-full" pendingText="Kirilmoqda...">
            Kirish
          </SubmitButton>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Ishga endi kirdingizmi?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Ro&apos;yxatdan o&apos;ting
        </Link>
      </p>
    </div>
  );
}
