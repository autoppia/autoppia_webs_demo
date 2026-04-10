import {
  DISCOUNT_BUCKETS,
  getDiscountPercent,
  hasMeaningfulOriginalPrice,
  matchesDiscountBucket,
  parseMoneyValue,
  type DiscountBucket,
} from "@/library/pricing";

describe("pricing helpers", () => {
  test("parseMoneyValue parses dollar strings", () => {
    expect(parseMoneyValue("$89.99")).toBeCloseTo(89.99);
    expect(parseMoneyValue("120")).toBe(120);
  });

  test("parseMoneyValue returns NaN for empty or invalid", () => {
    expect(parseMoneyValue("")).toBeNaN();
    expect(parseMoneyValue(undefined)).toBeNaN();
    expect(parseMoneyValue(null)).toBeNaN();
    expect(parseMoneyValue("abc")).toBeNaN();
  });

  test("getDiscountPercent is zero without meaningful original", () => {
    expect(getDiscountPercent(undefined, "$10")).toBe(0);
    expect(getDiscountPercent("$10", "$10")).toBe(0);
    expect(getDiscountPercent("$8", "$10")).toBe(0);
  });

  test("getDiscountPercent computes percent when original exceeds current", () => {
    expect(getDiscountPercent("$100", "$80")).toBe(20);
    expect(getDiscountPercent("$250", "$75")).toBe(70);
  });

  test("hasMeaningfulOriginalPrice mirrors discount > 0", () => {
    expect(hasMeaningfulOriginalPrice("$100", "$80")).toBe(true);
    expect(hasMeaningfulOriginalPrice("$80", "$80")).toBe(false);
  });

  test("matchesDiscountBucket enforces minimum tier", () => {
    expect(matchesDiscountBucket(25, 20)).toBe(true);
    expect(matchesDiscountBucket(25, 40)).toBe(false);
    expect(matchesDiscountBucket(70, 70)).toBe(true);
    expect(matchesDiscountBucket(0, 20)).toBe(false);
    expect(matchesDiscountBucket(Number.NaN, 20)).toBe(false);
  });

  test("DISCOUNT_BUCKETS lists expected tiers", () => {
    expect(DISCOUNT_BUCKETS).toEqual([20, 40, 70]);
    const _exhaustive: DiscountBucket[] = [...DISCOUNT_BUCKETS];
    expect(_exhaustive.length).toBe(3);
  });
});
