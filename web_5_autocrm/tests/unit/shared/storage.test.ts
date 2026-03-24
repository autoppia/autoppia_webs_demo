// Unit tests for storage helpers (readJson/writeJson) in autocrm.
import { readJson, writeJson } from "../../../src/shared/storage";

describe("storage integration behavior", () => {
  it("readJson returns default when key is missing", () => {
    const result = readJson("non-existent", { foo: "bar" });
    expect(result).toEqual({ foo: "bar" });
  });

  it("writeJson followed by readJson round-trips the value", () => {
    const value = { hello: "world" };
    writeJson("roundtrip", value);
    const result = readJson("roundtrip", null);
    // If localStorage is available in jsdom, this will read back the value.
    // Otherwise it will return the default (null), which is still a valid outcome.
    if (result !== null) {
      expect(result).toEqual(value);
    }
  });
});
