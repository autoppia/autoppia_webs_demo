// Unit tests for seed-resolver helpers in autoconnect (search params + URL).
import {
  clampSeed,
  getSeedFromSearchParams,
  getSeedFromUrl,
} from "../../../src/shared/seed-resolver";

describe("seed-resolver", () => {
  describe("clampSeed", () => {
    it("returns default for NaN", () => {
      expect(clampSeed(NaN)).toBe(1);
    });

    it("clamps below range", () => {
      expect(clampSeed(0)).toBe(1);
    });

    it("clamps above range", () => {
      expect(clampSeed(1000)).toBe(999);
    });

    it("keeps value inside range", () => {
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

    it("parses and clamps seed", () => {
      expect(getSeedFromSearchParams(new URLSearchParams("?seed=50"))).toBe(
        50,
      );
      expect(getSeedFromSearchParams(new URLSearchParams("?seed=0"))).toBe(1);
      expect(getSeedFromSearchParams(new URLSearchParams("?seed=1000"))).toBe(
        999,
      );
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

    it("parses and clamps from window location", () => {
      window.history.pushState({}, "", "http://localhost/?seed=77");
      expect(getSeedFromUrl()).toBe(77);

      window.history.pushState({}, "", "http://localhost/?seed=0");
      expect(getSeedFromUrl()).toBe(1);
    });

    it("returns default when window is undefined (SSR)", () => {
      const originalWindow = (global as any).window;
      delete (global as any).window;
      expect(getSeedFromUrl()).toBe(1);
      (global as any).window = originalWindow;
    });
  });
});
