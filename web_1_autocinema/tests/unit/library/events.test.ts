// Unit tests for EVENT_TYPES and logEvent payload/header logic.
import { EVENT_TYPES, jsonStringifyForLogEvent, logEvent } from "@/library/events";

describe("logEvent", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    window.localStorage.clear();
    (global as unknown as { fetch: jest.Mock }).fetch = jest.fn().mockResolvedValue({ ok: true });
  });

  test("sends event with defaults when ids are missing", async () => {
    const fetchMock = (global as unknown as { fetch: jest.Mock }).fetch;
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => undefined);

    logEvent(EVENT_TYPES.LOGIN, { source: "test" });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/log-event");
    expect((options as RequestInit).method).toBe("POST");
    expect((options as RequestInit).headers).toMatchObject({
      "Content-Type": "application/json",
      "X-WebAgent-Id": "1",
      "X-Validator-Id": "1",
    });

    const payload = JSON.parse((options as RequestInit).body as string);
    expect(payload.web_agent_id).toBe("1");
    expect(payload.validator_id).toBe("1");
    expect(payload.data.event_name).toBe(EVENT_TYPES.LOGIN);
    expect(payload.data.data).toEqual({ source: "test" });
    expect(typeof payload.data.timestamp).toBe("string");
    expect(consoleSpy).toHaveBeenCalled();
  });

  test("uses localStorage ids and merges extra headers", () => {
    window.localStorage.setItem("web_agent_id", "agent-7");
    window.localStorage.setItem("validator_id", "val-9");
    window.localStorage.setItem("user", "42");

    const fetchMock = (global as unknown as { fetch: jest.Mock }).fetch;

    logEvent(EVENT_TYPES.ADD_COMMENT, { movieId: 10 }, { "X-Test": "yes" });

    const [, options] = fetchMock.mock.calls[0];
    expect((options as RequestInit).headers).toMatchObject({
      "X-WebAgent-Id": "agent-7",
      "X-Validator-Id": "val-9",
      "X-Test": "yes",
    });

    const payload = JSON.parse((options as RequestInit).body as string);
    expect(payload.web_agent_id).toBe("agent-7");
    expect(payload.validator_id).toBe("val-9");
    expect(payload.data.user_id).toBe("42");
  });

  test("when user is the string null, it sends null user_id", () => {
    window.localStorage.setItem("user", "null");
    const fetchMock = (global as unknown as { fetch: jest.Mock }).fetch;

    logEvent(EVENT_TYPES.LOGOUT);

    const [, options] = fetchMock.mock.calls[0];
    const payload = JSON.parse((options as RequestInit).body as string);
    expect(payload.data.user_id).toBeNull();
  });

  test("ADD_FILM body uses N.0 for whole-number rating in JSON text", () => {
    const fetchMock = (global as unknown as { fetch: jest.Mock }).fetch;
    jest.spyOn(console, "log").mockImplementation(() => undefined);

    logEvent(EVENT_TYPES.ADD_FILM, {
      id: 1,
      name: "X",
      director: null,
      year: 2020,
      genres: [],
      rating: 5,
      duration: 100,
      cast: null,
    });

    const [, options] = fetchMock.mock.calls[0];
    const raw = (options as RequestInit).body as string;
    expect(raw).toMatch(/"rating"\s*:\s*5\.0\b/);
    expect(JSON.parse(raw).data.data.rating).toBe(5);
  });

  test("ADD_FILM body keeps fractional rating unchanged", () => {
    const fetchMock = (global as unknown as { fetch: jest.Mock }).fetch;
    jest.spyOn(console, "log").mockImplementation(() => undefined);

    logEvent(EVENT_TYPES.ADD_FILM, {
      id: 1,
      name: "X",
      director: null,
      year: 2020,
      genres: [],
      rating: 8.5,
      duration: 100,
      cast: null,
    });

    const [, options] = fetchMock.mock.calls[0];
    const raw = (options as RequestInit).body as string;
    expect(raw).toMatch(/"rating"\s*:\s*8\.5\b/);
    expect(raw).not.toMatch(/"rating"\s*:\s*8\.50/);
  });
});

describe("jsonStringifyForLogEvent", () => {
  test("rewrites top-level and nested whole-number rating keys", () => {
    const s = jsonStringifyForLogEvent({
      data: {
        rating: 5,
        previous_values: { rating: 10, name: "a" },
        movie: { id: 1 },
      },
    });
    expect(s).toContain('"rating":5.0');
    expect(s).toContain('"rating":10.0');
  });

  test("does not alter rating with a fractional part", () => {
    const s = jsonStringifyForLogEvent({ rating: 8.5 });
    expect(s).toBe('{"rating":8.5}');
  });
});
