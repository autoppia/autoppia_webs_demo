// Unit tests for EVENT_TYPES and logEvent payload/header logic (client).
import { EVENT_TYPES, logEvent } from "../../../src/library/events";

describe("events (client)", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    // Ensure a clean localStorage for each test.
    localStorage.clear();
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({}),
    });

    // Default IDs for payload (cover fallbacks too).
    localStorage.setItem("user", "null");
    localStorage.setItem("web_agent_id", "null");
    localStorage.setItem("validator_id", "null");
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it("exports expected event type values", () => {
    expect(EVENT_TYPES.ADD_TASK).toBe("AUTOLIST_ADD_TASK_CLICKED");
    expect(EVENT_TYPES.ADD_TEAM_CLICKED).toBe("AUTOLIST_ADD_TEAM_CLICKED");
    expect(EVENT_TYPES.CHAT_OPEN).toBe("AUTOLIST_CHAT_OPEN");
  });

  it("builds backend payload and resolves agent IDs", () => {
    logEvent(
      EVENT_TYPES.ADD_TASK,
      { task_id: "t-1", priority: "high" },
      { "X-Custom": "abc" },
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
    expect(headers["X-Custom"]).toBe("abc");

    const body = init?.body as string;
    const parsed = JSON.parse(body);

    expect(parsed.web_agent_id).toBe("1");
    expect(parsed.validator_id).toBe("1");
    expect(parsed.web_url).toBe(window.location.origin);
    expect(parsed.data.event_name).toBe(EVENT_TYPES.ADD_TASK);
    expect(parsed.data.user_id).toBeNull();
    expect(parsed.data.data).toEqual({ task_id: "t-1", priority: "high" });
  });
});
