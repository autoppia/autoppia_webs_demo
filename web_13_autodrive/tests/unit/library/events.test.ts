// Unit tests for EVENT_TYPES and logEvent (autodrive, client).
import { EVENT_TYPES, logEvent } from "../../../src/library/event";

describe("events (client)", () => {
  const originalFetch = global.fetch;
  const originalConsoleLog = console.log;

  beforeEach(() => {
    localStorage.clear();
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({}),
    });

    // Exercise user_id null branch.
    localStorage.setItem("user", "null");
    localStorage.setItem("web_agent_id", "null");
    localStorage.setItem("validator_id", "null");
  });

  afterEach(() => {
    global.fetch = originalFetch;
    console.log = originalConsoleLog;
    jest.restoreAllMocks();
  });

  it("exports expected event type values", () => {
    expect(EVENT_TYPES.ENTER_LOCATION).toBe("ENTER_LOCATION");
    expect(EVENT_TYPES.RESERVE_RIDE).toBe("RESERVE_RIDE");
  });

  it("builds backend payload and resolves agent IDs", () => {
    logEvent(
      EVENT_TYPES.ENTER_DESTINATION,
      { destination_id: "d-1" },
      { "X-Test": "abc" },
    );

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url, init] = (global.fetch as jest.Mock).mock.calls[0] as [
      string,
      RequestInit,
    ];

    expect(url).toBe("/api/log-event");
    expect(init?.method).toBe("POST");

    const headers = init?.headers as Record<string, string>;
    expect(headers["Content-Type"]).toBe("application/json");
    expect(headers["X-WebAgent-Id"]).toBe("1");
    expect(headers["X-Validator-Id"]).toBe("1");
    expect(headers["X-Test"]).toBe("abc");

    const parsed = JSON.parse(init?.body as string);
    expect(parsed.web_url).toBe(window.location.origin);
    expect(parsed.web_agent_id).toBe("1");
    expect(parsed.validator_id).toBe("1");
    expect(parsed.data.event_name).toBe(EVENT_TYPES.ENTER_DESTINATION);
    expect(parsed.data.user_id).toBeNull();
    expect(parsed.data.data).toEqual({ destination_id: "d-1" });
    expect(typeof parsed.data.timestamp).toBe("string");
  });

  it("uses provided user_id and agent IDs when not 'null'", () => {
    localStorage.setItem("user", "u-1");
    localStorage.setItem("web_agent_id", "w-1");
    localStorage.setItem("validator_id", "v-1");

    logEvent(
      EVENT_TYPES.SEARCH_DESTINATION,
      { query: "q-1" },
      { "X-Another": "y" },
    );

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [, init] = (global.fetch as jest.Mock).mock.calls[0] as [
      string,
      RequestInit,
    ];

    const headers = init?.headers as Record<string, string>;
    expect(headers["X-WebAgent-Id"]).toBe("w-1");
    expect(headers["X-Validator-Id"]).toBe("v-1");

    const parsed = JSON.parse(init?.body as string);
    expect(parsed.web_agent_id).toBe("w-1");
    expect(parsed.validator_id).toBe("v-1");
    expect(parsed.data.user_id).toBe("u-1");
    expect(parsed.data.event_name).toBe(EVENT_TYPES.SEARCH_DESTINATION);
    expect(parsed.data.data).toEqual({ query: "q-1" });
  });
});
