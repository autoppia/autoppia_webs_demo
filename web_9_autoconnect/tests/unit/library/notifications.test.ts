import type { Job, Post, Recommendation, User } from "@/library/dataset";
import {
  buildNotifications,
  countUnreadNotifications,
  filterNotifications,
  type NotificationItem,
} from "@/library/notifications";
import type { NotificationReadState } from "@/library/localState";

function mockUser(partial: Partial<User> & Pick<User, "username" | "name">): User {
  return {
    avatar: "/a.png",
    bio: "",
    title: "Engineer",
    ...partial,
  };
}

function mockPost(id: string, user: User, content: string): Post {
  return {
    id,
    user,
    content,
    timestamp: new Date().toISOString(),
    likes: 0,
    liked: false,
    comments: [],
  };
}

function mockJob(id: string, overrides: Partial<Job> = {}): Job {
  return {
    id,
    title: "Engineer",
    company: "Acme",
    location: "Remote",
    logo: "/l.png",
    ...overrides,
  };
}

function mockRecommendation(id: string, reason: string): Recommendation {
  return {
    id,
    type: "job",
    title: "Rec title",
    description: "Desc",
    reason,
    relevanceScore: 0.9,
    category: "jobs",
    image: "/r.png",
  };
}

describe("library/notifications", () => {
  const alice = mockUser({ username: "alice", name: "Alice" });
  const bob = mockUser({ username: "bob", name: "Bob" });
  const carol = mockUser({ username: "carol", name: "Carol" });

  test("buildNotifications returns empty when no current user resolved", () => {
    expect(buildNotifications({ users: [], posts: [], jobs: [], recommendations: [] })).toEqual([]);
  });

  test("buildNotifications builds items from posts, jobs, peers, recommendations", () => {
    const users: User[] = [alice, bob, carol];
    const p0 = mockPost("p1", alice, "Hey @carol check this out with a very long content " + "x".repeat(200));
    const p1 = mockPost("p2", bob, "Reply thread body " + "y".repeat(120));
    const j0 = mockJob("j1", { salary: "$100k" });
    const j1 = mockJob("j2", { remote: true, title: "Staff engineer" });
    const r0 = mockRecommendation("r1", "Great fit because " + "z".repeat(150));

    const list = buildNotifications({
      users,
      posts: [p0, p1],
      jobs: [j0, j1],
      recommendations: [r0],
    });

    expect(list.length).toBeGreaterThanOrEqual(6);
    const types = new Set(list.map((n) => n.type));
    expect(types.has("mention")).toBe(true);
    expect(types.has("comment")).toBe(true);
    expect(types.has("connection")).toBe(true);
    expect(types.has("job")).toBe(true);
    expect(types.has("recommendation")).toBe(true);

    const sorted = [...list].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    expect(list.map((n) => n.id)).toEqual(sorted.map((n) => n.id));
  });

  test("filterNotifications respects filter and read state", () => {
    const items: NotificationItem[] = [
      {
        id: "n1",
        type: "mention",
        title: "m",
        body: "b",
        timestamp: new Date().toISOString(),
        href: "/",
        actionLabel: "a",
        actorName: "x",
      },
      {
        id: "n2",
        type: "job",
        title: "j",
        body: "b",
        timestamp: new Date().toISOString(),
        href: "/j",
        actionLabel: "a",
        actorName: "co",
      },
    ];
    const read: NotificationReadState = { n1: true };

    expect(filterNotifications(items, "all", read).length).toBe(2);
    expect(filterNotifications(items, "unread", read).map((n) => n.id)).toEqual(["n2"]);
    expect(filterNotifications(items, "mentions", read).map((n) => n.id)).toEqual(["n1"]);
    expect(filterNotifications(items, "jobs", read).map((n) => n.id)).toEqual(["n2"]);
    expect(filterNotifications(items, "comments", read).length).toBe(0);

    const mixed: NotificationItem[] = [
      ...items,
      {
        id: "n3",
        type: "connection",
        title: "c",
        body: "b",
        timestamp: new Date().toISOString(),
        href: "/p",
        actionLabel: "a",
        actorName: "z",
      },
    ];
    expect(filterNotifications(mixed, "network", {}).map((n) => n.id)).toEqual(["n3"]);
  });

  test("countUnreadNotifications", () => {
    const items: NotificationItem[] = [
      {
        id: "a",
        type: "mention",
        title: "t",
        body: "b",
        timestamp: new Date().toISOString(),
        href: "/",
        actionLabel: "x",
        actorName: "y",
      },
      {
        id: "b",
        type: "comment",
        title: "t",
        body: "b",
        timestamp: new Date().toISOString(),
        href: "/",
        actionLabel: "x",
        actorName: "y",
      },
    ];
    expect(countUnreadNotifications(items, {})).toBe(2);
    expect(countUnreadNotifications(items, { a: true })).toBe(1);
    expect(countUnreadNotifications(items, { a: true, b: true })).toBe(0);
  });
});
