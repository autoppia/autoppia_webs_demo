// Unit tests for v2Seed utilities (resolveDatasetSeed + waitForDatasetSeed).
import { resolveDatasetSeed, waitForDatasetSeed } from "../../../src/utils/v2Seed";

describe("utils/v2Seed", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    window.history.pushState({}, "", "http://example.com/");
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  it("waitForDatasetSeed resolves/returns void", async () => {
    await expect(waitForDatasetSeed(123)).resolves.toBeUndefined();
  });

  it("resolveDatasetSeed: returns 1 when V2 disabled", () => {
    process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V2 = "false";
    window.history.pushState({}, "", "http://example.com/?seed=999");
    expect(resolveDatasetSeed(50)).toBe(1);
    expect(resolveDatasetSeed(null)).toBe(1);
  });

  it("resolveDatasetSeed: clamps provided seedValue when V2 enabled", () => {
    process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V2 = "true";
    expect(resolveDatasetSeed(0)).toBe(1);
    expect(resolveDatasetSeed(1000)).toBe(999);
    expect(resolveDatasetSeed(42)).toBe(42);
  });

  it("resolveDatasetSeed: uses getSeedFromUrl when seedValue is null/undefined", () => {
    process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V2 = "true";
    window.history.pushState({}, "", "http://example.com/?seed=77");
    expect(resolveDatasetSeed(undefined)).toBe(77);

    window.history.pushState({}, "", "http://example.com/?seed=0");
    expect(resolveDatasetSeed(null)).toBe(1);
  });
});
