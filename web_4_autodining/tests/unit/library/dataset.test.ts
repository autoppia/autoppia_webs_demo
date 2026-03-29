// Unit tests for dataset constants (countries list).
import { countries } from "@/library/dataset";

describe("dataset (autodining)", () => {
  test("countries is a non-empty list of country objects", () => {
    expect(Array.isArray(countries)).toBe(true);
    expect(countries.length).toBeGreaterThan(0);

    const first = countries[0];
    expect(first).toHaveProperty("code");
    expect(first).toHaveProperty("name");
    expect(first).toHaveProperty("dial");
    expect(first).toHaveProperty("flag");
  });

  test("includes some expected country codes", () => {
    const codes = countries.map((c) => c.code);
    expect(codes).toContain("US");
    expect(codes).toContain("ES");
    expect(codes).toContain("JP");
  });
});
