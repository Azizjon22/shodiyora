import type { ProductCategory, Unit } from "@shodiyora/shared";

/**
 * A kg product is written either in whole kilograms (15, 16 — never 15.5)
 * or in grams (100, 200) for the small things like spices. It is always
 * stored as kg; grams are just how the chef types it.
 */
export type KgMode = "kg" | "g";

export const GRAM_STEP = 0.05; // +/− by 50 g

/** Spices are bought by the gram; everything else by the kilo. */
export function defaultKgMode(category?: ProductCategory | null): KgMode {
  return category === "SPICE" ? "g" : "kg";
}

/** What the input box shows for a stored kg amount. */
export function toInput(kg: number, unit: Unit, mode: KgMode) {
  if (unit !== "KG") return Number.isInteger(kg) ? String(kg) : String(+kg.toFixed(3));
  return mode === "g" ? String(Math.round(kg * 1000)) : String(Math.round(kg));
}

/** Turns what was typed into the stored amount: grams → kg, kilos → whole kg. */
export function fromInput(text: string, unit: Unit, mode: KgMode) {
  const n = Number(text.replace(",", ".").replace(/\s/g, ""));
  if (!Number.isFinite(n) || n <= 0) return 0;
  if (unit === "DONA") return Math.round(n);
  if (unit !== "KG") return +n.toFixed(3);
  return mode === "g" ? Math.round(n) / 1000 : Math.round(n);
}

/** One press of +/−. */
export function stepSize(unit: Unit, mode: KgMode, current: number, dir: 1 | -1) {
  if (unit === "DONA") return 1;
  if (unit === "KG") return mode === "g" ? GRAM_STEP : 1;
  return current < 1 && dir === -1 ? 0.5 : 1;
}

/** A gram amount that does not fit "whole kilos" cannot stay when switching to kg. */
export function fitsMode(kg: number, mode: KgMode) {
  return mode === "g" || Number.isInteger(+kg.toFixed(3));
}
