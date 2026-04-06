import { isBrowser, readJson, writeJson } from "@/shared/storage";

describe("shared/storage", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    window.localStorage.clear();
  });

  test("isBrowser is true in jsdom", () => {
    expect(isBrowser()).toBe(true);
  });

  test("readJson returns parsed value or default", () => {
    window.localStorage.setItem("k1", JSON.stringify({ a: 1 }));
    expect(readJson("k1", null)).toEqual({ a: 1 });
    expect(readJson("missing", { b: 2 })).toEqual({ b: 2 });
  });

  test("readJson returns default on invalid JSON", () => {
    window.localStorage.setItem("bad", "{not-json");
    expect(readJson("bad", { ok: true })).toEqual({ ok: true });
  });

  test("writeJson stores stringified value", () => {
    writeJson("k2", { ok: true });
    expect(window.localStorage.getItem("k2")).toBe(JSON.stringify({ ok: true }));
  });

  test("read/write are no-ops when window is undefined", () => {
    const originalWindow = (globalThis as any).window;
    (globalThis as any).window = undefined;
    expect(readJson("k3", "fallback")).toBe("fallback");
    expect(() => writeJson("k3", { a: 1 })).not.toThrow();
    (globalThis as any).window = originalWindow;
  });
});
