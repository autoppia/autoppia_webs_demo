// Unit tests for `cn` helper in autodelivery.
import { cn } from "../../../src/components/library/utils";

describe("cn", () => {
  it("merges class names and conditional values", () => {
    const result = cn("base", false && "hidden", "extra", {
      active: true,
      disabled: false,
    });
    expect(result).toContain("base");
    expect(result).toContain("extra");
    expect(result).toContain("active");
    expect(result).not.toContain("disabled");
    expect(result).not.toContain("hidden");
  });

  it("returns empty string for no inputs", () => {
    expect(cn()).toBe("");
  });
});
