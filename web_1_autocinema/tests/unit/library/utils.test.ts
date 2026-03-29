// Unit tests for `cn` (classnames merge/dedupe) helper.
import { cn } from "@/library/utils";

describe("library utils", () => {
  test("cn merges classes and resolves conflicts", () => {
    const classes = cn("px-2", "py-1", "px-4", false && "hidden", "text-sm");
    expect(classes).toContain("px-4");
    expect(classes).not.toContain("px-2");
    expect(classes).toContain("py-1");
    expect(classes).toContain("text-sm");
  });
});
