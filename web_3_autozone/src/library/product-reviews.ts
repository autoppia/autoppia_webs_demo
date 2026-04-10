import type { Product } from "@/context/CartContext";

const STORAGE_KEY = "autozone_product_reviews_v1";
const EVENT_NAME = "autozone:product-reviews-updated";

export type ProductReview = {
  id: string;
  productId: string;
  authorId: string;
  authorName: string;
  body: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
};

type ReviewStore = Record<string, ProductReview[]>;

const isBrowser = (): boolean => typeof window !== "undefined";

function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `rev-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function readStore(): ReviewStore {
  if (!isBrowser()) return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    return parsed as ReviewStore;
  } catch (error) {
    console.warn("[product-reviews] failed to parse store", error);
    return {};
  }
}

function writeStore(store: ReviewStore): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
  } catch (error) {
    console.warn("[product-reviews] failed to persist", error);
  }
}

const SESSION_USER_KEY = "autozone_auth_current_user_v1";

/** Resolved user id for ownership, or null when reviews cannot be attributed. */
export function getReviewAuthorId(): string | null {
  if (!isBrowser()) return null;
  const raw = window.localStorage.getItem("user");
  if (raw != null && raw !== "" && raw !== "null") {
    return raw;
  }
  try {
    const sessionRaw = window.localStorage.getItem(SESSION_USER_KEY);
    if (!sessionRaw) return null;
    const parsed = JSON.parse(sessionRaw) as { id?: unknown };
    if (typeof parsed?.id === "string" && parsed.id.length > 0) {
      return parsed.id;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function listReviewsForProduct(productId: string): ProductReview[] {
  if (!productId) return [];
  const list = readStore()[productId];
  return Array.isArray(list) ? [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt)) : [];
}

function validateBody(body: string): string | null {
  const t = body.trim();
  if (t.length < 4) return "Review must be at least 4 characters.";
  if (t.length > 4000) return "Review must be at most 4000 characters.";
  return null;
}

function validateRating(rating: number): string | null {
  if (!Number.isFinite(rating) || rating < 1 || rating > 5 || Math.round(rating) !== rating) {
    return "Rating must be a whole number from 1 to 5.";
  }
  return null;
}

export type ReviewMutationResult =
  | { ok: true; review: ProductReview }
  | { ok: false; error: string };

/**
 * One review per author per product. Author id must be set (URL ?user= or localStorage).
 */
export function addReview(input: {
  product: Pick<Product, "id">;
  authorName: string;
  body: string;
  rating: number;
}): ReviewMutationResult {
  const authorId = getReviewAuthorId();
  if (!authorId) {
    return { ok: false, error: "Sign in required: login or register to post a review." };
  }
  const productId = input.product?.id;
  if (!productId) {
    return { ok: false, error: "Missing product." };
  }
  const nameErr = input.authorName.trim().length < 1 ? "Name is required." : null;
  if (nameErr) return { ok: false, error: nameErr };
  const bodyErr = validateBody(input.body);
  if (bodyErr) return { ok: false, error: bodyErr };
  const rateErr = validateRating(input.rating);
  if (rateErr) return { ok: false, error: rateErr };

  const store = readStore();
  const existing = store[productId] ?? [];
  if (existing.some((r) => r.authorId === authorId)) {
    return { ok: false, error: "You already reviewed this product. Edit or delete your existing review." };
  }

  const now = new Date().toISOString();
  const review: ProductReview = {
    id: generateId(),
    productId,
    authorId,
    authorName: input.authorName.trim(),
    body: input.body.trim(),
    rating: input.rating,
    createdAt: now,
    updatedAt: now,
  };
  store[productId] = [...existing, review];
  writeStore(store);
  return { ok: true, review };
}

export function updateReview(input: {
  productId: string;
  reviewId: string;
  body: string;
  rating: number;
}): ReviewMutationResult {
  const authorId = getReviewAuthorId();
  if (!authorId) {
    return { ok: false, error: "Sign in required: login to edit a review." };
  }
  const bodyErr = validateBody(input.body);
  if (bodyErr) return { ok: false, error: bodyErr };
  const rateErr = validateRating(input.rating);
  if (rateErr) return { ok: false, error: rateErr };

  const store = readStore();
  const list = store[input.productId];
  if (!Array.isArray(list)) {
    return { ok: false, error: "Review not found." };
  }
  const idx = list.findIndex((r) => r.id === input.reviewId);
  if (idx < 0) {
    return { ok: false, error: "Review not found." };
  }
  const target = list[idx];
  if (target.authorId !== authorId) {
    return { ok: false, error: "You can only edit your own review." };
  }
  const updated: ProductReview = {
    ...target,
    body: input.body.trim(),
    rating: input.rating,
    updatedAt: new Date().toISOString(),
  };
  const next = [...list];
  next[idx] = updated;
  store[input.productId] = next;
  writeStore(store);
  return { ok: true, review: updated };
}

export function deleteReview(productId: string, reviewId: string): ReviewMutationResult {
  const authorId = getReviewAuthorId();
  if (!authorId) {
    return { ok: false, error: "Sign in required: login to delete a review." };
  }
  const store = readStore();
  const list = store[productId];
  if (!Array.isArray(list)) {
    return { ok: false, error: "Review not found." };
  }
  const target = list.find((r) => r.id === reviewId);
  if (!target) {
    return { ok: false, error: "Review not found." };
  }
  if (target.authorId !== authorId) {
    return { ok: false, error: "You can only delete your own review." };
  }
  store[productId] = list.filter((r) => r.id !== reviewId);
  writeStore(store);
  return { ok: true, review: target };
}

export function isReviewOwner(review: ProductReview, authorId: string | null): boolean {
  if (!authorId) return false;
  return review.authorId === authorId;
}

export function onProductReviewsChange(handler: () => void): () => void {
  if (!isBrowser()) return () => {};
  window.addEventListener(EVENT_NAME, handler);
  return () => window.removeEventListener(EVENT_NAME, handler);
}
