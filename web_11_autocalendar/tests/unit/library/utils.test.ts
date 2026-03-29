// Unit tests for `cn` in autocalendar.
import { cn } from "../../../src/library/utils";

describe("library/utils", () => {
  it("cn merges class names", () => {
    const result = cn("base", false && "hidden", "extra", {
      active: true,
      disabled: false,
    });
    expect(result).toContain("base");
    expect(result).toContain("extra");
    expect(result).toContain("active");
    expect(result).not.toContain("hidden");
    expect(result).not.toContain("disabled");
  });

  it("cn returns empty string for no inputs", () => {
    expect(cn()).toBe("");
  });
});
