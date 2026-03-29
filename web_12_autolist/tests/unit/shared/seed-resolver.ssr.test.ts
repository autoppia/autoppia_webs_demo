// Server-side coverage tests for seed-resolver (window-less).
/** @jest-environment node */
import { clampSeed, getSeedFromUrl } from "../../../src/shared/seed-resolver";

describe("seed-resolver SSR", () => {
  it("getSeedFromUrl returns default without window", () => {
    expect(clampSeed(1)).toBe(1);
    expect(getSeedFromUrl()).toBe(1);
  });
});
