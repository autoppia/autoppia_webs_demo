// Unit tests for seed-resolver helpers (clamp + URL parsing).
import { clampSeed, getSeedFromUrl } from "../../../src/shared/seed-resolver";

describe("seed-resolver", () => {
  describe("clampSeed", () => {
    it("defaults when NaN", () => {
      expect(clampSeed(NaN)).toBe(1);
    });

    it("clamps below/above range", () => {
      expect(clampSeed(0)).toBe(1);
      expect(clampSeed(1000)).toBe(999);
      expect(clampSeed(42)).toBe(42);
    });
  });

  describe("getSeedFromUrl (jsdom)", () => {
    afterEach(() => {
      window.history.pushState({}, "", "http://example.com/");
    });

    it("returns default when seed param is missing", () => {
      window.history.pushState({}, "", "http://example.com/");
      expect(getSeedFromUrl()).toBe(1);
    });

    it("returns default when seed param is invalid", () => {
      window.history.pushState({}, "", "http://example.com/?seed=abc");
      expect(getSeedFromUrl()).toBe(1);
    });

    it("parses and clamps valid seed", () => {
      window.history.pushState({}, "", "http://example.com/?seed=77");
      expect(getSeedFromUrl()).toBe(77);

      window.history.pushState({}, "", "http://example.com/?seed=0");
      expect(getSeedFromUrl()).toBe(1);

      window.history.pushState({}, "", "http://example.com/?seed=1000");
      expect(getSeedFromUrl()).toBe(999);
    });
  });
});
