// Unit tests for seeded-loader (fetchSeededSelection) including filters and errors.
import { fetchSeededSelection } from "../../../src/shared/seeded-loader";

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

  it("uses envUrl when NEXT_PUBLIC_API_URL is non-local", async () => {
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
    const [url] = mockFetch.mock.calls[0] as [string];
    expect(url).toContain("https://api.example.com/datasets/load?");
  });

  it("uses origin/api when envUrl is local and origin is non-local", async () => {
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

  it("adds filterKey and filterValues when provided", async () => {
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

  it("throws when resp.ok is false (uses resp.text in error)", async () => {
    process.env.NEXT_PUBLIC_API_URL = "https://api.example.com";

    const mockFetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => "Internal error",
    });
    global.fetch = mockFetch;

    await expect(
      fetchSeededSelection({ projectKey: "proj", entityType: "entity" }),
    ).rejects.toThrow("Internal error");
  });

  it("throws network error when fetch rejects with TypeError('Failed to fetch')", async () => {
    const typeErr = new TypeError("Failed to fetch");
    (typeErr as any).name = "TypeError";

    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    global.fetch = jest.fn().mockRejectedValue(typeErr);

    await expect(
      fetchSeededSelection({
        projectKey: "proj",
        entityType: "entity",
      }),
    ).rejects.toThrow(/Network error: Server at/);

    consoleSpy.mockRestore();
  });
});
