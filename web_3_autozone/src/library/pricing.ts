/**
 * Money and discount helpers for catalog / checkout display.
 */

export type DiscountBucket = 20 | 40 | 70;

export const DISCOUNT_BUCKETS: readonly DiscountBucket[] = [20, 40, 70];

/** Parse a price string like "$89.99" to a finite number, else NaN. */
export function parseMoneyValue(price: string | undefined | null): number {
  if (price == null || typeof price !== "string") {
    return Number.NaN;
  }
  const parsed = Number.parseFloat(price.replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

/**
 * Effective discount percent from list (original) vs sale (current) price.
 * Returns 0 when original is missing, invalid, or not greater than current.
 */
export function getDiscountPercent(
  originalPrice: string | undefined,
  currentPrice: string | undefined
): number {
  const original = parseMoneyValue(originalPrice);
  const current = parseMoneyValue(currentPrice);
  if (
    !Number.isFinite(original) ||
    !Number.isFinite(current) ||
    original <= 0 ||
    current >= original
  ) {
    return 0;
  }
  const pct = ((original - current) / original) * 100;
  return Math.round(pct * 100) / 100;
}

/** True when an original (list) price is present and strictly above current. */
export function hasMeaningfulOriginalPrice(
  originalPrice: string | undefined,
  currentPrice: string | undefined
): boolean {
  return getDiscountPercent(originalPrice, currentPrice) > 0;
}

/** Minimum-tier filter: product discount is at least `bucket` percent. */
export function matchesDiscountBucket(
  discountPercent: number,
  bucket: DiscountBucket
): boolean {
  if (!Number.isFinite(discountPercent) || discountPercent <= 0) {
    return false;
  }
  return discountPercent >= bucket;
}
