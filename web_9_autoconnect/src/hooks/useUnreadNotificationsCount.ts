"use client";

import { useEffect, useState } from "react";
import { dynamicDataProvider } from "@/dynamic/v2";
import {
  NOTIFICATIONS_STATE_EVENT,
  loadNotificationReadState,
} from "@/library/localState";
import {
  buildNotifications,
  countUnreadNotifications,
} from "@/library/notifications";

function getUnreadCount(): number {
  const notifications = buildNotifications({
    users: dynamicDataProvider.getUsers(),
    posts: dynamicDataProvider.getPosts(),
    jobs: dynamicDataProvider.getJobs(),
    recommendations: dynamicDataProvider.getRecommendations(),
  });

  return countUnreadNotifications(
    notifications,
    loadNotificationReadState()
  );
}

export function useUnreadNotificationsCount(): number {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const refreshCount = () => {
      setUnreadCount(getUnreadCount());
    };

    refreshCount();

    const unsubscribeUsers = dynamicDataProvider.subscribeUsers(refreshCount);
    const unsubscribePosts = dynamicDataProvider.subscribePosts(refreshCount);
    const unsubscribeJobs = dynamicDataProvider.subscribeJobs(refreshCount);
    const unsubscribeRecommendations =
      dynamicDataProvider.subscribeRecommendations(refreshCount);

    window.addEventListener(
      NOTIFICATIONS_STATE_EVENT,
      refreshCount as EventListener
    );
    window.addEventListener("storage", refreshCount);

    return () => {
      unsubscribeUsers();
      unsubscribePosts();
      unsubscribeJobs();
      unsubscribeRecommendations();
      window.removeEventListener(
        NOTIFICATIONS_STATE_EVENT,
        refreshCount as EventListener
      );
      window.removeEventListener("storage", refreshCount);
    };
  }, []);

  return unreadCount;
}
