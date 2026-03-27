// Unit tests for autozone event logger (EVENT_TYPES + logEvent).
import { EVENT_TYPES, logEvent } from "@/events";

describe("events logger (autozone)", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    window.localStorage.clear();
    (globalThis as any).fetch = jest.fn().mockResolvedValue({ ok: true });
  });

  test("sends event with default ids when no localStorage values", () => {
    const fetchMock = (globalThis as any).fetch as jest.Mock;

    logEvent(EVENT_TYPES.ADD_TO_CART, { id: "prod-1" });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/log-event");
    expect((options as RequestInit).method).toBe("POST");

    const payload = JSON.parse((options as RequestInit).body as string);
    expect(payload.web_agent_id).toBe("1");
    expect(payload.validator_id).toBe("1");
    expect(payload.data.event_name).toBe(EVENT_TYPES.ADD_TO_CART);
    expect(payload.data.data).toEqual({ id: "prod-1" });
  });

  test("uses web_agent_id, validator_id and user from localStorage", () => {
    window.localStorage.setItem("user", "42");
    window.localStorage.setItem("web_agent_id", "agent-3");
    window.localStorage.setItem("validator_id", "val-5");

    const fetchMock = (globalThis as any).fetch as jest.Mock;

    logEvent(EVENT_TYPES.VIEW_CART, { source: "header" }, { "X-Source": "test" });

    const [, options] = fetchMock.mock.calls[0];
    const headers = (options as RequestInit).headers as Record<string, string>;
    expect(headers["X-WebAgent-Id"]).toBe("agent-3");
    expect(headers["X-Validator-Id"]).toBe("val-5");
    expect(headers["X-Source"]).toBe("test");

    const payload = JSON.parse((options as RequestInit).body as string);
    expect(payload.data.user_id).toBe("42");
  });

  test("includes new commerce event type keys", () => {
    expect(EVENT_TYPES.LOGIN).toBe("LOGIN");
    expect(EVENT_TYPES.REGISTER).toBe("REGISTER");
    expect(EVENT_TYPES.SHARE_COMPLETED).toBe("SHARE_COMPLETED");
    expect(EVENT_TYPES.REVIEW_CREATED).toBe("REVIEW_CREATED");
    expect(EVENT_TYPES.REVIEW_UPDATED).toBe("REVIEW_UPDATED");
    expect(EVENT_TYPES.REVIEW_DELETED).toBe("REVIEW_DELETED");
  });

  test("when user is the string 'null', sends user_id null", () => {
    window.localStorage.setItem("user", "null");
    const fetchMock = (globalThis as any).fetch as jest.Mock;

    logEvent(EVENT_TYPES.VIEW_WISHLIST);

    const [, options] = fetchMock.mock.calls[0];
    const payload = JSON.parse((options as RequestInit).body as string);
    expect(payload.data.user_id).toBeNull();
  });
});
