/** @jest-environment node */
// Server-side coverage tests for seeded-loader (no window).
import { fetchSeededSelection } from "../../../src/shared/seeded-loader";

describe("shared/seeded-loader (SSR)", () => {
  const originalFetch = global.fetch;
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, API_URL: "http://api.server" };
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env = originalEnv;
    jest.resetAllMocks();
  });

  it("uses API_URL when window is undefined", async () => {
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
    expect(url).toContain("http://api.server/datasets/load?");
  });

  it("falls back to default app URL when no env urls exist", async () => {
    delete process.env.API_URL;
    delete process.env.NEXT_PUBLIC_API_URL;

    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: [] }),
    });
    global.fetch = mockFetch;

    await fetchSeededSelection({ projectKey: "proj", entityType: "entity" });
    const [url] = mockFetch.mock.calls[0] as [string];
    expect(url).toContain("http://app:8090/datasets/load?");
  });
});
