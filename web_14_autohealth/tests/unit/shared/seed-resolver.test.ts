// Unit tests for seed-resolver helpers (clamp + URL parsing) in autohealth.
import { clampSeed, getSeedFromUrl } from "../../../src/shared/seed-resolver";

describe("seed-resolver (client)", () => {
  afterEach(() => {
    window.history.pushState({}, "", "http://example.com/");
  });

  it("clampSeed: defaults when NaN", () => {
    expect(clampSeed(NaN)).toBe(1);
  });

  it("clampSeed: clamps within [1..999]", () => {
    expect(clampSeed(0)).toBe(1);
    expect(clampSeed(1000)).toBe(999);
    expect(clampSeed(42)).toBe(42);
  });

  it("getSeedFromUrl: returns default when seed missing", () => {
    window.history.pushState({}, "", "http://example.com/");
    expect(getSeedFromUrl()).toBe(1);
  });

  it("getSeedFromUrl: returns default when seed invalid", () => {
    window.history.pushState({}, "", "http://example.com/?seed=abc");
    expect(getSeedFromUrl()).toBe(1);
  });

  it("getSeedFromUrl: parses and clamps seed", () => {
    window.history.pushState({}, "", "http://example.com/?seed=77");
    expect(getSeedFromUrl()).toBe(77);

    window.history.pushState({}, "", "http://example.com/?seed=0");
    expect(getSeedFromUrl()).toBe(1);

    window.history.pushState({}, "", "http://example.com/?seed=1000");
    expect(getSeedFromUrl()).toBe(999);
  });

  it("getSeedFromUrl: falls back to default on URLSearchParams error", () => {
    const original = global.URLSearchParams;
    // Force the try/catch branch.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).URLSearchParams = function () {
      throw new Error("bad URLSearchParams");
    } as any;

    try {
      expect(getSeedFromUrl()).toBe(1);
    } finally {
      global.URLSearchParams = original;
    }
  });
});
