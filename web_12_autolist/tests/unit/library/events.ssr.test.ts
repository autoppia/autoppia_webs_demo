/** @jest-environment node */
// Server-side coverage tests for logEvent no-op when window is undefined.
import { EVENT_TYPES, logEvent } from "../../../src/library/events";

describe("events (SSR)", () => {
  it("logEvent no-ops when window is undefined", () => {
    // In node env, typeof window === "undefined" so it should return early.
    expect(() =>
      logEvent(EVENT_TYPES.ADD_TASK, { task_id: "t-1" }),
    ).not.toThrow();
  });
});
