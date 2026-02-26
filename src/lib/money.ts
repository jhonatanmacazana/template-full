const PEN_LOCALE = "es-PE";
const PEN_CURRENCY = "PEN";

/**
 * Format a number as Peruvian Sol (PEN) using es-PE locale.
 */
export function formatMoney(amount: number): string {
  return new Intl.NumberFormat(PEN_LOCALE, {
    style: "currency",
    currency: PEN_CURRENCY,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Parse a string to a number for money input (handles locale and symbols).
 */
export function parseMoney(value: string): number {
  const normalized = value.replace(/\s/g, "").replace(/[^\d.,-]/g, "");
  const withDot = normalized.replace(",", ".");
  const n = Number.parseFloat(withDot);
  return Number.isNaN(n) ? 0 : n;
}
