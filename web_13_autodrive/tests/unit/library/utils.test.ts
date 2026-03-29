// Unit tests for `cn` helper in autodrive.
import { cn } from "../../../src/library/utils";

describe("utils", () => {
  it("cn merges and dedupes classes", () => {
    const className = cn("p-2 p-4 text-red-500", "text-blue-500");
    expect(className).toContain("p-4");
    expect(className).not.toContain("p-2");
    expect(className).toContain("text-blue-500");
  });

  it("cn accepts falsy values", () => {
    expect(cn("px-2", false, undefined, null, "py-1")).toBe("px-2 py-1");
  });
});
