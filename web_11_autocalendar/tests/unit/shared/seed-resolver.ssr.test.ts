// Server-side coverage tests for seed-resolver (window-less).
/** @jest-environment node */
import { getSeedFromUrl, clampSeed } from "../../../src/shared/seed-resolver";

describe("shared/seed-resolver SSR", () => {
  it("clampSeed still works without window", () => {
    expect(clampSeed(1)).toBe(1);
  });

  it("getSeedFromUrl returns default when window is undefined", () => {
    expect(getSeedFromUrl()).toBe(1);
  });
});
