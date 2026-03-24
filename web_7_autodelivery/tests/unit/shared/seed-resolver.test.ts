// Unit tests for seed-resolver helpers in autodelivery (search params + URL parsing).
import {
  clampSeed,
  getSeedFromSearchParams,
  getSeedFromUrl,
} from "../../../src/shared/seed-resolver";

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

describe("getSeedFromSearchParams", () => {
  it("returns default when seed is missing", () => {
    const params = new URLSearchParams("");
    expect(getSeedFromSearchParams(params)).toBe(1);
  });

  it("returns default when seed is not a number", () => {
    const params = new URLSearchParams("?seed=abc");
    expect(getSeedFromSearchParams(params)).toBe(1);
  });

  it("parses valid seed and clamps correctly", () => {
    expect(getSeedFromSearchParams(new URLSearchParams("?seed=50"))).toBe(50);
    expect(getSeedFromSearchParams(new URLSearchParams("?seed=0"))).toBe(1);
    expect(getSeedFromSearchParams(new URLSearchParams("?seed=2000"))).toBe(
      999,
    );
  });
});

describe("getSeedFromUrl", () => {
  afterEach(() => {
    window.history.pushState({}, "", "http://localhost/");
  });

  it("returns default when no seed param in URL", () => {
    window.history.pushState({}, "", "http://localhost/");
    expect(getSeedFromUrl()).toBe(1);
  });

  it("uses URL search params under the hood", () => {
    window.history.pushState({}, "", "http://localhost/?seed=77");
    expect(getSeedFromUrl()).toBe(77);
  });
});
