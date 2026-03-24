// Unit tests for seeded-loader (fetchSeededSelection) in autoconnect.
import { fetchSeededSelection } from "../../../src/shared/seeded-loader";

describe("seeded-loader", () => {
  const originalFetch = global.fetch;
  const originalEnv = process.env;
  const originalWindow = global.window;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_API_URL: "http://api.local",
    };
    global.window = {
      location: { origin: "http://localhost:3000", search: "" },
    } as any;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env = originalEnv;
    global.window = originalWindow;
    jest.resetAllMocks();
  });

  it("builds URL with defaults and returns json.data", async () => {
    const mockData = [{ id: "1" }, { id: "2" }];
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: mockData }),
    });

    const result = await fetchSeededSelection<{ id: string }>({
      projectKey: "proj",
      entityType: "entity",
    });

    expect(result).toEqual(mockData);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url] = (global.fetch as jest.Mock).mock.calls[0] as [string, any];
    expect(url).toContain("http://api.local/datasets/load?");
    expect(url).toContain("project_key=proj");
    expect(url).toContain("entity_type=entity");
    expect(url).toContain("seed_value=1");
    expect(url).toContain("limit=50");
    expect(url).toContain("method=select");
  });

  it("adds filterKey and filterValues (encoded)", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: [] }),
    });

    await fetchSeededSelection({
      projectKey: "proj",
      entityType: "entity",
      seedValue: 42,
      limit: 10,
      method: "filter",
      filterKey: "status",
      filterValues: ["open", "closed"],
    });

    const [url] = (global.fetch as jest.Mock).mock.calls[0] as [string, any];
    expect(url).toContain("seed_value=42");
    expect(url).toContain("limit=10");
    expect(url).toContain("method=filter");
    expect(url).toContain("filter_key=status");
    expect(url).toContain("filter_values=open%2Cclosed");
  });

  it("throws when response is not ok", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ data: [] }),
    });

    await expect(
      fetchSeededSelection({ projectKey: "proj", entityType: "entity" }),
    ).rejects.toThrow("Seeded selection request failed: 500");

    consoleSpy.mockRestore();
  });
});
