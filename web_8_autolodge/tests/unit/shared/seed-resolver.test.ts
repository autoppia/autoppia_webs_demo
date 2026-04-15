// Unit tests for seed-resolver helpers in autolodge.
import { clampSeed, getSeedFromUrl } from "../../../src/shared/seed-resolver";

describe("clampSeed", () => {
  it("returns default when NaN", () => {
    expect(clampSeed(NaN)).toBe(1);
  });

  it("clamps below minimum", () => {
    expect(clampSeed(0)).toBe(1);
  });

  it("clamps above maximum", () => {
    expect(clampSeed(1000)).toBe(999);
  });

  it("returns seed when within range", () => {
    expect(clampSeed(42)).toBe(42);
  });
});

describe("getSeedFromUrl", () => {
  const prevV2 = process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V2;

  afterEach(() => {
    window.history.pushState({}, "", "http://localhost/");
    process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V2 = prevV2;
  });

  it("returns 1 when V2 is disabled even if URL has seed", () => {
    process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V2 = "false";
    window.history.pushState({}, "", "http://localhost/?seed=50");
    expect(getSeedFromUrl()).toBe(1);
  });

  it("returns default when no seed param (V2 on)", () => {
    process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V2 = "true";
    window.history.pushState({}, "", "http://localhost/");
    expect(getSeedFromUrl()).toBe(1);
  });

  it("returns default when seed is not a number (V2 on)", () => {
    process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V2 = "true";
    window.history.pushState({}, "", "http://localhost/?seed=abc");
    expect(getSeedFromUrl()).toBe(1);
  });

  it("parses valid seed and clamps using clampSeed (V2 on)", () => {
    process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V2 = "true";
    window.history.pushState({}, "", "http://localhost/?seed=50");
    expect(getSeedFromUrl()).toBe(50);

    window.history.pushState({}, "", "http://localhost/?seed=0");
    expect(getSeedFromUrl()).toBe(1);

    window.history.pushState({}, "", "http://localhost/?seed=1000");
    expect(getSeedFromUrl()).toBe(999);
  });
});
