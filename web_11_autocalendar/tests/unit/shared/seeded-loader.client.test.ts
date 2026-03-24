// Unit tests for seeded-loader (client) in autocalendar.
import { fetchSeededSelection } from "../../../src/shared/seeded-loader";

describe("shared/seeded-loader (client)", () => {
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

  it("uses NEXT_PUBLIC_API_URL when it is non-local", async () => {
    process.env.NEXT_PUBLIC_API_URL = "https://api.example.com";

    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: [{ id: "1" }] }),
    });
    global.fetch = mockFetch;

    const result = await fetchSeededSelection<{ id: string }>({
      projectKey: "proj",
      entityType: "entity",
    });

    expect(result).toEqual([{ id: "1" }]);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url] = mockFetch.mock.calls[0] as [string];
    expect(url).toContain("https://api.example.com/datasets/load?");
  });

  it("falls back to origin/api when envUrl is local and origin is non-local", async () => {
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:1234";

    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: [] }),
    });
    global.fetch = mockFetch;

    await fetchSeededSelection({
      projectKey: "proj",
      entityType: "entity",
      seedValue: 2,
      limit: 5,
    });

    const [url] = mockFetch.mock.calls[0] as [string];
    expect(url).toContain(`${window.location.origin}/api/datasets/load?`);
  });

  it("adds filterKey/filterValues and encodes filter_values", async () => {
    process.env.NEXT_PUBLIC_API_URL = "https://api.example.com";

    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: [] }),
    });
    global.fetch = mockFetch;

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

  it("returns [] when json.data is missing", async () => {
    process.env.NEXT_PUBLIC_API_URL = "https://api.example.com";

    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({}),
    });
    global.fetch = mockFetch;

    const result = await fetchSeededSelection({
      projectKey: "proj",
      entityType: "entity",
    });
    expect(result).toEqual([]);
  });

  it("throws when resp.ok is false", async () => {
    process.env.NEXT_PUBLIC_API_URL = "https://api.example.com";

    const mockFetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });
    global.fetch = mockFetch;

    await expect(
      fetchSeededSelection({ projectKey: "proj", entityType: "entity" }),
    ).rejects.toThrow("Seeded selection request failed: 500");
  });
});
