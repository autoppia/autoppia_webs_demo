// Unit tests for seed resolution in autobooks (search params + URL).
import { clampSeed, getSeedFromSearchParams, getSeedFromUrl } from "@/shared/seed-resolver";

describe("seed-resolver (autobooks)", () => {
  test("clampSeed enforces range and default", () => {
    expect(clampSeed(NaN)).toBe(1);
    expect(clampSeed(-5)).toBe(1);
    expect(clampSeed(2000)).toBe(999);
    expect(clampSeed(42)).toBe(42);
  });

  test("getSeedFromSearchParams reads and clamps seed", () => {
    const params = new URLSearchParams();
    expect(getSeedFromSearchParams(params)).toBe(1);

    params.set("seed", "50");
    expect(getSeedFromSearchParams(params)).toBe(50);

    params.set("seed", "9999");
    expect(getSeedFromSearchParams(params)).toBe(999);

    params.set("seed", "abc");
    expect(getSeedFromSearchParams(params)).toBe(1);
  });

  test("getSeedFromUrl uses window location search", () => {
    window.history.pushState({}, "", "/?seed=77");
    expect(getSeedFromUrl()).toBe(77);

    window.history.pushState({}, "", "/?seed=bad");
    expect(getSeedFromUrl()).toBe(1);
  });
}
);
