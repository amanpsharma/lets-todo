"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface NotificationCounts {
  unreadChats: number;
  pendingShared: number;
}

function requestNotificationPermission() {
  if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
}

function showBrowserNotification(title: string, body: string, link?: string) {
  if (
    typeof window === "undefined" ||
    !("Notification" in window) ||
    Notification.permission !== "granted" ||
    document.hasFocus()
  ) {
    return;
  }

  const notification = new Notification(title, {
    body,
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-192x192.png",
    tag: "taskflow-notification",
  });

  notification.onclick = () => {
    window.focus();
    if (link) window.location.href = link;
    notification.close();
  };
}

export function useNotifications() {
  const [counts, setCounts] = useState<NotificationCounts>({
    unreadChats: 0,
    pendingShared: 0,
  });
  const prevChatsRef = useRef(0);
  const prevSharedRef = useRef(0);
  const initializedRef = useRef(false);

  const fetchCounts = useCallback(async () => {
    try {
      const [chatRes, sharedRes] = await Promise.all([
        fetch("/api/chat/unread"),
        fetch("/api/notifications/shared-count"),
      ]);

      const chatData = chatRes.ok ? await chatRes.json() : { total: 0 };
      const sharedData = sharedRes.ok ? await sharedRes.json() : { count: 0 };

      const newChats = chatData.total || 0;
      const newShared = sharedData.count || 0;

      // Show browser notification if new messages arrived (not on first load)
      if (initializedRef.current) {
        if (newChats > prevChatsRef.current) {
          showBrowserNotification(
            "New message",
            `You have ${newChats - prevChatsRef.current} new message${newChats - prevChatsRef.current > 1 ? "s" : ""}`,
            "/dashboard/chat"
          );
        }
        if (newShared > prevSharedRef.current) {
          showBrowserNotification(
            "Task shared with you",
            `You have ${newShared - prevSharedRef.current} new shared task${newShared - prevSharedRef.current > 1 ? "s" : ""}`,
            "/dashboard/shared"
          );
        }
      }

      prevChatsRef.current = newChats;
      prevSharedRef.current = newShared;
      initializedRef.current = true;

      setCounts({
        unreadChats: newChats,
        pendingShared: newShared,
      });
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    requestNotificationPermission();
    fetchCounts();
    const interval = setInterval(fetchCounts, 10000);
    return () => clearInterval(interval);
  }, [fetchCounts]);

  return { ...counts, refresh: fetchCounts };
}
