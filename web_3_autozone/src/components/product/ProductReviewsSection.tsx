"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BlurCard } from "@/components/ui/BlurCard";
import type { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";
import {
  addReview,
  deleteReview,
  getReviewAuthorId,
  isReviewOwner,
  listReviewsForProduct,
  onProductReviewsChange,
  updateReview,
  type ProductReview,
} from "@/library/product-reviews";
import { logEvent, EVENT_TYPES } from "@/events";

type Dyn = ReturnType<typeof useDynamicSystem>;

type ProductReviewsSectionProps = {
  product: Product;
  dyn: Dyn;
  productEventPayload: Record<string, unknown>;
};

export function ProductReviewsSection({
  product,
  dyn,
  productEventPayload,
}: ProductReviewsSectionProps) {
  const t = (key: string, fallback: string) =>
    dyn.v3.getVariant(key, TEXT_VARIANTS_MAP, fallback);

  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [authorId, setAuthorId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [rating, setRating] = useState(5);
  const [formError, setFormError] = useState<string | null>(null);
  /** Errors from edit/delete only — kept separate so they do not appear on the compose form. */
  const [listActionError, setListActionError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState("");
  const [editRating, setEditRating] = useState(5);

  useEffect(() => {
    const sync = () => {
      setReviews(listReviewsForProduct(product.id));
      setAuthorId(getReviewAuthorId());
    };
    sync();
    return onProductReviewsChange(sync);
  }, [product.id]);

  const startEdit = (r: ProductReview) => {
    setListActionError(null);
    setEditingId(r.id);
    setEditBody(r.body);
    setEditRating(r.rating);
  };

  const cancelEdit = () => {
    setListActionError(null);
    setEditingId(null);
    setEditBody("");
    setEditRating(5);
  };

  const submitNew = () => {
    setFormError(null);
    setListActionError(null);
    const res = addReview({
      product,
      authorName: name,
      body,
      rating,
    });
    if (!res.ok) {
      setFormError(res.error);
      return;
    }
    logEvent(EVENT_TYPES.REVIEW_CREATED, {
      ...productEventPayload,
      reviewId: res.review.id,
      rating: res.review.rating,
    });
    setName("");
    setBody("");
    setRating(5);
    setReviews(listReviewsForProduct(product.id));
  };

  const submitEdit = (reviewId: string) => {
    setListActionError(null);
    const res = updateReview({
      productId: product.id,
      reviewId,
      body: editBody,
      rating: editRating,
    });
    if (!res.ok) {
      setListActionError(res.error);
      return;
    }
    logEvent(EVENT_TYPES.REVIEW_UPDATED, {
      ...productEventPayload,
      reviewId: res.review.id,
      rating: res.review.rating,
    });
    cancelEdit();
    setReviews(listReviewsForProduct(product.id));
  };

  const remove = (reviewId: string) => {
    setListActionError(null);
    const res = deleteReview(product.id, reviewId);
    if (!res.ok) {
      setListActionError(res.error);
      return;
    }
    logEvent(EVENT_TYPES.REVIEW_DELETED, {
      ...productEventPayload,
      reviewId,
    });
    cancelEdit();
    setReviews(listReviewsForProduct(product.id));
  };

  return (
    <section
      className="mt-16 space-y-6"
      id={dyn.v3.getVariant("product-reviews-section", ID_VARIANTS_MAP, "product-reviews-section")}
    >
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
          {t("reviews_eyebrow", "Community")}
        </p>
        <h2 className="text-2xl font-semibold text-slate-900">
          {t("reviews_title", "Customer reviews")}
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          {t(
            "reviews_subtitle",
            "Share your experience. You can edit or remove only the review you wrote while signed in."
          )}
        </p>
      </div>

      <BlurCard
        className="space-y-4 p-6"
        id={dyn.v3.getVariant("product-reviews-form-card", ID_VARIANTS_MAP)}
      >
        <h3 className="text-base font-semibold text-slate-900">
          {t("write_review", "Write a review")}
        </h3>
        {!authorId && (
          <p className="text-sm text-amber-800">
            {t(
              "reviews_signin_hint",
              "Open the store with ?user=your-id in the URL to post and manage your review."
            )}
          </p>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <label
              htmlFor={dyn.v3.getVariant("review-author-name", ID_VARIANTS_MAP, "review-author-name")}
              className="text-xs font-semibold text-slate-500"
            >
              {t("your_name", "Your name")}
            </label>
            <Input
              id={dyn.v3.getVariant("review-author-name", ID_VARIANTS_MAP, "review-author-name")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!authorId}
              placeholder={t("your_name_ph", "Displayed with your review")}
            />
          </div>
          <div className="space-y-1">
            <label
              htmlFor={dyn.v3.getVariant("review-rating", ID_VARIANTS_MAP, "review-rating")}
              className="text-xs font-semibold text-slate-500"
            >
              {t("rating", "Rating (1–5)")}
            </label>
            <select
              id={dyn.v3.getVariant("review-rating", ID_VARIANTS_MAP, "review-rating")}
              className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm"
              value={rating}
              disabled={!authorId}
              onChange={(e) => setRating(Number.parseInt(e.target.value, 10))}
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="space-y-1">
          <label
            htmlFor={dyn.v3.getVariant("review-body", ID_VARIANTS_MAP, "review-body")}
            className="text-xs font-semibold text-slate-500"
          >
            {t("review_text", "Review")}
          </label>
          <textarea
            id={dyn.v3.getVariant("review-body", ID_VARIANTS_MAP, "review-body")}
            className="flex min-h-[100px] w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400"
            value={body}
            disabled={!authorId}
            onChange={(e) => setBody(e.target.value)}
            placeholder={t("review_text_ph", "What did you like? Would you buy again?")}
          />
        </div>
        {formError && <p className="text-sm font-medium text-red-600">{formError}</p>}
        <Button
          type="button"
          id={dyn.v3.getVariant("submit-review-btn", ID_VARIANTS_MAP, "submit-review")}
          className="rounded-full bg-slate-900 text-white hover:bg-slate-800"
          disabled={!authorId}
          onClick={submitNew}
        >
          {t("submit_review", "Submit review")}
        </Button>
      </BlurCard>

      {listActionError && !editingId && (
        <p className="text-sm font-medium text-red-600" role="alert">
          {listActionError}
        </p>
      )}

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-slate-900">
          {t("reviews_list_title", "All reviews")} ({reviews.length})
        </h3>
        {reviews.length === 0 && (
          <p className="text-sm text-slate-600">{t("no_reviews_yet", "No written reviews yet.")}</p>
        )}
        {reviews.map((r) => (
          <BlurCard
            key={r.id}
            className="space-y-3 p-5"
            id={dyn.v3.getVariant("product-review-item", ID_VARIANTS_MAP, `review-${r.id}`)}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-slate-900">{r.authorName}</p>
                <p className="text-xs text-slate-500">
                  {t("rating_label", "Rating")}: {r.rating}/5 ·{" "}
                  {new Date(r.updatedAt).toLocaleString()}
                </p>
              </div>
              {isReviewOwner(r, authorId) && editingId !== r.id && (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    id={dyn.v3.getVariant("review-edit-btn", ID_VARIANTS_MAP, `edit-${r.id}`)}
                    onClick={() => startEdit(r)}
                  >
                    {t("edit", "Edit")}
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    id={dyn.v3.getVariant("review-delete-btn", ID_VARIANTS_MAP, `delete-${r.id}`)}
                    onClick={() => remove(r.id)}
                  >
                    {t("delete", "Delete")}
                  </Button>
                </div>
              )}
            </div>
            {editingId === r.id ? (
              <div className="space-y-3">
                {listActionError && (
                  <p className="text-sm font-medium text-red-600" role="alert">
                    {listActionError}
                  </p>
                )}
                <select
                  className="flex h-9 w-full max-w-xs rounded-md border border-slate-200 px-3 text-sm"
                  value={editRating}
                  onChange={(e) => setEditRating(Number.parseInt(e.target.value, 10))}
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button type="button" size="sm" onClick={() => submitEdit(r.id)}>
                    {t("save", "Save")}
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={cancelEdit}>
                    {t("cancel", "Cancel")}
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm leading-relaxed text-slate-700">{r.body}</p>
            )}
          </BlurCard>
        ))}
      </div>
    </section>
  );
}
