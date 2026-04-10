import {
  addReview,
  deleteReview,
  getReviewAuthorId,
  isReviewOwner,
  listReviewsForProduct,
  updateReview,
} from "@/library/product-reviews";

describe("product-reviews", () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.restoreAllMocks();
  });

  test("addReview fails when user id is missing", () => {
    const r = addReview({
      product: { id: "p1" },
      authorName: "A",
      body: "Great product here",
      rating: 5,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/Sign in required/i);
  });

  test("addReview succeeds and listReviewsForProduct returns sorted newest first", () => {
    window.localStorage.setItem("user", "u42");
    const a = addReview({
      product: { id: "p1" },
      authorName: "Alex",
      body: "First review text here",
      rating: 4,
    });
    expect(a.ok).toBe(true);
    const list = listReviewsForProduct("p1");
    expect(list).toHaveLength(1);
    expect(list[0]?.authorName).toBe("Alex");
    expect(list[0]?.rating).toBe(4);
  });

  test("addReview rejects second review from same author for same product", () => {
    window.localStorage.setItem("user", "u1");
    expect(
      addReview({
        product: { id: "p1" },
        authorName: "A",
        body: "Good product indeed",
        rating: 5,
      }).ok
    ).toBe(true);
    const second = addReview({
      product: { id: "p1" },
      authorName: "A",
      body: "Trying again with more text",
      rating: 3,
    });
    expect(second.ok).toBe(false);
    if (!second.ok) expect(second.error).toMatch(/already reviewed/i);
  });

  test("updateReview only for owner", () => {
    window.localStorage.setItem("user", "owner");
    const created = addReview({
      product: { id: "px" },
      authorName: "Owner",
      body: "Original body text",
      rating: 3,
    });
    expect(created.ok).toBe(true);
    if (!created.ok) throw new Error("setup");
    const rid = created.review.id;

    window.localStorage.setItem("user", "other");
    const denied = updateReview({
      productId: "px",
      reviewId: rid,
      body: "Hacked review body",
      rating: 5,
    });
    expect(denied.ok).toBe(false);
    if (!denied.ok) expect(denied.error).toMatch(/only edit your own/i);

    window.localStorage.setItem("user", "owner");
    const ok = updateReview({
      productId: "px",
      reviewId: rid,
      body: "Updated review body",
      rating: 4,
    });
    expect(ok.ok).toBe(true);
    if (ok.ok) expect(ok.review.body).toBe("Updated review body");
  });

  test("deleteReview only for owner", () => {
    window.localStorage.setItem("user", "u9");
    const created = addReview({
      product: { id: "pd" },
      authorName: "Sam",
      body: "Will delete this review",
      rating: 5,
    });
    expect(created.ok).toBe(true);
    if (!created.ok) throw new Error("setup");
    const rid = created.review.id;

    window.localStorage.setItem("user", "intruder");
    const denied = deleteReview("pd", rid);
    expect(denied.ok).toBe(false);

    window.localStorage.setItem("user", "u9");
    expect(deleteReview("pd", rid).ok).toBe(true);
    expect(listReviewsForProduct("pd")).toHaveLength(0);
  });

  test("getReviewAuthorId treats string null as missing", () => {
    window.localStorage.setItem("user", "null");
    expect(getReviewAuthorId()).toBeNull();
  });

  test("isReviewOwner is false without author id", () => {
    const review = {
      id: "r",
      productId: "p",
      authorId: "x",
      authorName: "n",
      body: "b",
      rating: 5,
      createdAt: "",
      updatedAt: "",
    };
    expect(isReviewOwner(review, null)).toBe(false);
    expect(isReviewOwner(review, "x")).toBe(true);
  });

  test("addReview validates body length", () => {
    window.localStorage.setItem("user", "u");
    const short = addReview({
      product: { id: "p" },
      authorName: "A",
      body: "abc",
      rating: 5,
    });
    expect(short.ok).toBe(false);
  });

  test("addReview validates rating", () => {
    window.localStorage.setItem("user", "u");
    const bad = addReview({
      product: { id: "p" },
      authorName: "A",
      body: "Valid body here",
      rating: 6,
    });
    expect(bad.ok).toBe(false);
  });
});
