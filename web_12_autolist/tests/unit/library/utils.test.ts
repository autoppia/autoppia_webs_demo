// Unit tests for `cn` helper (classnames merge/dedupe).
import { cn } from "../../../src/library/utils";

describe("utils", () => {
  it("cn merges and dedupes classes", () => {
    const className = cn("p-2 p-4 text-red-500", "text-blue-500");
    // tailwind-merge keeps the last conflicting class
    expect(className).toContain("p-4");
    expect(className).not.toContain("p-2");
    expect(className).toContain("text-blue-500");
  });

  it("cn accepts falsy values via clsx", () => {
    const className = cn("px-2", false, undefined, null, "py-1");
    expect(className).toBe("px-2 py-1");
  });
});
