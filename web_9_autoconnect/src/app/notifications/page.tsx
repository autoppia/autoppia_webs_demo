"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";
import { DataReadyGate } from "@/components/DataReadyGate";
import { SeedLink } from "@/components/ui/SeedLink";
import { dynamicDataProvider } from "@/dynamic/v2";
import { useDynamicSystem } from "@/dynamic/shared";
import { EVENT_TYPES, logEvent } from "@/library/events";
import {
  loadNotificationReadState,
  persistNotificationReadState,
  type NotificationReadState,
} from "@/library/localState";
import {
  buildNotifications,
  countUnreadNotifications,
  filterNotifications,
  type NotificationFilter,
  type NotificationItem,
} from "@/library/notifications";
import { ID_VARIANTS_MAP } from "@/dynamic/v3";
import { cn } from "@/library/utils";
import type { Job, Post, Recommendation, User } from "@/library/dataset";

const FILTERS: Array<{ key: NotificationFilter; label: string }> = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "mentions", label: "Mentions" },
  { key: "comments", label: "Comments" },
  { key: "jobs", label: "Jobs" },
  { key: "network", label: "Network" },
];

const localTextVariants: Record<string, string[]> = {
  notifications_title: ["Notifications", "Inbox", "Updates"],
  notifications_subtitle: [
    "Track mentions, replies, job matches, and network activity in one place.",
    "Your recent mentions, replies, job matches, and network updates.",
    "A single place for feed activity, networking, and hiring alerts.",
  ],
  notifications_empty: [
    "No notifications in this view right now.",
    "Nothing to review in this filter.",
    "This filter is clear for now.",
  ],
  notifications_empty_cta: [
    "Go back to the feed",
    "Return to home feed",
    "Browse the main feed",
  ],
  notifications_mark_all: [
    "Mark all as read",
    "Clear unread",
    "Read everything",
  ],
};

const localClassVariants: Record<string, string[]> = {
  notification_filter_active: [
    "bg-blue-600 text-white border-blue-600",
    "bg-indigo-600 text-white border-indigo-600",
    "bg-sky-600 text-white border-sky-600",
  ],
  notification_filter_idle: [
    "bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:text-blue-700",
    "bg-white text-gray-700 border-gray-200 hover:border-indigo-300 hover:text-indigo-700",
    "bg-white text-gray-700 border-gray-200 hover:border-sky-300 hover:text-sky-700",
  ],
  notification_action_button: [
    "px-3 py-2 rounded-full text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50",
    "px-3 py-2 rounded-full text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-100",
    "px-3 py-2 rounded-full text-sm font-medium border border-gray-200 text-gray-700 hover:bg-blue-50",
  ],
};

const localIdVariants: Record<string, string[]> = {
  notifications_page_section: [
    "notifications_page_section",
    "notifications_section",
    "alerts_page_section",
  ],
  notifications_header_card: [
    "notifications_header_card",
    "notifications_header",
    "alerts_header_card",
  ],
  notifications_filters: [
    "notifications_filters",
    "notifications_filter_group",
    "alerts_filters",
  ],
  notifications_list: [
    "notifications_list",
    "notifications_feed",
    "alerts_list",
  ],
  notifications_empty_state: [
    "notifications_empty_state",
    "notifications_empty",
    "alerts_empty_state",
  ],
};

const NOTIFICATIONS_PAGE_PATH = "/notifications";

/** Keep analytics payloads bounded (full body can be long). */
function truncateForEvent(text: string, maxChars = 220): string {
  const t = text.trim();
  if (t.length <= maxChars) return t;
  return `${t.slice(0, maxChars - 1).trimEnd()}…`;
}

function buildMarkNotificationReadPayload(
  notification: NotificationItem,
  action: string,
  opts?: Record<string, unknown>
) {
  return {
    notificationId: notification.id,
    type: notification.type,
    action,
    title: notification.title,
    body: truncateForEvent(notification.body),
    actorName: notification.actorName,
    href: notification.href,
    notificationTimestamp: notification.timestamp,
    actionLabel: notification.actionLabel,
    ...opts,
  };
}

function timeAgo(timestamp: string): string {
  const seconds = Math.max(
    0,
    Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000)
  );

  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function getNotificationIcon(notification: NotificationItem): string {
  switch (notification.type) {
    case "mention":
      return "@";
    case "comment":
      return "💬";
    case "connection":
      return "🤝";
    case "job":
      return "💼";
    case "recommendation":
      return "✨";
    default:
      return "•";
  }
}

function NotificationsContent() {
  const dyn = useDynamicSystem();
  const [users, setUsers] = useState<User[]>(() => dynamicDataProvider.getUsers());
  const [posts, setPosts] = useState<Post[]>(() => dynamicDataProvider.getPosts());
  const [jobs, setJobs] = useState<Job[]>(() => dynamicDataProvider.getJobs());
  const [recommendations, setRecommendations] = useState<Recommendation[]>(
    () => dynamicDataProvider.getRecommendations()
  );
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>("all");
  const [readState, setReadState] = useState<NotificationReadState>({});
  const hasLoggedView = useRef(false);

  useEffect(() => {
    setReadState(loadNotificationReadState());
  }, []);

  useEffect(() => {
    const unsubscribeUsers = dynamicDataProvider.subscribeUsers(setUsers);
    const unsubscribePosts = dynamicDataProvider.subscribePosts(setPosts);
    const unsubscribeJobs = dynamicDataProvider.subscribeJobs(setJobs);
    const unsubscribeRecommendations =
      dynamicDataProvider.subscribeRecommendations(setRecommendations);

    return () => {
      unsubscribeUsers();
      unsubscribePosts();
      unsubscribeJobs();
      unsubscribeRecommendations();
    };
  }, []);

  const notifications = useMemo(
    () =>
      buildNotifications({
        users,
        posts,
        jobs,
        recommendations,
      }),
    [users, posts, jobs, recommendations]
  );

  const unreadCount = useMemo(
    () => countUnreadNotifications(notifications, readState),
    [notifications, readState]
  );

  const filteredNotifications = useMemo(
    () => filterNotifications(notifications, activeFilter, readState),
    [notifications, activeFilter, readState]
  );

  useEffect(() => {
    if (hasLoggedView.current || notifications.length === 0) return;
    hasLoggedView.current = true;

    logEvent(EVENT_TYPES.VIEW_NOTIFICATIONS, {
      totalCount: notifications.length,
      unreadCount,
      source: "notifications_page",
    });
  }, [notifications.length, unreadCount]);

  function updateReadState(nextReadState: NotificationReadState): void {
    setReadState(nextReadState);
    persistNotificationReadState(nextReadState);
  }

  function toggleRead(notification: NotificationItem): void {
    const nextReadState = { ...readState };
    const isRead = !!nextReadState[notification.id];

    if (isRead) {
      delete nextReadState[notification.id];
    } else {
      nextReadState[notification.id] = true;
    }

    updateReadState(nextReadState);
    logEvent(
      EVENT_TYPES.MARK_NOTIFICATION_READ,
      buildMarkNotificationReadPayload(
        notification,
        isRead ? "marked_unread" : "marked_read",
        { wasListedAsRead: isRead }
      )
    );
  }

  function markAllAsRead(): void {
    if (notifications.length === 0 || unreadCount === 0) return;

    const nextReadState = notifications.reduce<NotificationReadState>(
      (state, notification) => {
        state[notification.id] = true;
        return state;
      },
      { ...readState }
    );

    updateReadState(nextReadState);
    const previouslyUnreadIds = notifications
      .filter((n) => !readState[n.id])
      .map((n) => n.id);
    logEvent(EVENT_TYPES.MARK_ALL_NOTIFICATIONS_READ, {
      count: unreadCount,
      source: "notifications_page",
      totalCount: notifications.length,
      previouslyUnreadIds,
      previouslyUnreadCount: previouslyUnreadIds.length,
    });
  }

  const renderSidebar = (position: "left" | "right") => {
    if (position === "left") {
      return (
        <aside className="w-[280px] flex-shrink-0 hidden lg:block">
          <LeftSidebar />
        </aside>
      );
    }

    return (
      <aside className="w-[280px] flex-shrink-0 hidden lg:block">
        <RightSidebar />
      </aside>
    );
  };

  return (
    <div className="w-full flex gap-4 justify-center min-h-screen">
      {renderSidebar("left")}
      <main className="w-full max-w-[950px] mx-auto flex-1 px-6 pb-10 md:pb-14">
        <section
          id={dyn.v3.getVariant(
            "notifications_page_section",
            localIdVariants,
            "notifications-page-section"
          )}
          className="space-y-6"
        >
          {dyn.v1.addWrapDecoy(
            "notifications-header-card",
            <div
              id={dyn.v3.getVariant(
                "notifications_header_card",
                localIdVariants,
                "notifications-header-card"
              )}
              className="bg-white rounded-2xl shadow border border-gray-100 p-6"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    <span>Inbox</span>
                    <span className="rounded-full bg-white px-2 py-0.5 text-[11px] text-blue-700">
                      {unreadCount} unread
                    </span>
                  </div>
                  <h1 className="mt-3 text-3xl font-bold text-gray-900">
                    {dyn.v3.getVariant(
                      "notifications_title",
                      localTextVariants,
                      "Notifications"
                    )}
                  </h1>
                  <p className="mt-2 text-sm text-gray-600 max-w-2xl">
                    {dyn.v3.getVariant(
                      "notifications_subtitle",
                      localTextVariants,
                      "Track mentions, replies, job matches, and network activity in one place."
                    )}
                  </p>
                </div>
                <button
                  id={dyn.v3.getVariant(
                    "notifications_mark_all",
                    ID_VARIANTS_MAP,
                    "notifications-mark-all"
                  )}
                  type="button"
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                  className={cn(
                    "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition border",
                    unreadCount === 0
                      ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                      : "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                  )}
                >
                  {dyn.v3.getVariant(
                    "notifications_mark_all",
                    localTextVariants,
                    "Mark all as read"
                  )}
                </button>
              </div>

              <div
                id={dyn.v3.getVariant(
                  "notifications_filters",
                  localIdVariants,
                  "notifications-filters"
                )}
                className="mt-5 flex flex-wrap gap-2"
              >
              {FILTERS.map((filter) => {
                const count = filterNotifications(
                  notifications,
                  filter.key,
                  readState
                ).length;
                const isActive = activeFilter === filter.key;

                return (
                  <button
                    key={filter.key}
                    id={dyn.v3.getVariant(
                      `notifications_filter_${filter.key}`,
                      ID_VARIANTS_MAP,
                      `notifications-filter-${filter.key}`
                    )}
                    type="button"
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm font-medium transition",
                      isActive
                        ? dyn.v3.getVariant(
                            "notification_filter_active",
                            localClassVariants,
                            "bg-blue-600 text-white border-blue-600"
                          )
                        : dyn.v3.getVariant(
                            "notification_filter_idle",
                            localClassVariants,
                            "bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:text-blue-700"
                          )
                    )}
                    onClick={() => {
                      const previousFilter = activeFilter;
                      setActiveFilter(filter.key);
                      logEvent(EVENT_TYPES.FILTER_NOTIFICATIONS, {
                        filter: filter.key,
                        filterLabel: filter.label,
                        count,
                        totalCount: notifications.length,
                        unreadCount,
                        source: "notifications_page",
                        pathname: NOTIFICATIONS_PAGE_PATH,
                        previousFilter,
                      });
                    }}
                  >
                    {filter.label} ({count})
                  </button>
                );
              })}
            </div>
            </div>
          )}

          {filteredNotifications.length === 0 ? (
            <div
              id={dyn.v3.getVariant(
                "notifications_empty_state",
                localIdVariants,
                "notifications-empty-state"
              )}
              className="bg-white rounded-2xl shadow border border-gray-100 p-10 text-center"
            >
              <div className="text-gray-700 font-semibold">
                {dyn.v3.getVariant(
                  "notifications_empty",
                  localTextVariants,
                  "No notifications in this view right now."
                )}
              </div>
              <SeedLink
                href="/"
                className="mt-3 inline-flex text-sm font-medium text-blue-600 hover:underline"
              >
                {dyn.v3.getVariant(
                  "notifications_empty_cta",
                  localTextVariants,
                  "Go back to the feed"
                )}
              </SeedLink>
            </div>
          ) : (
            <div
              id={dyn.v3.getVariant(
                "notifications_list",
                localIdVariants,
                "notifications-list"
              )}
              className="space-y-4"
            >
              {filteredNotifications.map((notification) => {
                const isRead = !!readState[notification.id];
                return dyn.v1.addWrapDecoy(
                  "notification-card",
                  <article
                    key={notification.id}
                    id={dyn.v3.getVariant(
                      `notification_card_${notification.id}`,
                      ID_VARIANTS_MAP,
                      `notification-card-${notification.id}`
                    )}
                    className={cn(
                      "bg-white rounded-2xl shadow border p-5 transition",
                      isRead
                        ? "border-gray-100"
                        : "border-blue-200 shadow-blue-100/50"
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 shrink-0 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center text-lg font-semibold text-gray-700">
                        {notification.actorAvatar ? (
                          <img
                            src={notification.actorAvatar}
                            alt={notification.actorName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span>{getNotificationIcon(notification)}</span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-base font-semibold text-gray-900">
                            {notification.title}
                          </h2>
                          {!isRead && (
                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-blue-700">
                              New
                            </span>
                          )}
                          <span className="text-xs text-gray-400">
                            {timeAgo(notification.timestamp)}
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-gray-600 whitespace-pre-line">
                          {notification.body}
                        </p>

                        <div className="mt-4 flex flex-wrap items-center gap-3">
                          <SeedLink
                            id={dyn.v3.getVariant(
                              `notification_open_${notification.id}`,
                              ID_VARIANTS_MAP,
                              `notification-open-${notification.id}`
                            )}
                            href={notification.href}
                            className="inline-flex items-center rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                            onClick={() => {
                              if (!isRead) {
                                const nextReadState = {
                                  ...readState,
                                  [notification.id]: true,
                                };
                                updateReadState(nextReadState);
                              }
                              logEvent(
                                EVENT_TYPES.MARK_NOTIFICATION_READ,
                                buildMarkNotificationReadPayload(
                                  notification,
                                  "opened_from_notification",
                                  {
                                    wasListedAsRead: isRead,
                                    openedFrom: "notification_cta",
                                  }
                                )
                              );
                            }}
                          >
                            {notification.actionLabel}
                          </SeedLink>

                          <button
                            id={dyn.v3.getVariant(
                              `notification_toggle_${notification.id}`,
                              ID_VARIANTS_MAP,
                              `notification-toggle-${notification.id}`
                            )}
                            type="button"
                            className={cn(
                              "px-3 py-2 rounded-full text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50",
                              dyn.v3.getVariant(
                                "notification_action_button",
                                localClassVariants,
                                ""
                              )
                            )}
                            onClick={() => toggleRead(notification)}
                          >
                            {isRead ? "Mark as unread" : "Mark as read"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>,
                  notification.id
                );
              })}
            </div>
          )}
        </section>
      </main>
      {renderSidebar("right")}
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <DataReadyGate>
      <NotificationsContent />
    </DataReadyGate>
  );
}
