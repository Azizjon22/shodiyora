"use client";

import { useFormStatus } from "react-dom";
import { Button, ButtonProps } from "./button";

export function SubmitButton({ children, pendingText = "Saqlanmoqda...", ...props }: ButtonProps & { pendingText?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} {...props}>
      {pending ? pendingText : children}
    </Button>
  );
}
