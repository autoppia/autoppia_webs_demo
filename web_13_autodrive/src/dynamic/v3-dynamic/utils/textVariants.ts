// src/library/textVariants.ts
type ElementKey =
  | "hero-title"
  | "hero-subtitle"
  | "get-trip-button"
  | "quick-booking-title"
  | "book-now-button"
  | "available-rides-title"
  | "map-view-label"
  | "nav-ride"
  | "nav-drive"
  | "nav-business"
  | "nav-help"
  | "footer-copy"
  | "trip-hero-title"
  | "trip-hero-subtitle"
  | "trip-get-trip-heading"
  | "pickup-placeholder"
  | "dropoff-placeholder"
  | "pickup-now-label"
  | "pickup-label"
  | "for-me-label"
  | "search-button"
  | "searching-label"
  | "choose-ride-title"
  | "recommended-label"
  | "select-ride-label"
  | "reserve-ride-label"
  | "trips-upcoming-title"
  | "trips-past-title"
  | "trips-filter-personal"
  | "trips-filter-all"
  | "trips-card-confirmed"
  | "trips-card-details"
  | "trips-loading"
  | "trips-aside-title"
  | "trips-aside-desc"
  | "trips-aside-cta"
  | "trips-help"
  | "trips-details"
  | "trips-rebook";

type TextVariantMap = Record<ElementKey, string>;
import jsonVariants from '../data/text-variants.json';

const VARIANTS: Record<number, TextVariantMap> = Object.fromEntries(
  Object.entries(jsonVariants as Record<string, TextVariantMap>).map(([k, v]) => [parseInt(k, 10), v])
);

function mapSeedToRange(seed: number): number {
  if (!seed || seed < 1 || seed > 300) return 1;
  return ((seed - 1) % 10) + 1;
}

export function getTextForElement(seed: number, key: ElementKey, fallback: string): string {
  const mapped = mapSeedToRange(seed);
  const variant = VARIANTS[mapped];
  return (variant && variant[key]) || fallback;
}

export type { ElementKey };

