// Unit tests for dataset constants (rides) in autodrive.
import { rides } from "../../../src/library/dataset";

describe("dataset", () => {
  it("exports rides with expected fields", () => {
    expect(Array.isArray(rides)).toBe(true);
    expect(rides.length).toBeGreaterThan(0);

    for (const ride of rides) {
      expect(typeof ride.name).toBe("string");
      expect(typeof ride.image).toBe("string");
      expect(typeof ride.icon).toBe("string");
      expect(typeof ride.price).toBe("number");
    }
  });
});
