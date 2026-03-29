/** @jest-environment node */
// Server-side coverage tests for seeded-loader (window-less).
import { fetchSeededSelection, getApiBaseUrl } from "../../../src/shared/seeded-loader";

describe("seeded-loader (SSR)", () => {
  const originalEnv = process.env;
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env = { ...originalEnv };
    global.fetch = originalFetch;
  });

  afterEach(() => {
    process.env = originalEnv;
    global.fetch = originalFetch;
    jest.resetAllMocks();
  });

  it("getApiBaseUrl uses API_URL/NEXT_PUBLIC_API_URL on server", () => {
    delete process.env.API_URL;
    process.env.NEXT_PUBLIC_API_URL = "https://api.example.com";
    expect(getApiBaseUrl()).toBe("https://api.example.com");
  });

  it("getApiBaseUrl falls back to default when envUrl missing", () => {
    delete process.env.API_URL;
    delete process.env.NEXT_PUBLIC_API_URL;
    expect(getApiBaseUrl()).toBe("http://app:8090");
  });

  it("fetchSeededSelection uses SSR baseUrl and defaults", async () => {
    process.env.NEXT_PUBLIC_API_URL = "https://api.example.com";

    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: [{ id: "ssr" }] }),
    });
    global.fetch = mockFetch as any;

    const result = await fetchSeededSelection<{ id: string }>({
      projectKey: "proj",
      entityType: "entity",
    });

    expect(result).toEqual([{ id: "ssr" }]);
    const [url] = mockFetch.mock.calls[0] as [string];
    expect(url).toContain("https://api.example.com/datasets/load?");
    expect(url).toContain("seed_value=1");
    expect(url).toContain("limit=50");
    expect(url).toContain("method=select");
  });
});
