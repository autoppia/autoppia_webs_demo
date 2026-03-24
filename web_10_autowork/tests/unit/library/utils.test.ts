// Unit tests for `cn` and `getSeedLayout` in autowork.
import { cn, getSeedLayout } from "../../../src/library/utils";

describe("library/utils", () => {
  describe("cn", () => {
    it("merges class names and ignores falsy values", () => {
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

    it("returns empty string with no inputs", () => {
      expect(cn()).toBe("");
    });
  });

  describe("getSeedLayout", () => {
    it("returns default layout when seed is missing or invalid", () => {
      const defaultLayout = getSeedLayout(undefined);
      expect(defaultLayout.mainSections).toEqual(["jobs", "hires", "experts"]);

      expect(getSeedLayout(0).mainSections).toEqual([
        "jobs",
        "hires",
        "experts",
      ]);
      expect(getSeedLayout(301).mainSections).toEqual([
        "jobs",
        "hires",
        "experts",
      ]);
    });

    it("returns deterministic seed-based layout", () => {
      const layout1 = getSeedLayout(1);
      expect(layout1.mainSections).toEqual(["experts", "jobs", "hires"]);

      // Seed 16 should map to layout key 1 because we have layouts 1..15.
      const layout16 = getSeedLayout(16);
      expect(layout16).toEqual(layout1);
    });
  });
});
