// Unit tests for EVENT_TYPES and logEvent in autowork.
import { EVENT_TYPES, logEvent } from "../../../src/library/events";

describe("library/events", () => {
  it("exposes expected event constants", () => {
    expect(EVENT_TYPES.POST_A_JOB).toBe("POST_A_JOB");
    expect(EVENT_TYPES.SEARCH_SKILL).toBe("SEARCH_SKILL");
    expect(EVENT_TYPES.ADD_SKILL).toBe("ADD_SKILL");
    expect(EVENT_TYPES.HIRE_BTN_CLICKED).toBe("HIRE_BTN_CLICKED");
    expect(EVENT_TYPES.NAVBAR_JOBS_CLICK).toBe("NAVBAR_JOBS_CLICK");
  });

  it("logEvent resolves user_id null and fallback agent IDs", () => {
    localStorage.clear();
    localStorage.setItem("user", "null");
    localStorage.setItem("web_agent_id", "null");
    localStorage.setItem("validator_id", "null");

    const fetchMock = jest.fn().mockResolvedValue({ ok: true } as any);
    global.fetch = fetchMock;
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();

    logEvent(EVENT_TYPES.SEARCH_SKILL, { q: "brakes" }, { "X-Custom": "1" });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = (options.headers as Record<string, string>) || {};
    expect(headers["X-WebAgent-Id"]).toBe("1");
    expect(headers["X-Validator-Id"]).toBe("1");
    expect(headers["X-Custom"]).toBe("1");

    const parsedBody = JSON.parse(options.body as string);
    expect(parsedBody).toMatchObject({
      web_agent_id: "1",
      validator_id: "1",
      data: expect.objectContaining({
        event_name: EVENT_TYPES.SEARCH_SKILL,
        user_id: null,
        data: { q: "brakes" },
      }),
    });

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("logEvent uses concrete agent IDs and user value", () => {
    localStorage.clear();
    localStorage.setItem("user", "user-123");
    localStorage.setItem("web_agent_id", "5");
    localStorage.setItem("validator_id", "9");

    const fetchMock = jest.fn().mockResolvedValue({ ok: true } as any);
    global.fetch = fetchMock;

    logEvent(EVENT_TYPES.BOOK_A_CONSULTATION, { expert: "alex" });

    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    const parsedBody = JSON.parse(options.body as string);

    expect(parsedBody).toMatchObject({
      web_agent_id: "5",
      validator_id: "9",
      data: expect.objectContaining({
        event_name: EVENT_TYPES.BOOK_A_CONSULTATION,
        user_id: "user-123",
      }),
    });
  });
});
