/** @jest-environment node */
// Server-side coverage tests for logEvent no-op (window-less).
import { EVENT_TYPES, logEvent } from "../../../src/library/event";

describe("events (SSR)", () => {
  it("logEvent no-ops when window is undefined", () => {
    expect(() =>
      logEvent(EVENT_TYPES.ENTER_LOCATION, { location_id: "l-1" }),
    ).not.toThrow();
  });
});
