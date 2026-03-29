// Unit tests for dataset constants (hires/jobs/experts) in autowork.
import { hires, jobs, experts } from "../../../src/library/dataset";

describe("library/dataset", () => {
  it("has non-empty jobs/hires/experts datasets", () => {
    expect(Array.isArray(jobs)).toBe(true);
    expect(jobs.length).toBeGreaterThan(0);
    expect(jobs[0]).toHaveProperty("title");

    expect(Array.isArray(hires)).toBe(true);
    expect(hires.length).toBeGreaterThan(0);
    expect(hires[0]).toHaveProperty("role");

    expect(Array.isArray(experts)).toBe(true);
    expect(experts.length).toBeGreaterThan(0);
    expect(experts[0]).toHaveProperty("slug");
  });

  it("includes expected first entries", () => {
    expect(jobs[0].title).toContain("front-end");
    expect(hires[0].country).toBe("Colombia");
    expect(experts[0].slug).toBe("alexa-r");
  });
});
