// Unit tests for EVENT_TYPES and logEvent in automail.
import { EVENT_TYPES, logEvent } from "../../../src/library/events";

describe("EVENT_TYPES", () => {
  it("exposes all expected event constants", () => {
    expect(EVENT_TYPES.VIEW_EMAIL).toBe("VIEW_EMAIL");
    expect(EVENT_TYPES.MARK_AS_SPAM).toBe("MARK_AS_SPAM");
    expect(EVENT_TYPES.MARK_AS_UNREAD).toBe("MARK_AS_UNREAD");
    expect(EVENT_TYPES.DELETE_EMAIL).toBe("DELETE_EMAIL");
    expect(EVENT_TYPES.ARCHIVE_EMAIL).toBe("ARCHIVE_EMAIL");
    expect(EVENT_TYPES.STAR_AN_EMAIL).toBe("STAR_AN_EMAIL");
    expect(EVENT_TYPES.MARK_EMAIL_AS_IMPORTANT).toBe(
      "MARK_EMAIL_AS_IMPORTANT",
    );
    expect(EVENT_TYPES.ADD_LABEL).toBe("ADD_LABEL");
    expect(EVENT_TYPES.CREATE_LABEL).toBe("CREATE_LABEL");
    expect(EVENT_TYPES.SEND_EMAIL).toBe("SEND_EMAIL");
    expect(EVENT_TYPES.EMAIL_SAVE_AS_DRAFT).toBe("EMAIL_SAVE_AS_DRAFT");
    expect(EVENT_TYPES.EDIT_DRAFT_EMAIL).toBe("EDIT_DRAFT_EMAIL");
    expect(EVENT_TYPES.REPLY_EMAIL).toBe("REPLY_EMAIL");
    expect(EVENT_TYPES.FORWARD_EMAIL).toBe("FORWARD_EMAIL");
    expect(EVENT_TYPES.CLEAR_SELECTION).toBe("CLEAR_SELECTION");
    expect(EVENT_TYPES.THEME_CHANGED).toBe("THEME_CHANGED");
    expect(EVENT_TYPES.SEARCH_EMAIL).toBe("SEARCH_EMAIL");
    expect(EVENT_TYPES.EMAILS_NEXT_PAGE).toBe("EMAILS_NEXT_PAGE");
    expect(EVENT_TYPES.EMAILS_PREV_PAGE).toBe("EMAILS_PREV_PAGE");
    expect(EVENT_TYPES.VIEW_TEMPLATES).toBe("VIEW_TEMPLATES");
    expect(EVENT_TYPES.TEMPLATE_SELECTED).toBe("TEMPLATE_SELECTED");
    expect(EVENT_TYPES.TEMPLATE_BODY_EDITED).toBe("TEMPLATE_BODY_EDITED");
    expect(EVENT_TYPES.TEMPLATE_SENT).toBe("TEMPLATE_SENT");
    expect(EVENT_TYPES.TEMPLATE_SAVED_DRAFT).toBe("TEMPLATE_SAVED_DRAFT");
    expect(EVENT_TYPES.TEMPLATE_CANCELED).toBe("TEMPLATE_CANCELED");
  });
});

describe("logEvent basic behavior", () => {
  it("logs and calls fetch when running in browser", () => {
    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    const fetchMock = jest.fn().mockResolvedValue({ ok: true } as any);
    global.fetch = fetchMock;

    logEvent(EVENT_TYPES.SEND_EMAIL, { subject: "Hello" });

    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    consoleLogSpy.mockRestore();
  });
});
