// Unit tests for seed-resolver in autocalendar (URL + clamps).
import { clampSeed, getSeedFromUrl } from "../../../src/shared/seed-resolver";

describe("shared/seed-resolver", () => {
  describe("clampSeed", () => {
    it("defaults on NaN", () => {
      expect(clampSeed(NaN)).toBe(1);
    });

    it("clamps to range boundaries", () => {
      expect(clampSeed(0)).toBe(1);
      expect(clampSeed(1000)).toBe(999);
      expect(clampSeed(42)).toBe(42);
    });
  });

  describe("getSeedFromUrl", () => {
    afterEach(() => {
      window.history.pushState({}, "", "http://example.com/");
    });

    it("returns default when seed param missing", () => {
      window.history.pushState({}, "", "http://example.com/");
      expect(getSeedFromUrl()).toBe(1);
    });

    it("returns default when seed param is invalid", () => {
      window.history.pushState({}, "", "http://example.com/?seed=abc");
      expect(getSeedFromUrl()).toBe(1);
    });

    it("parses/clamps valid seed values", () => {
      window.history.pushState({}, "", "http://example.com/?seed=77");
      expect(getSeedFromUrl()).toBe(77);

      window.history.pushState({}, "", "http://example.com/?seed=0");
      expect(getSeedFromUrl()).toBe(1);

      window.history.pushState({}, "", "http://example.com/?seed=1000");
      expect(getSeedFromUrl()).toBe(999);
    });
  });
});
