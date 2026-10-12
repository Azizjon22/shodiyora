import type { Unit } from "./enums";

const LABELS: Record<Unit, string> = { KG: "kg", LITER: "litr", DONA: "dona" };

function trim(n: number) {
  return Number.isInteger(n) ? String(n) : n.toFixed(3).replace(/\.?0+$/, "");
}

/**
 * How a quantity is shown everywhere. Kilograms are stored as kg, but under
 * a kilo they read as grams and over it as "10 kg 500 g" — "0.2 kg zira" is
 * "200 g".
 */
export function formatQuantity(value: number | string, unit: Unit): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return `0 ${LABELS[unit]}`;
  if (unit === "KG") {
    const grams = Math.round(n * 1000);
    if (grams < 1000) return `${grams} g`;
    const kg = Math.floor(grams / 1000);
    const rest = grams % 1000;
    return rest === 0 ? `${kg} kg` : `${kg} kg ${rest} g`;
  }
  return `${trim(n)} ${LABELS[unit]}`;
}
