// Unit tests for booking href/path builder helpers.
import { buildBookingHref } from "@/utils/bookingPaths";

describe("bookingPaths (autodining)", () => {
  test("buildBookingHref builds URL without query when no params", () => {
    const href = buildBookingHref("rest-1", "20:00");
    expect(href).toBe("/booking/rest-1/20%3A00");
  });

  test("buildBookingHref includes people and date when provided", () => {
    const href = buildBookingHref("rest-1", "21:30", { people: 4, date: "2026-03-19" });
    expect(href).toContain("/booking/rest-1/21%3A30");
    expect(href).toContain("people=4");
    expect(href).toContain("date=2026-03-19");
  });

  test("buildBookingHref ignores empty values", () => {
    const href = buildBookingHref("rest-1", "19:00", { people: "", date: null });
    expect(href).toBe("/booking/rest-1/19%3A00");
  });
});
