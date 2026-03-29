// Unit tests for EVENT_TYPES and logEvent in autocrm.
import { EVENT_TYPES, logEvent } from "../../../src/library/events";

describe("EVENT_TYPES", () => {
  it("exposes all expected event constants", () => {
    expect(EVENT_TYPES.ADD_NEW_MATTER).toBe("ADD_NEW_MATTER");
    expect(EVENT_TYPES.DELETE_MATTER).toBe("DELETE_MATTER");
    expect(EVENT_TYPES.ARCHIVE_MATTER).toBe("ARCHIVE_MATTER");
    expect(EVENT_TYPES.VIEW_MATTER_DETAILS).toBe("VIEW_MATTER_DETAILS");
    expect(EVENT_TYPES.SEARCH_CLIENT).toBe("SEARCH_CLIENT");
    expect(EVENT_TYPES.VIEW_CLIENT_DETAILS).toBe("VIEW_CLIENT_DETAILS");
    expect(EVENT_TYPES.DOCUMENT_UPLOADED).toBe("DOCUMENT_UPLOADED");
    expect(EVENT_TYPES.DOCUMENT_DELETED).toBe("DOCUMENT_DELETED");
    expect(EVENT_TYPES.DOCUMENT_RENAMED).toBe("DOCUMENT_RENAMED");
    expect(EVENT_TYPES.BILLING_SEARCH).toBe("BILLING_SEARCH");
    expect(EVENT_TYPES.ADD_CLIENT).toBe("ADD_CLIENT");
    expect(EVENT_TYPES.DELETE_CLIENT).toBe("DELETE_CLIENT");
    expect(EVENT_TYPES.FILTER_CLIENTS).toBe("FILTER_CLIENTS");
    expect(EVENT_TYPES.HELP_VIEWED).toBe("HELP_VIEWED");
    expect(EVENT_TYPES.NEW_LOG_ADDED).toBe("NEW_LOG_ADDED");
    expect(EVENT_TYPES.LOG_DELETE).toBe("LOG_DELETE");
    expect(EVENT_TYPES.LOG_EDITED).toBe("LOG_EDITED");
    expect(EVENT_TYPES.NEW_CALENDAR_EVENT_ADDED).toBe(
      "NEW_CALENDAR_EVENT_ADDED",
    );
    expect(EVENT_TYPES.CHANGE_USER_NAME).toBe("CHANGE_USER_NAME");
    expect(EVENT_TYPES.VIEW_PENDING_EVENTS).toBe("VIEW_PENDING_EVENTS");
    expect(EVENT_TYPES.SEARCH_MATTER).toBe("SEARCH_MATTER");
    expect(EVENT_TYPES.FILTER_MATTER_STATUS).toBe("FILTER_MATTER_STATUS");
    expect(EVENT_TYPES.SORT_MATTER_BY_CREATED_AT).toBe(
      "SORT_MATTER_BY_CREATED_AT",
    );
    expect(EVENT_TYPES.UPDATE_MATTER).toBe("UPDATE_MATTER");
  });
});

describe("logEvent basic behavior", () => {
  it("logs and calls fetch when running in browser", () => {
    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    const fetchMock = jest.fn().mockResolvedValue({ ok: true } as any);
    global.fetch = fetchMock;

    logEvent(EVENT_TYPES.ADD_CLIENT, { name: "Alice" });

    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    consoleLogSpy.mockRestore();
  });
});
