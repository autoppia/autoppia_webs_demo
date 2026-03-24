import { fetchSeededSelection } from "../../../src/shared/seeded-loader";

describe("shared/seeded-loader", () => {
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
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: [{ id: "1" }] }),
    });

    const result = await fetchSeededSelection<{ id: string }>({
      projectKey: "proj",
      entityType: "entity",
    });

    expect(result).toEqual([{ id: "1" }]);
    const [url] = (global.fetch as jest.Mock).mock.calls[0] as [string];
    expect(url).toContain("https://api.example.com/datasets/load?");
  });

  it("falls back to origin/api when env url is missing", async () => {
    delete process.env.NEXT_PUBLIC_API_URL;
    delete process.env.API_URL;

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: [] }),
    });

    await fetchSeededSelection({
      projectKey: "proj",
      entityType: "entity",
      seedValue: 2,
      limit: 5,
    });

    const [url] = (global.fetch as jest.Mock).mock.calls[0] as [string];
    expect(url).toContain(`${window.location.origin}/api/datasets/load?`);
  });

  it("throws API error when json.detail is present and json.data is missing", async () => {
    process.env.NEXT_PUBLIC_API_URL = "https://api.example.com";

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ detail: "Bad request" }),
    });

    await expect(
      fetchSeededSelection({ projectKey: "proj", entityType: "entity" }),
    ).rejects.toThrow("API error: Bad request");
  });

  it("throws when json.data is missing or not an array", async () => {
    process.env.NEXT_PUBLIC_API_URL = "https://api.example.com";

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: {} }),
    });

    await expect(
      fetchSeededSelection({ projectKey: "proj", entityType: "entity" }),
    ).rejects.toThrow("No data returned from API for entity");
  });

  it("handles AbortError and produces timeout message", async () => {
    process.env.NEXT_PUBLIC_API_URL = "https://api.example.com";

    const abortErr = new Error("aborted");
    (abortErr as any).name = "AbortError";

    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    global.fetch = jest.fn().mockRejectedValue(abortErr);

    await expect(
      fetchSeededSelection({ projectKey: "proj", entityType: "entity" }),
    ).rejects.toThrow(
      "API request timed out for entity. The backend service may be unavailable.",
    );

    consoleErrorSpy.mockRestore();
  });
});
