const LABELS: Record<string, string> = {
  KG: 'kg',
  LITER: 'litr',
  DONA: 'dona',
};

/**
 * Same rule as the web app's formatQuantity: kilograms under a kilo read as
 * grams ("200 g"), over it as "10 kg 500 g".
 */
export function formatQuantity(value: unknown, unit: string): string {
  const n = Number(value);
  const label = LABELS[unit] ?? unit;
  if (!Number.isFinite(n)) return `0 ${label}`;
  if (unit === 'KG') {
    const grams = Math.round(n * 1000);
    if (grams < 1000) return `${grams} g`;
    const kg = Math.floor(grams / 1000);
    const rest = grams % 1000;
    return rest === 0 ? `${kg} kg` : `${kg} kg ${rest} g`;
  }
  const text = Number.isInteger(n)
    ? String(n)
    : n.toFixed(3).replace(/\.?0+$/, '');
  return `${text} ${label}`;
}
