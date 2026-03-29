// Unit tests for seed-resolver helpers (clamp + URL parsing).
import { clampSeed, getSeedFromUrl } from "@/shared/seed-resolver";

describe("seed-resolver (autodining)", () => {
  test("clampSeed enforces range and default", () => {
    expect(clampSeed(NaN)).toBe(1);
    expect(clampSeed(-5)).toBe(1);
    expect(clampSeed(2000)).toBe(999);
    expect(clampSeed(42)).toBe(42);
  });

  test("getSeedFromUrl reads and clamps seed from query", () => {
    window.history.pushState({}, "", "/?seed=25");
    expect(getSeedFromUrl()).toBe(25);

    window.history.pushState({}, "", "/?seed=10000");
    expect(getSeedFromUrl()).toBe(999);

    window.history.pushState({}, "", "/?seed=abc");
    expect(getSeedFromUrl()).toBe(1);
  });
});
