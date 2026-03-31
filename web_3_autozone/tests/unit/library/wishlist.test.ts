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
  const sessionKey = "autozone_auth_current_user_v1";
  const guestKey = "autozone_wishlist_guest";

  const setSessionUser = (id: string) => {
    window.localStorage.setItem(
      sessionKey,
      JSON.stringify({
        id,
        username: `user-${id}`,
        createdAt: "2026-01-01T00:00:00.000Z",
      })
    );
  };

  test("getWishlistItems returns [] when empty or invalid", () => {
    expect(getWishlistItems()).toEqual([]);

    window.localStorage.setItem(guestKey, "not-json");
    expect(getWishlistItems()).toEqual([]);
  });

  test("getWishlistItems returns stored guest items", () => {
    window.localStorage.setItem(guestKey, JSON.stringify([sampleItem]));
    expect(getWishlistItems()).toEqual([sampleItem]);
  });

  test("getWishlistItems migrates legacy key into guest key", () => {
    window.localStorage.setItem("autozone_wishlist", JSON.stringify([sampleItem]));
    expect(getWishlistItems()).toEqual([sampleItem]);
    expect(JSON.parse(window.localStorage.getItem(guestKey) || "[]")).toEqual([sampleItem]);
  });

  test("isInWishlist behaves correctly with/without id", () => {
    expect(isInWishlist()).toBe(false);
    expect(isInWishlist("unknown")).toBe(false);

    window.localStorage.setItem(guestKey, JSON.stringify([sampleItem]));
    expect(isInWishlist("prod-1")).toBe(true);
  });

  test("toggleWishlistItem adds and then removes item", () => {
    // Add
    const added = toggleWishlistItem(sampleItem);
    expect(added.added).toBe(true);
    expect(added.items).toHaveLength(1);
    expect(added.items[0]).toEqual(sampleItem);
    expect(JSON.parse(window.localStorage.getItem(guestKey) || "[]")).toHaveLength(1);

    // Remove
    const removed = toggleWishlistItem(sampleItem);
    expect(removed.added).toBe(false);
    expect(removed.items).toHaveLength(0);
    expect(JSON.parse(window.localStorage.getItem(guestKey) || "[]")).toHaveLength(0);
  });

  test("clearWishlist empties the stored list", () => {
    window.localStorage.setItem(guestKey, JSON.stringify([sampleItem]));
    clearWishlist();
    expect(getWishlistItems()).toEqual([]);
  });

  test("isolates wishlist by authenticated user", () => {
    setSessionUser("u1");
    toggleWishlistItem(sampleItem);
    expect(getWishlistItems()).toHaveLength(1);

    setSessionUser("u2");
    expect(getWishlistItems()).toEqual([]);
  });

  test("merges guest wishlist into user wishlist on login event", () => {
    window.localStorage.setItem(guestKey, JSON.stringify([sampleItem]));
    getWishlistItems();

    window.localStorage.setItem(
      "autozone_wishlist_u1",
      JSON.stringify([{ ...sampleItem, id: "prod-2", title: "Other" }])
    );
    setSessionUser("u1");
    window.dispatchEvent(new CustomEvent("autozone:auth-login", { detail: { userId: "u1" } }));

    const merged = JSON.parse(window.localStorage.getItem("autozone_wishlist_u1") || "[]");
    expect(merged).toHaveLength(2);
    expect(JSON.parse(window.localStorage.getItem(guestKey) || "[]")).toHaveLength(0);
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
