// Unit tests for wishlist helpers (toggle/isInWishlist/getWishlistItems).
import {
  clearWishlist,
  getWishlistItems,
  isInWishlist,
  toggleWishlistItem,
  type WishlistItem,
  onWishlistChange,
} from "@/library/wishlist";

describe("wishlist (autozone)", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  const sampleItem: WishlistItem = {
    id: "prod-1",
    title: "Sample product",
    price: "100",
    image: "/media/sample.png",
    category: "Electronics",
    brand: "BrandX",
    rating: 4.5,
  };

  test("getWishlistItems returns [] when empty or invalid", () => {
    expect(getWishlistItems()).toEqual([]);

    window.localStorage.setItem("autozone_wishlist", "not-json");
    expect(getWishlistItems()).toEqual([]);
  });

  test("getWishlistItems returns stored items", () => {
    window.localStorage.setItem("autozone_wishlist", JSON.stringify([sampleItem]));
    expect(getWishlistItems()).toEqual([sampleItem]);
  });

  test("isInWishlist behaves correctly with/without id", () => {
    expect(isInWishlist()).toBe(false);
    expect(isInWishlist("unknown")).toBe(false);

    window.localStorage.setItem("autozone_wishlist", JSON.stringify([sampleItem]));
    expect(isInWishlist("prod-1")).toBe(true);
  });

  test("toggleWishlistItem adds and then removes item", () => {
    // Add
    const added = toggleWishlistItem(sampleItem);
    expect(added.added).toBe(true);
    expect(added.items).toHaveLength(1);
    expect(added.items[0]).toEqual(sampleItem);
    expect(JSON.parse(window.localStorage.getItem("autozone_wishlist") || "[]")).toHaveLength(1);

    // Remove
    const removed = toggleWishlistItem(sampleItem);
    expect(removed.added).toBe(false);
    expect(removed.items).toHaveLength(0);
    expect(JSON.parse(window.localStorage.getItem("autozone_wishlist") || "[]")).toHaveLength(0);
  });

  test("clearWishlist empties the stored list", () => {
    window.localStorage.setItem("autozone_wishlist", JSON.stringify([sampleItem]));
    clearWishlist();
    expect(getWishlistItems()).toEqual([]);
  });

  test("onWishlistChange subscribes and unsubscribes handler", () => {
    const handler = jest.fn();
    const off = onWishlistChange(handler);

    window.dispatchEvent(new CustomEvent("wishlist:updated"));
    expect(handler).toHaveBeenCalledTimes(1);

    off();
    window.dispatchEvent(new CustomEvent("wishlist:updated"));
    // Still 1 because we unsubscribed
    expect(handler).toHaveBeenCalledTimes(1);
  });
});
