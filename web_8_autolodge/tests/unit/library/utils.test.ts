// Unit tests for autodining layout utils/helpers in autolodge.
import type { LayoutConfig } from "../../../src/library/utils";
import { cn, getSeedLayout as getUtilsSeedLayout } from "../../../src/library/utils";
import { getSeedLayout as getVariantSeedLayout } from "../../../src/library/layoutVariants";

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

describe("getSeedLayout (utils)", () => {
  it("returns static layout for stay page", () => {
    const layout: LayoutConfig = getUtilsSeedLayout(5, "stay");
    expect(layout.searchBar.position).toBe("top");
    expect(layout.propertyDetail.layout).toBe("vertical");
    expect(layout.eventElements.order).toContain("reserve");
    expect(layout.eventElements.order).not.toContain("confirm");
  });

  it("returns static layout for confirm page with correct order", () => {
    const layout: LayoutConfig = getUtilsSeedLayout(5, "confirm");
    expect(layout.eventElements.order).toContain("confirm");
    expect(layout.eventElements.order).not.toContain("reserve");
  });
});

describe("getSeedLayout (layoutVariants)", () => {
  it("normalizes any seed to layout 1 config", () => {
    const layout1 = getVariantSeedLayout(1);
    const layout5 = getVariantSeedLayout(5);
    const layout10 = getVariantSeedLayout(10);

    expect(layout5).toEqual(layout1);
    expect(layout10).toEqual(layout1);

    expect(layout1.searchBar.position).toBeDefined();
    expect(layout1.propertyDetail.layout).toBeDefined();
    expect(typeof layout1.buttons.primaryClass).toBe("string");
  });
});
