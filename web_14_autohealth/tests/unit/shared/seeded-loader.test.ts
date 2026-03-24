// Unit tests for seeded-loader (fetchSeededSelection) in autohealth.
import { fetchSeededSelection } from "../../../src/shared/seeded-loader";

describe("seeded-loader (client)", () => {
  const originalFetch = global.fetch;
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    localStorage.clear();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env = originalEnv;
    jest.resetAllMocks();
  });

  it("getApiBaseUrl (via fetchSeededSelection): uses non-local NEXT_PUBLIC_API_URL", async () => {
    process.env.NEXT_PUBLIC_API_URL = "https://api.example.com";
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: [] }),
    });
    global.fetch = mockFetch as any;

    await fetchSeededSelection({ projectKey: "proj", entityType: "entity" });

    const [url] = mockFetch.mock.calls[0] as [string];
    expect(url).toContain("https://api.example.com/datasets/load?");
  });

  it("getApiBaseUrl (via fetchSeededSelection): uses origin/api when envUrl is local", async () => {
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:1234";
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: [] }),
    });
    global.fetch = mockFetch as any;

    await fetchSeededSelection({ projectKey: "proj", entityType: "entity" });

    const [url] = mockFetch.mock.calls[0] as [string];
    expect(url).toContain(`${window.location.origin}/api/datasets/load?`);
  });

  it("getApiBaseUrl (via fetchSeededSelection): uses origin/api when envUrl is missing", async () => {
    delete process.env.NEXT_PUBLIC_API_URL;
    delete process.env.API_URL;
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: [] }),
    });
    global.fetch = mockFetch as any;

    await fetchSeededSelection({ projectKey: "proj", entityType: "entity" });

    const [url] = mockFetch.mock.calls[0] as [string];
    expect(url).toContain(`${window.location.origin}/api/datasets/load?`);
  });

  it("fetchSeededSelection: uses defaults seed/limit/method", async () => {
    process.env.NEXT_PUBLIC_API_URL = "https://api.example.com";
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

  it("fetchSeededSelection: adds filterKey/filterValues", async () => {
    process.env.NEXT_PUBLIC_API_URL = "https://api.example.com";
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: [] }),
    });
    global.fetch = mockFetch as any;

    await fetchSeededSelection({
      projectKey: "proj",
      entityType: "entity",
      seedValue: 42,
      limit: 10,
      method: "filter",
      filterKey: "status",
      filterValues: ["open", "closed"],
    });

    const [url] = mockFetch.mock.calls[0] as [string];
    expect(url).toContain("seed_value=42");
    expect(url).toContain("limit=10");
    expect(url).toContain("method=filter");
    expect(url).toContain("filter_key=status");
    expect(url).toContain("filter_values=open%2Cclosed");
  });

  it("fetchSeededSelection: returns [] when json.data missing", async () => {
    process.env.NEXT_PUBLIC_API_URL = "https://api.example.com";
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({}),
    });
    global.fetch = mockFetch as any;

    await expect(
      fetchSeededSelection({ projectKey: "proj", entityType: "entity" }),
    ).resolves.toEqual([]);
  });

  it("fetchSeededSelection: throws when resp.ok is false", async () => {
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
