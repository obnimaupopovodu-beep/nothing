/**
 * Formats numbers for display on playlist cards, following the current
 * interface locale. Small numbers render exactly ("1,234"); large numbers
 * render compact ("12.4K", "1.2M").
 */
export function formatCompactNumber(value: number, locale: string = "en-US"): string {
  if (!Number.isFinite(value)) return "—";
  if (value < 1000) {
    return new Intl.NumberFormat(locale).format(value);
  }
  return new Intl.NumberFormat(locale, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatExactNumber(value: number, locale: string = "en-US"): string {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat(locale).format(value);
}
