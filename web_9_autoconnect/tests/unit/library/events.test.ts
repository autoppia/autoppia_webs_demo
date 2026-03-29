// Unit tests for EVENT_TYPES and logEvent in autoconnect.
import { EVENT_TYPES, logEvent } from "../../../src/library/events";

describe("library/events", () => {
  it("exposes expected event constants", () => {
    expect(EVENT_TYPES.POST_STATUS).toBe("POST_STATUS");
    expect(EVENT_TYPES.LIKE_POST).toBe("LIKE_POST");
    expect(EVENT_TYPES.SEARCH_USERS).toBe("SEARCH_USERS");
    expect(EVENT_TYPES.SEARCH_JOBS).toBe("SEARCH_JOBS");
    expect(EVENT_TYPES.CONNECT_WITH_USER).toBe("CONNECT_WITH_USER");
    expect(EVENT_TYPES.VIEW_JOB).toBe("VIEW_JOB");
    expect(EVENT_TYPES.CANCEL_APPLICATION).toBe("CANCEL_APPLICATION");
    expect(EVENT_TYPES.DELETE_COMMENT).toBe("DELETE_COMMENT");
  });

  it("builds payload and calls fetch with resolved IDs", () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();

    // reset localStorage
    localStorage.clear();
    localStorage.setItem("user", "null");
    localStorage.setItem("web_agent_id", "5");
    localStorage.setItem("validator_id", "9");

    const fetchMock = jest.fn().mockResolvedValue({ ok: true } as any);
    global.fetch = fetchMock;

    logEvent(EVENT_TYPES.APPLY_FOR_JOB, { jobId: "j1" }, { "X-Custom": "abc" });

    expect(consoleSpy).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, options] = (fetchMock.mock.calls[0] as [string, RequestInit]);
    expect(url).toBe("/api/log-event");

    const headers = (options.headers || {}) as Record<string, string>;
    expect(headers["Content-Type"]).toBe("application/json");
    expect(headers["X-WebAgent-Id"]).toBe("5");
    expect(headers["X-Validator-Id"]).toBe("9");
    expect(headers["X-Custom"]).toBe("abc");

    const parsedBody = JSON.parse((options.body as string) || "{}");
    expect(parsedBody).toMatchObject({
      web_agent_id: "5",
      validator_id: "9",
      data: expect.objectContaining({
        event_name: EVENT_TYPES.APPLY_FOR_JOB,
        user_id: null,
        data: { jobId: "j1" },
      }),
    });

    consoleSpy.mockRestore();
  });
});
