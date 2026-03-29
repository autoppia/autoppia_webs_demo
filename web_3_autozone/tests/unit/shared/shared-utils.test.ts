// Unit tests for shared utilities (seed clamping + storage read/write).
import { clampSeed, getSeedFromUrl } from "@/shared/seed-resolver";
import { readJson, writeJson } from "@/shared/storage";

describe("shared utilities (autozone)", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  test("clampSeed enforces range and default", () => {
    expect(clampSeed(NaN)).toBe(1);
    expect(clampSeed(-5)).toBe(1);
    expect(clampSeed(2000)).toBe(999);
    expect(clampSeed(42)).toBe(42);
  });

  test("getSeedFromUrl reads and clamps seed from query", () => {
    window.history.pushState({}, "", "/?seed=50");
    expect(getSeedFromUrl()).toBe(50);

    window.history.pushState({}, "", "/?seed=10000");
    expect(getSeedFromUrl()).toBe(999);

    window.history.pushState({}, "", "/?seed=abc");
    expect(getSeedFromUrl()).toBe(1);
  });

  test("readJson returns default when missing or invalid", () => {
    expect(readJson("missing", { fallback: true })).toEqual({ fallback: true });

    window.localStorage.setItem("bad", "{not-json");
    expect(readJson("bad", "default")).toBe("default");
  });

  test("writeJson + readJson roundtrip", () => {
    writeJson("cart", { items: [1, 2, 3] });
    expect(readJson("cart")).toEqual({ items: [1, 2, 3] });
  });
});
