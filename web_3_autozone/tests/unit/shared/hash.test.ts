import { hashPassword, isStoredPasswordHash } from "@/shared/hash";
import { webcrypto } from "crypto";

describe("shared/hash", () => {
  beforeAll(() => {
    Object.defineProperty(globalThis, "crypto", {
      value: webcrypto,
      configurable: true,
    });
  });

  test("hashPassword returns deterministic SHA-256 hex", async () => {
    const digest = await hashPassword("password123");
    expect(digest).toBe(
      "ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f"
    );
  });

  test("hashPassword differs for different inputs", async () => {
    const a = await hashPassword("abc");
    const b = await hashPassword("abcd");
    expect(a).not.toBe(b);
  });

  test("isStoredPasswordHash validates 64-char hex only", () => {
    expect(isStoredPasswordHash("a".repeat(64))).toBe(true);
    expect(isStoredPasswordHash("A".repeat(64))).toBe(true);
    expect(isStoredPasswordHash("g".repeat(64))).toBe(false);
    expect(isStoredPasswordHash("a".repeat(63))).toBe(false);
    expect(isStoredPasswordHash("")).toBe(false);
  });
});
