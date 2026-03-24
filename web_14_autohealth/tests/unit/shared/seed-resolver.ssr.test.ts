/** @jest-environment node */
// Server-side coverage tests for seed-resolver (window-less).
import { getSeedFromUrl } from "../../../src/shared/seed-resolver";

describe("seed-resolver (SSR)", () => {
  it("returns default when window is undefined", () => {
    expect(getSeedFromUrl()).toBe(1);
  });
});
