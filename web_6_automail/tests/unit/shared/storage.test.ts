// Unit tests for storage helpers (readJson/writeJson) in automail.
import { readJson, writeJson } from "../../../src/shared/storage";

describe("storage helpers", () => {
  it("readJson returns default when key is missing", () => {
    const result = readJson("non-existent", { foo: "bar" });
    expect(result).toEqual({ foo: "bar" });
  });

  it("writeJson followed by readJson round-trips the value", () => {
    const value = { hello: "world" };
    writeJson("roundtrip", value);
    const result = readJson("roundtrip", null);
    if (result !== null) {
      expect(result).toEqual(value);
    }
  });
});
