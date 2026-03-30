// Unit tests for local state helpers (load/persist hidden/applied jobs) in autoconnect.
import {
  loadAppliedJobs,
  loadHiddenPostIds,
  loadHiddenPosts,
  loadNotificationReadState,
  loadSavedPosts,
  NOTIFICATIONS_STATE_EVENT,
  persistAppliedJobs,
  persistHiddenPostIds,
  persistHiddenPosts,
  persistNotificationReadState,
  persistSavedPosts,
} from "../../../src/library/localState";

describe("library/localState", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("loadSavedPosts returns [] when missing, invalid, or non-array", () => {
    expect(loadSavedPosts()).toEqual([]);

    localStorage.setItem("web9_saved_posts", "{bad json");
    expect(loadSavedPosts()).toEqual([]);

    localStorage.setItem("web9_saved_posts", JSON.stringify({ not: "array" }));
    expect(loadSavedPosts()).toEqual([]);
  });

  it("persistSavedPosts writes and loadSavedPosts reads back", () => {
    const posts = [
      {
        id: "p1",
        user: {
          username: "u",
          name: "Name",
          avatar: "a",
          bio: "b",
          title: "t",
        },
        content: "c",
        timestamp: "now",
        likes: 0,
        liked: false,
        comments: [],
      },
    ];

    persistSavedPosts(posts as any);
    const loaded = loadSavedPosts();
    expect(loaded).toEqual(posts);
  });

  it("loadHiddenPostIds filters only string ids", () => {
    localStorage.setItem(
      "web9_hidden_posts",
      JSON.stringify(["a", 123, "b", null]),
    );
    expect(loadHiddenPostIds()).toEqual(new Set(["a", "b"]));
  });

  it("loadHiddenPostIds returns empty Set on invalid JSON", () => {
    localStorage.setItem("web9_hidden_posts", "{bad");
    expect(loadHiddenPostIds()).toEqual(new Set());
  });

  it("persistHiddenPostIds stores ids as JSON array", () => {
    const ids = new Set<string>(["x", "y"]);
    persistHiddenPostIds(ids);
    const raw = localStorage.getItem("web9_hidden_posts");
    expect(JSON.parse(raw || "[]")).toEqual(["x", "y"]);
  });

  it("loadHiddenPosts returns [] when missing or invalid", () => {
    expect(loadHiddenPosts()).toEqual([]);
    localStorage.setItem("web9_hidden_posts_data", "{bad json");
    expect(loadHiddenPosts()).toEqual([]);
  });

  it("persistHiddenPosts writes and loadHiddenPosts reads back", () => {
    const posts = [
      {
        id: "p2",
        user: {
          username: "u2",
          name: "Name2",
          avatar: "a2",
          bio: "b2",
          title: "t2",
        },
        content: "c2",
        timestamp: "now2",
        likes: 1,
        liked: true,
        comments: [],
      },
    ];

    persistHiddenPosts(posts as any);
    expect(loadHiddenPosts()).toEqual(posts);
  });

  it("loadAppliedJobs returns {} for missing/invalid/object mismatch", () => {
    expect(loadAppliedJobs()).toEqual({});

    // Arrays are typeof "object", so the current implementation returns them as-is.
    // If we want to force the fallback path, we need a non-object (e.g. number/string).
    localStorage.setItem("web9_applied_jobs", "123");
    expect(loadAppliedJobs()).toEqual({});

    localStorage.setItem("web9_applied_jobs", '"hello"');
    expect(loadAppliedJobs()).toEqual({});

    localStorage.setItem("web9_applied_jobs", "{bad json");
    expect(loadAppliedJobs()).toEqual({});
  });

  it("persistAppliedJobs writes and loadAppliedJobs reads back", () => {
    const applied = {
      j1: {
        job: {
          id: "j1",
          title: "Title",
          company: "Co",
          location: "Loc",
          logo: "logo",
        },
        appliedAt: "2026-01-01",
      },
    };

    persistAppliedJobs(applied as any);
    expect(loadAppliedJobs()).toEqual(applied);
  });

  it("loadNotificationReadState returns {} when missing, invalid, or non-object", () => {
    expect(loadNotificationReadState()).toEqual({});
    localStorage.setItem("web9_notification_read_state", "{bad");
    expect(loadNotificationReadState()).toEqual({});
    localStorage.setItem("web9_notification_read_state", "42");
    expect(loadNotificationReadState()).toEqual({});
  });

  it("persistNotificationReadState writes, reads back, and dispatches event", () => {
    const spy = jest.fn();
    window.addEventListener(NOTIFICATIONS_STATE_EVENT, spy);
    persistNotificationReadState({ n1: true, n2: false });
    expect(loadNotificationReadState()).toEqual({ n1: true, n2: false });
    expect(spy).toHaveBeenCalled();
    window.removeEventListener(NOTIFICATIONS_STATE_EVENT, spy);
  });
});
