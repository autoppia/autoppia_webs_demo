import type { Job, Post, Recommendation, User } from "@/library/dataset";
import type { NotificationReadState } from "@/library/localState";

export type NotificationType =
  | "mention"
  | "comment"
  | "connection"
  | "job"
  | "recommendation";

export type NotificationFilter =
  | "all"
  | "unread"
  | "mentions"
  | "comments"
  | "jobs"
  | "network";

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  timestamp: string;
  href: string;
  actionLabel: string;
  actorName: string;
  actorAvatar?: string;
}

interface NotificationSource {
  users: User[];
  posts: Post[];
  jobs: Job[];
  recommendations: Recommendation[];
}

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function trimText(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1).trimEnd()}…`;
}

function getCurrentUser(users: User[]): User | undefined {
  return users[2] || users[0];
}

export function buildNotifications({
  users,
  posts,
  jobs,
  recommendations,
}: NotificationSource): NotificationItem[] {
  const currentUser = getCurrentUser(users);
  if (!currentUser) return [];

  const peers = users.filter((user) => user.username !== currentUser.username);
  const notifications: NotificationItem[] = [];

  if (posts[0]) {
    notifications.push({
      id: `mention-${posts[0].id}`,
      type: "mention",
      title: `${posts[0].user.name} mentioned you in a post`,
      body: trimText(posts[0].content, 120),
      timestamp: hoursAgo(1),
      href: "/",
      actionLabel: "View feed",
      actorName: posts[0].user.name,
      actorAvatar: posts[0].user.avatar,
    });
  }

  if (posts[1]) {
    notifications.push({
      id: `comment-${posts[1].id}`,
      type: "comment",
      title: `${posts[1].user.name} replied to your thread`,
      body: `New reply on: ${trimText(posts[1].content, 92)}`,
      timestamp: hoursAgo(3),
      href: "/",
      actionLabel: "Open thread",
      actorName: posts[1].user.name,
      actorAvatar: posts[1].user.avatar,
    });
  }

  if (peers[0]) {
    notifications.push({
      id: `connection-${peers[0].username}`,
      type: "connection",
      title: `${peers[0].name} wants to connect`,
      body: `${peers[0].title} is active in your network.`,
      timestamp: hoursAgo(5),
      href: `/profile/${peers[0].username}`,
      actionLabel: "View profile",
      actorName: peers[0].name,
      actorAvatar: peers[0].avatar,
    });
  }

  if (jobs[0]) {
    notifications.push({
      id: `job-${jobs[0].id}`,
      type: "job",
      title: `New job match: ${jobs[0].title}`,
      body: `${jobs[0].company} • ${jobs[0].location}${jobs[0].salary ? ` • ${jobs[0].salary}` : ""}`,
      timestamp: hoursAgo(8),
      href: `/jobs/${jobs[0].id}`,
      actionLabel: "Review job",
      actorName: jobs[0].company,
    });
  }

  if (recommendations[0]) {
    notifications.push({
      id: `recommendation-${recommendations[0].id}`,
      type: "recommendation",
      title: `New recommendation for ${currentUser.name}`,
      body: trimText(recommendations[0].reason, 110),
      timestamp: hoursAgo(11),
      href: "/recommendations",
      actionLabel: "See recommendation",
      actorName: recommendations[0].title,
      actorAvatar: recommendations[0].image,
    });
  }

  if (jobs[1]) {
    notifications.push({
      id: `job-followup-${jobs[1].id}`,
      type: "job",
      title: `${jobs[1].company} is hiring now`,
      body: trimText(
        `${jobs[1].title}${jobs[1].remote ? " • Remote-friendly" : ""}`,
        108
      ),
      timestamp: hoursAgo(18),
      href: `/jobs/${jobs[1].id}`,
      actionLabel: "Open role",
      actorName: jobs[1].company,
    });
  }

  if (peers[1]) {
    notifications.push({
      id: `network-${peers[1].username}`,
      type: "connection",
      title: `${peers[1].name} viewed your profile`,
      body: `${peers[1].title} may be a strong networking match.`,
      timestamp: hoursAgo(24),
      href: `/profile/${peers[1].username}`,
      actionLabel: "Follow up",
      actorName: peers[1].name,
      actorAvatar: peers[1].avatar,
    });
  }

  return notifications.sort(
    (left, right) =>
      new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime()
  );
}

export function filterNotifications(
  notifications: NotificationItem[],
  filter: NotificationFilter,
  readState: NotificationReadState
): NotificationItem[] {
  return notifications.filter((notification) => {
    const isRead = !!readState[notification.id];

    if (filter === "unread") return !isRead;
    if (filter === "mentions") return notification.type === "mention";
    if (filter === "comments") return notification.type === "comment";
    if (filter === "jobs") return notification.type === "job";
    if (filter === "network") {
      return (
        notification.type === "connection" ||
        notification.type === "recommendation"
      );
    }

    return true;
  });
}

export function countUnreadNotifications(
  notifications: NotificationItem[],
  readState: NotificationReadState
): number {
  return notifications.reduce(
    (count, notification) => count + (readState[notification.id] ? 0 : 1),
    0
  );
}
