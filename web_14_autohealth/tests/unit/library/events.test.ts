// Unit tests for EVENT_TYPES and logEvent (autohealth, client).
import { EVENT_TYPES, logEvent } from "../../../src/library/events";

describe("events (client)", () => {
  const originalFetch = global.fetch;
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;

  beforeEach(() => {
    localStorage.clear();
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});

    global.fetch = jest.fn();

    localStorage.setItem("user", "null");
    localStorage.setItem("web_agent_id", "null");
    localStorage.setItem("validator_id", "null");
  });

  afterEach(() => {
    global.fetch = originalFetch;
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    jest.restoreAllMocks();
  });

  it("logEvent: sends correct payload and resolves when ok", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
    });

    await logEvent(
      EVENT_TYPES.OPEN_APPOINTMENT_FORM,
      { appointment_id: "a-1" },
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
    expect(parsed.web_agent_id).toBe("1");
    expect(parsed.validator_id).toBe("1");
    expect(parsed.web_url).toBe(window.location.origin);
    expect(parsed.data.event_name).toBe(EVENT_TYPES.OPEN_APPOINTMENT_FORM);
    expect(parsed.data.user_id).toBeNull();
    expect(parsed.data.data).toEqual({ appointment_id: "a-1" });
  });

  it("logEvent: rejects when response not ok", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 400,
    });

    await expect(
      logEvent(EVENT_TYPES.SEARCH_APPOINTMENT, { q: "x" }),
    ).rejects.toThrow("log-event failed: 400");
  });

  it("logEvent: rejects when fetch fails (and logs error)", async () => {
    const err = new Error("fetch failed");
    (global.fetch as jest.Mock).mockRejectedValue(err);

    await expect(
      logEvent(EVENT_TYPES.SEARCH_DOCTORS, { specialty: "s" }),
    ).rejects.toThrow("fetch failed");
    expect(console.error).toHaveBeenCalled();
  });

  it("logEvent: uses provided user_id and agent IDs when not 'null'", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, status: 200 });

    localStorage.setItem("user", "u-1");
    localStorage.setItem("web_agent_id", "w-1");
    localStorage.setItem("validator_id", "v-1");

    await logEvent(EVENT_TYPES.VIEW_DOCTOR_PROFILE, { doctor_id: "dr-1" });

    const [, init] = (global.fetch as jest.Mock).mock.calls[0] as [
      string,
      RequestInit,
    ];
    const parsed = JSON.parse(init?.body as string);
    expect(parsed.web_agent_id).toBe("w-1");
    expect(parsed.validator_id).toBe("v-1");
    expect(parsed.data.user_id).toBe("u-1");
    expect(parsed.data.event_name).toBe(EVENT_TYPES.VIEW_DOCTOR_PROFILE);
  });
});
