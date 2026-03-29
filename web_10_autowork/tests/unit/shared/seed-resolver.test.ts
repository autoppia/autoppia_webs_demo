import { clampSeed, getSeedFromUrl } from "../../../src/shared/seed-resolver";

describe("shared/seed-resolver", () => {
  describe("clampSeed", () => {
    it("returns default for NaN", () => {
      expect(clampSeed(NaN)).toBe(1);
    });

    it("clamps below min", () => {
      expect(clampSeed(0)).toBe(1);
    });

    it("clamps above max", () => {
      expect(clampSeed(1000)).toBe(999);
    });

    it("keeps value inside range", () => {
      expect(clampSeed(42)).toBe(42);
    });
  });

  describe("getSeedFromUrl", () => {
    afterEach(() => {
      window.history.pushState({}, "", "http://localhost/");
    });

    it("returns default when seed param is missing", () => {
      window.history.pushState({}, "", "http://localhost/");
      expect(getSeedFromUrl()).toBe(1);
    });

    it("returns default when seed param is invalid", () => {
      window.history.pushState({}, "", "http://localhost/?seed=abc");
      expect(getSeedFromUrl()).toBe(1);
    });

    it("parses and clamps valid seed", () => {
      window.history.pushState({}, "", "http://localhost/?seed=50");
      expect(getSeedFromUrl()).toBe(50);

      window.history.pushState({}, "", "http://localhost/?seed=0");
      expect(getSeedFromUrl()).toBe(1);

      window.history.pushState({}, "", "http://localhost/?seed=1000");
      expect(getSeedFromUrl()).toBe(999);
    });
  });
});
