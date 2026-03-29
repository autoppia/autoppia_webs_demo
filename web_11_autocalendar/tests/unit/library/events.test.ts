// Unit tests for EVENT_TYPES and logEvent in autocalendar.
import { EVENT_TYPES, logEvent } from "../../../src/library/events";

describe("library/events", () => {
  it("exposes expected event constants", () => {
    expect(EVENT_TYPES.SELECT_TODAY).toBe("SELECT_TODAY");
  });

  it("logEvent constructs payload and calls fetch", () => {
    localStorage.clear();
    localStorage.setItem("user", "null");
    localStorage.setItem("web_agent_id", "null");
    localStorage.setItem("validator_id", "9");

    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();

    const fetchMock = jest.fn().mockResolvedValue({ ok: true } as any);
    global.fetch = fetchMock;

    logEvent(EVENT_TYPES.ADD_EVENT, { label: "Meeting" }, { "X-Custom": "v" });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/log-event");

    const headers = (options.headers || {}) as Record<string, string>;
    expect(headers["X-WebAgent-Id"]).toBe("1");
    expect(headers["X-Validator-Id"]).toBe("9");
    expect(headers["X-Custom"]).toBe("v");

    const parsedBody = JSON.parse((options.body as string) || "{}");
    expect(parsedBody).toMatchObject({
      web_agent_id: "1",
      validator_id: "9",
      data: expect.objectContaining({
        event_name: EVENT_TYPES.ADD_EVENT,
        user_id: null,
        data: { label: "Meeting" },
      }),
    });

    consoleLogSpy.mockRestore();
  });
});
