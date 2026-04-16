import {
  getInitialCartStateFromStorage,
  GUEST_CART_KEY,
  LEGACY_CART_KEY,
  mergeCartItems,
  normalizeCartItems,
  readGuestCartState,
  readSessionUserId,
  readUserCartState,
  userCartStorageKey,
} from "@/library/cart-storage";
import type { CartItem, CartState } from "@/types/cart";

const item = (id: string, quantity: number): CartItem => ({
  id,
  title: `Item ${id}`,
  price: "$10.00",
  image: "/x.png",
  quantity,
});

describe("library/cart-storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  test("userCartStorageKey builds per-user key", () => {
    expect(userCartStorageKey("u-1")).toBe("omnizonCart_u-1");
  });

  test("readSessionUserId returns id from valid session", () => {
    window.localStorage.setItem(
      "autozone_auth_current_user_v1",
      JSON.stringify({
        id: "u-123",
        username: "alice",
        createdAt: "2026-01-01T00:00:00.000Z",
      })
    );
    expect(readSessionUserId()).toBe("u-123");
  });

  test("readSessionUserId returns null for invalid or malformed session", () => {
    window.localStorage.setItem(
      "autozone_auth_current_user_v1",
      JSON.stringify({ id: "", username: "alice", createdAt: "x" })
    );
    expect(readSessionUserId()).toBeNull();

    window.localStorage.setItem("autozone_auth_current_user_v1", "{bad-json");
    expect(readSessionUserId()).toBeNull();
  });

  test("normalizeCartItems enforces minimum quantity 1", () => {
    const normalized = normalizeCartItems([
      item("a", 0),
      item("b", -2),
      item("c", 3),
    ]);
    expect(normalized.map((x) => x.quantity)).toEqual([1, 1, 3]);
  });

  test("readGuestCartState prefers guest key over legacy", () => {
    const guest: CartState = { items: [item("g", 2)], totalItems: 2, totalAmount: 20 };
    const legacy: CartState = { items: [item("l", 5)], totalItems: 5, totalAmount: 50 };
    window.localStorage.setItem(GUEST_CART_KEY, JSON.stringify(guest));
    window.localStorage.setItem(LEGACY_CART_KEY, JSON.stringify(legacy));

    const result = readGuestCartState();
    expect(result.items[0]?.id).toBe("g");
  });

  test("readGuestCartState migrates legacy cart to guest key", () => {
    const legacy: CartState = {
      items: [item("legacy", 0)],
      totalItems: 1,
      totalAmount: 10,
    };
    window.localStorage.setItem(LEGACY_CART_KEY, JSON.stringify(legacy));

    const result = readGuestCartState();
    expect(result.items[0]?.id).toBe("legacy");
    expect(result.items[0]?.quantity).toBe(1);

    const migrated = JSON.parse(window.localStorage.getItem(GUEST_CART_KEY) || "{}") as CartState;
    expect(migrated.items[0]?.id).toBe("legacy");
  });

  test("readGuestCartState returns empty state when no guest or legacy cart", () => {
    expect(readGuestCartState()).toEqual({ items: [], totalItems: 0, totalAmount: 0 });
  });

  test("readUserCartState reads user-specific cart", () => {
    const state: CartState = { items: [item("u", 2)], totalItems: 2, totalAmount: 20 };
    window.localStorage.setItem(userCartStorageKey("u1"), JSON.stringify(state));
    expect(readUserCartState("u1")).toEqual(state);
  });

  test("getInitialCartStateFromStorage uses user cart when session exists", () => {
    window.localStorage.setItem(
      "autozone_auth_current_user_v1",
      JSON.stringify({ id: "u1", username: "u", createdAt: "2026-01-01T00:00:00.000Z" })
    );
    window.localStorage.setItem(
      userCartStorageKey("u1"),
      JSON.stringify({ items: [item("p", 0)], totalItems: 1, totalAmount: 10 })
    );

    const initial = getInitialCartStateFromStorage();
    expect(initial.items[0]?.id).toBe("p");
    expect(initial.items[0]?.quantity).toBe(1);
  });

  test("getInitialCartStateFromStorage returns empty user state when session has no cart", () => {
    window.localStorage.setItem(
      "autozone_auth_current_user_v1",
      JSON.stringify({ id: "u2", username: "u", createdAt: "2026-01-01T00:00:00.000Z" })
    );
    window.localStorage.setItem(
      GUEST_CART_KEY,
      JSON.stringify({ items: [item("guest", 2)], totalItems: 2, totalAmount: 20 })
    );

    expect(getInitialCartStateFromStorage()).toEqual({ items: [], totalItems: 0, totalAmount: 0 });
  });

  test("getInitialCartStateFromStorage falls back to guest cart without session", () => {
    window.localStorage.setItem(
      GUEST_CART_KEY,
      JSON.stringify({ items: [item("guest", 2)], totalItems: 2, totalAmount: 20 })
    );
    expect(getInitialCartStateFromStorage().items[0]?.id).toBe("guest");
  });

  test("mergeCartItems combines duplicate ids and preserves unique items", () => {
    const merged = mergeCartItems(
      [item("same", 1), item("left", 2)],
      [item("same", 3), item("right", 1)]
    );

    const same = merged.find((x) => x.id === "same");
    expect(same?.quantity).toBe(4);
    expect(merged.find((x) => x.id === "left")?.quantity).toBe(2);
    expect(merged.find((x) => x.id === "right")?.quantity).toBe(1);
  });
});
