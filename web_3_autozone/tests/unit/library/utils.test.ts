// Unit tests for `cn` helper in autozone.
import { cn } from "@/library/utils";

describe("library utils (autozone)", () => {
  test("cn merges Tailwind utility classes correctly", () => {
    const result = cn("px-2", "py-1", "px-4", false && "hidden", "text-sm");
    expect(result).toContain("px-4");
    expect(result).not.toContain("px-2");
    expect(result).toContain("py-1");
    expect(result).toContain("text-sm");
  });
});
