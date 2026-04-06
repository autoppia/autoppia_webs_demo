import { hashPassword, isStoredPasswordHash } from "@/shared/hash";

describe("shared/hash", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  test("hashPassword returns hex digest from crypto.subtle", async () => {
    const digestMock = jest.fn().mockResolvedValue(new Uint8Array([0, 1, 255]).buffer);
    Object.defineProperty(globalThis, "crypto", {
      value: { subtle: { digest: digestMock } },
      configurable: true,
    });

    const result = await hashPassword("test");

    const [, data] = digestMock.mock.calls[0];
    expect(data).toBeTruthy();
    expect(result).toBe("0001ff");
  });

  test("isStoredPasswordHash validates 64-hex hashes", () => {
    expect(isStoredPasswordHash("a".repeat(64))).toBe(true);
    expect(isStoredPasswordHash("A".repeat(64))).toBe(true);
    expect(isStoredPasswordHash("a".repeat(63))).toBe(false);
    expect(isStoredPasswordHash("g".repeat(64))).toBe(false);
  });
});
