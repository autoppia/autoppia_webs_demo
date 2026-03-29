/** @jest-environment node */
// Server-side coverage tests for logEvent no-op when window is undefined.
import { EVENT_TYPES, logEvent } from "../../../src/library/events";

describe("events (SSR)", () => {
  it("logEvent: resolves immediately when window is undefined", async () => {
    await expect(logEvent(EVENT_TYPES.SEARCH_MEDICAL_ANALYSIS, { x: 1 })).resolves.toBeUndefined();
  });
});
