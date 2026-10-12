"use client";

import { useId, useRef, useState, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

function groupThousands(digits: string) {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

/**
 * A money field that shows "1 000 000" as you type instead of a raw
 * "1000000" — same grouping as formatSom, so the number on screen matches
 * what the rest of the app shows. The visible input is display-only; a
 * hidden input carries the plain digit string under `name` for the form.
 */
export function AmountInput({
  id,
  name,
  defaultValue,
  required,
  className,
  ...props
}: {
  id?: string;
  name: string;
  defaultValue?: number | string;
  required?: boolean;
  className?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "name" | "defaultValue" | "value" | "onChange" | "type">) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const [digits, setDigits] = useState(() => digitsOnly(String(defaultValue ?? "")));
  const visibleRef = useRef<HTMLInputElement>(null);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const el = e.currentTarget;
    const digitsBeforeCursor = digitsOnly(el.value.slice(0, el.selectionStart ?? el.value.length)).length;
    const nextDigits = digitsOnly(el.value);
    setDigits(nextDigits);

    const nextFormatted = groupThousands(nextDigits);
    // Place the cursor after the same number of digits it followed before,
    // so typing/deleting in the middle doesn't jump to the end.
    requestAnimationFrame(() => {
      const input = visibleRef.current;
      if (!input) return;
      let seen = 0;
      let pos = nextFormatted.length;
      for (let i = 0; i < nextFormatted.length; i++) {
        if (/\d/.test(nextFormatted[i])) seen++;
        if (seen === digitsBeforeCursor) {
          pos = i + 1;
          break;
        }
      }
      input.setSelectionRange(pos, pos);
    });
  }

  return (
    <>
      <input
        ref={visibleRef}
        id={inputId}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={groupThousands(digits)}
        onChange={onChange}
        required={required}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-card px-3 text-sm text-card-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
          className,
        )}
        {...props}
      />
      <input type="hidden" name={name} value={digits} />
    </>
  );
}
