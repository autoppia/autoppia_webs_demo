// Unit tests for EVENT_TYPES and logEvent in autolodge.
import { EVENT_TYPES, logEvent } from "../../../src/library/events";

describe("EVENT_TYPES", () => {
  it("exposes all expected event constants", () => {
    expect(EVENT_TYPES.SEARCH_HOTEL).toBe("SEARCH_HOTEL");
    expect(EVENT_TYPES.VIEW_HOTEL).toBe("VIEW_HOTEL");
    expect(EVENT_TYPES.RESERVE_HOTEL).toBe("RESERVE_HOTEL");
    expect(EVENT_TYPES.INCREASE_NUMBER_OF_GUESTS).toBe(
      "INCREASE_NUMBER_OF_GUESTS",
    );
    expect(EVENT_TYPES.EDIT_CHECK_IN_OUT_DATES).toBe(
      "EDIT_CHECK_IN_OUT_DATES",
    );
    expect(EVENT_TYPES.MESSAGE_HOST).toBe("MESSAGE_HOST");
    expect(EVENT_TYPES.CONFIRM_AND_PAY).toBe("CONFIRM_AND_PAY");
    expect(EVENT_TYPES.ADD_TO_WISHLIST).toBe("ADD_TO_WISHLIST");
    expect(EVENT_TYPES.REMOVE_FROM_WISHLIST).toBe("REMOVE_FROM_WISHLIST");
    expect(EVENT_TYPES.SHARE_HOTEL).toBe("SHARE_HOTEL");
    expect(EVENT_TYPES.BACK_TO_ALL_HOTELS).toBe("BACK_TO_ALL_HOTELS");
    expect(EVENT_TYPES.EDIT_NUMBER_OF_GUESTS).toBe("EDIT_NUMBER_OF_GUESTS");
    expect(EVENT_TYPES.APPLY_FILTERS).toBe("APPLY_FILTERS");
    expect(EVENT_TYPES.SUBMIT_REVIEW).toBe("SUBMIT_REVIEW");
    expect(EVENT_TYPES.PAYMENT_METHOD_SELECTED).toBe(
      "PAYMENT_METHOD_SELECTED",
    );
    expect(EVENT_TYPES.HELP_VIEWED).toBe("HELP_VIEWED");
    expect(EVENT_TYPES.FAQ_OPENED).toBe("FAQ_OPENED");
    expect(EVENT_TYPES.POPULAR_HOTELS_VIEWED).toBe("POPULAR_HOTELS_VIEWED");
    expect(EVENT_TYPES.WISHLIST_OPENED).toBe("WISHLIST_OPENED");
    expect(EVENT_TYPES.BOOK_FROM_WISHLIST).toBe("BOOK_FROM_WISHLIST");
  });
});

describe("logEvent basic behavior", () => {
  it("logs and calls fetch when running in browser", () => {
    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    const fetchMock = jest.fn().mockResolvedValue({ ok: true } as any);
    global.fetch = fetchMock;

    logEvent(EVENT_TYPES.RESERVE_HOTEL, { hotelId: "abc" });

    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    consoleLogSpy.mockRestore();
  });
});
