// Unit tests for EVENT_TYPES and logEvent in autodelivery.
import { EVENT_TYPES, logEvent } from "../../../src/components/library/events";

describe("EVENT_TYPES", () => {
  it("exposes all expected event constants", () => {
    expect(EVENT_TYPES.SEARCH_RESTAURANT).toBe("SEARCH_DELIVERY_RESTAURANT");
    expect(EVENT_TYPES.VIEW_RESTAURANT).toBe("VIEW_DELIVERY_RESTAURANT");
    expect(EVENT_TYPES.BACK_TO_ALL_RESTAURANTS).toBe("BACK_TO_ALL_RESTAURANTS");
    expect(EVENT_TYPES.ADD_TO_CART_MODAL_OPEN).toBe("ADD_TO_CART_MODAL_OPEN");
    expect(EVENT_TYPES.ADD_TO_CART_MENU_ITEM).toBe("ADD_TO_CART_MENU_ITEM");
    expect(EVENT_TYPES.ITEM_INCREMENTED).toBe("ITEM_INCREMENTED");
    expect(EVENT_TYPES.ITEM_DECREMENTED).toBe("ITEM_DECREMENTED");
    expect(EVENT_TYPES.EMPTY_CART).toBe("EMPTY_CART");
    expect(EVENT_TYPES.OPEN_CHECKOUT_PAGE).toBe("OPEN_CHECKOUT_PAGE");
    expect(EVENT_TYPES.ADDRESS_ADDED).toBe("ADDRESS_ADDED");
    expect(EVENT_TYPES.DROPOFF_PREFERENCE).toBe("DROPOFF_PREFERENCE");
    expect(EVENT_TYPES.DELIVERY_MODE).toBe("DELIVERY_MODE");
    expect(EVENT_TYPES.PICKUP_MODE).toBe("PICKUP_MODE");
    expect(EVENT_TYPES.PLACE_ORDER).toBe("PLACE_ORDER");
    expect(EVENT_TYPES.DELETE_REVIEW).toBe("DELETE_REVIEW");
    expect(EVENT_TYPES.QUICK_ORDER_STARTED).toBe("QUICK_ORDER_STARTED");
    expect(EVENT_TYPES.VIEW_ALL_RESTAURANTS).toBe("VIEW_ALL_RESTAURANTS");
    expect(EVENT_TYPES.QUICK_REORDER).toBe("QUICK_REORDER");
    expect(EVENT_TYPES.RESTAURANT_FILTER).toBe("RESTAURANT_FILTER");
    expect(EVENT_TYPES.EDIT_CART_ITEM).toBe("EDIT_CART_ITEM");
    expect(EVENT_TYPES.RESTAURANT_NEXT_PAGE).toBe("RESTAURANT_NEXT_PAGE");
    expect(EVENT_TYPES.RESTAURANT_PREV_PAGE).toBe("RESTAURANT_PREV_PAGE");
    expect(EVENT_TYPES.REVIEW_SUBMITTED).toBe("REVIEW_SUBMITTED");
    expect(EVENT_TYPES.DELIVERY_PRIORITY_SELECTED).toBe(
      "DELIVERY_PRIORITY_SELECTED",
    );
  });
});

describe("logEvent basic behavior", () => {
  it("logs and calls fetch when running in browser", () => {
    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    const fetchMock = jest.fn().mockResolvedValue({ ok: true } as any);
    global.fetch = fetchMock;

    logEvent(EVENT_TYPES.PLACE_ORDER, { restaurantId: "123" });

    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    consoleLogSpy.mockRestore();
  });
});
