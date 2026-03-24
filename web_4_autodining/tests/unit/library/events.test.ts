// Unit tests for EVENT_TYPES and logEvent for autodining.
import { EVENT_TYPES, logEvent } from "@/library/events";

describe("logEvent (autodining)", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    window.localStorage.clear();
    (globalThis as any).fetch = jest.fn().mockResolvedValue({ ok: true });
  });

  test("sends event with default ids when no localStorage values", () => {
    const fetchMock = (globalThis as any).fetch as jest.Mock;

    logEvent(EVENT_TYPES.SEARCH_RESTAURANT, { query: "sushi" });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/log-event");
    expect((options as RequestInit).method).toBe("POST");

    const payload = JSON.parse((options as RequestInit).body as string);
    expect(payload.web_agent_id).toBe("1");
    expect(payload.validator_id).toBe("1");
    expect(payload.data.event_name).toBe(EVENT_TYPES.SEARCH_RESTAURANT);
    expect(payload.data.data).toEqual({ query: "sushi" });
  });

  test("uses web_agent_id, validator_id and user from localStorage and merges extra headers", () => {
    window.localStorage.setItem("user", "42");
    window.localStorage.setItem("web_agent_id", "agent-4");
    window.localStorage.setItem("validator_id", "val-9");

    const fetchMock = (globalThis as any).fetch as jest.Mock;

    logEvent(EVENT_TYPES.BOOK_RESTAURANT, { restaurantId: "rest-1" }, { "X-Channel": "web" });

    const [, options] = fetchMock.mock.calls[0];
    const headers = (options as RequestInit).headers as Record<string, string>;
    expect(headers["X-WebAgent-Id"]).toBe("agent-4");
    expect(headers["X-Validator-Id"]).toBe("val-9");
    expect(headers["X-Channel"]).toBe("web");

    const payload = JSON.parse((options as RequestInit).body as string);
    expect(payload.data.user_id).toBe("42");
  });

  test("when user is the string 'null', sends user_id null", () => {
    window.localStorage.setItem("user", "null");
    const fetchMock = (globalThis as any).fetch as jest.Mock;

    logEvent(EVENT_TYPES.VIEW_RESTAURANT, { restaurantId: "rest-2" });

    const [, options] = fetchMock.mock.calls[0];
    const payload = JSON.parse((options as RequestInit).body as string);
    expect(payload.data.user_id).toBeNull();
  });
});
