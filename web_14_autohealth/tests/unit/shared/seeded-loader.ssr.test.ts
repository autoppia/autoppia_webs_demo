/** @jest-environment node */
// Server-side coverage tests for seeded-loader (window-less).
import { fetchSeededSelection } from "../../../src/shared/seeded-loader";

describe("seeded-loader (SSR)", () => {
  const originalEnv = process.env;
  const originalFetch = global.fetch;

  afterEach(() => {
    process.env = originalEnv;
    global.fetch = originalFetch;
    jest.resetAllMocks();
  });

  it("getApiBaseUrl: returns API_URL/NEXT_PUBLIC_API_URL on server", () => {
    process.env = { ...originalEnv, NEXT_PUBLIC_API_URL: "https://api.example.com" };

    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: [] }),
    });
    global.fetch = mockFetch as any;

    return fetchSeededSelection({ projectKey: "proj", entityType: "entity" }).then(() => {
      const [url] = mockFetch.mock.calls[0] as [string];
      expect(url).toContain("https://api.example.com/datasets/load?");
    });
  });

  it("getApiBaseUrl: returns default http://app:8090 when env missing on server", () => {
    process.env = { ...originalEnv };
    delete process.env.API_URL;
    delete process.env.NEXT_PUBLIC_API_URL;

    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: [] }),
    });
    global.fetch = mockFetch as any;

    return fetchSeededSelection({ projectKey: "proj", entityType: "entity" }).then(() => {
      const [url] = mockFetch.mock.calls[0] as [string];
      expect(url).toContain("http://app:8090/datasets/load?");
    });
  });

  it("fetchSeededSelection: uses SSR baseUrl", async () => {
    process.env = { ...originalEnv, NEXT_PUBLIC_API_URL: "https://api.example.com" };

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
  });
});
