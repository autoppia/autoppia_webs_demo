import { writeJson } from "../../../src/shared/storage";

describe("shared/storage writeJson", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("ignores errors from localStorage.setItem", () => {
    const originalSetItem = window.localStorage.setItem;
    (window.localStorage as any).setItem = jest.fn(() => {
      throw new Error("quota exceeded");
    });

    expect(() => writeJson("key", { a: 1 })).not.toThrow();

    (window.localStorage as any).setItem = originalSetItem;
  });
});
