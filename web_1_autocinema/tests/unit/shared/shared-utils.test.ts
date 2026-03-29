// Unit tests for shared utils (hashing + seed/URL helpers).
import { hashPassword, isStoredPasswordHash } from "@/shared/hash";
import { clampSeed, getSeedFromUrl } from "@/shared/seed-resolver";
import { readJson, writeJson } from "@/shared/storage";
import { webcrypto } from "crypto";

describe("shared utilities", () => {
  test("hashPassword generates deterministic SHA-256 hash", async () => {
    Object.defineProperty(globalThis, "crypto", {
      value: webcrypto,
      configurable: true,
    });

    const a = await hashPassword("secret");
    const b = await hashPassword("secret");
    const c = await hashPassword("other");

    expect(a).toHaveLength(64);
    expect(a).toEqual(b);
    expect(a).not.toEqual(c);
    expect(isStoredPasswordHash(a)).toBe(true);
  });

  test("isStoredPasswordHash validates expected formats", () => {
    expect(isStoredPasswordHash("a".repeat(64))).toBe(true);
    expect(isStoredPasswordHash("A".repeat(64))).toBe(true);
    expect(isStoredPasswordHash("not-a-hash")).toBe(false);
    expect(isStoredPasswordHash("f".repeat(63))).toBe(false);
  });

  test("clampSeed enforces min/max and NaN fallback", () => {
    expect(clampSeed(Number.NaN)).toBe(1);
    expect(clampSeed(-2)).toBe(1);
    expect(clampSeed(1000)).toBe(999);
    expect(clampSeed(42)).toBe(42);
  });

  test("getSeedFromUrl reads and clamps seed query param", () => {
    window.history.pushState({}, "", "/?seed=50");
    expect(getSeedFromUrl()).toBe(50);

    window.history.pushState({}, "", "/?seed=10000");
    expect(getSeedFromUrl()).toBe(999);

    window.history.pushState({}, "", "/?seed=abc");
    expect(getSeedFromUrl()).toBe(1);
  });

  test("readJson returns default for missing/invalid data", () => {
    expect(readJson("missing", { fallback: true })).toEqual({ fallback: true });

    window.localStorage.setItem("bad", "{not-json");
    expect(readJson("bad", "default")).toBe("default");
  });

  test("writeJson + readJson roundtrip", () => {
    writeJson("user", { id: 1, name: "Alice" });
    expect(readJson("user")).toEqual({ id: 1, name: "Alice" });
  });
});
