// Unit tests for seeded-loader (fetchSeededSelection).
import { fetchSeededSelection } from "../../../src/shared/seeded-loader";

describe("fetchSeededSelection", () => {
  const originalFetch = global.fetch;
  const originalWindow = global.window;
  const originalEnv = process.env;

  beforeEach(() => {
    // jsdom window with origin
    global.window = { location: { origin: "http://localhost:3000" } } as any;
    process.env = { ...originalEnv, NEXT_PUBLIC_API_URL: "http://api.local" };
  });

  afterEach(() => {
    global.fetch = originalFetch;
    global.window = originalWindow;
    process.env = originalEnv;
    jest.resetAllMocks();
  });

  it("builds URL with defaults and parses successful response", async () => {
    const mockData = [{ id: 1 }, { id: 2 }];
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockData }),
    });

    const result = await fetchSeededSelection<{ id: number }>({
      projectKey: "proj",
      entityType: "entity",
    });

    expect(result).toEqual(mockData);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url] = (global.fetch as jest.Mock).mock.calls[0] as [string];
    expect(url).toContain("http://api.local/datasets/load?");
    expect(url).toContain("project_key=proj");
    expect(url).toContain("entity_type=entity");
    expect(url).toContain("seed_value=1");
    expect(url).toContain("limit=50");
    expect(url).toContain("method=select");
  });

  it("passes through advanced options like seed, limit and filters", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [] }),
    });

    await fetchSeededSelection({
      projectKey: "proj",
      entityType: "entity",
      seedValue: 42,
      limit: 10,
      method: "filter",
      filterKey: "status",
      filterValues: ["active", "pending"],
    });

    const [url] = (global.fetch as jest.Mock).mock.calls[0] as [string];
    expect(url).toContain("seed_value=42");
    expect(url).toContain("limit=10");
    expect(url).toContain("method=filter");
    expect(url).toContain("filter_key=status");
    expect(url).toContain("filter_values=active%2Cpending");
  });

  it("throws on non-ok responses and logs error body", async () => {
    const errorResponse = {
      ok: false,
      status: 500,
      text: async () => "Internal error",
    };
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    global.fetch = jest.fn().mockResolvedValue(errorResponse);

    await expect(
      fetchSeededSelection({ projectKey: "proj", entityType: "entity" }),
    ).rejects.toThrow("Seeded selection request failed: 500");

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "[fetchSeededSelection] request failed",
      expect.objectContaining({ status: 500, body: "Internal error" }),
    );

    consoleErrorSpy.mockRestore();
  });
});
