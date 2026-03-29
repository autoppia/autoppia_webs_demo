// Unit tests for seeded-loader (fetchSeededSelection) in autodrive.
import { fetchSeededSelection, getApiBaseUrl } from "../../../src/shared/seeded-loader";

describe("seeded-loader (client)", () => {
  const originalFetch = global.fetch;
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env = originalEnv;
    jest.resetAllMocks();
  });

  it("getApiBaseUrl uses non-local NEXT_PUBLIC_API_URL", () => {
    process.env.NEXT_PUBLIC_API_URL = "https://api.example.com";
    expect(getApiBaseUrl()).toBe("https://api.example.com");
  });

  it("getApiBaseUrl uses origin/api when envUrl is missing", () => {
    delete process.env.NEXT_PUBLIC_API_URL;
    delete process.env.API_URL;
    expect(getApiBaseUrl()).toBe(`${window.location.origin}/api`);
  });

  it("getApiBaseUrl falls back to origin/api when envUrl is local but origin is non-local", () => {
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:1234";
    expect(getApiBaseUrl()).toBe(`${window.location.origin}/api`);
  });

  it("fetchSeededSelection defaults seed/limit/method when omitted", async () => {
    delete process.env.NEXT_PUBLIC_API_URL;
    delete process.env.API_URL;

    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: [{ id: "dflt" }] }),
    });
    global.fetch = mockFetch as any;

    const result = await fetchSeededSelection<{ id: string }>({
      projectKey: "proj",
      entityType: "entity",
    });
    expect(result).toEqual([{ id: "dflt" }]);

    const [url] = mockFetch.mock.calls[0] as [string];
    expect(url).toContain("seed_value=1");
    expect(url).toContain("limit=50");
    expect(url).toContain("method=select");
  });

  it("fetchSeededSelection builds URL with params and filterValues", async () => {
    process.env.NEXT_PUBLIC_API_URL = "https://api.example.com";

    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: [{ id: "x" }] }),
    });
    global.fetch = mockFetch as any;

    const result = await fetchSeededSelection<{ id: string }>({
      projectKey: "proj",
      entityType: "entity",
      seedValue: 42,
      limit: 10,
      method: "filter",
      filterKey: "status",
      filterValues: ["open", "closed"],
    });

    expect(result).toEqual([{ id: "x" }]);

    const [url] = mockFetch.mock.calls[0] as [string];
    expect(url).toContain("datasets/load?");
    expect(url).toContain("project_key=proj");
    expect(url).toContain("entity_type=entity");
    expect(url).toContain("seed_value=42");
    expect(url).toContain("limit=10");
    expect(url).toContain("method=filter");
    expect(url).toContain("filter_key=status");
    // URLSearchParams encodes comma into %2C
    expect(url).toContain("filter_values=open%2Cclosed");
  });

  it("returns [] when backend data is missing", async () => {
    process.env.NEXT_PUBLIC_API_URL = "https://api.example.com";
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({}),
    });
    global.fetch = mockFetch as any;

    const result = await fetchSeededSelection({ projectKey: "proj", entityType: "entity" });
    expect(result).toEqual([]);
  });

  it("throws when resp.ok is false", async () => {
    process.env.NEXT_PUBLIC_API_URL = "https://api.example.com";
    const mockFetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });
    global.fetch = mockFetch as any;

    await expect(
      fetchSeededSelection({ projectKey: "proj", entityType: "entity" }),
    ).rejects.toThrow("Seeded selection request failed: 500");
  });
});
