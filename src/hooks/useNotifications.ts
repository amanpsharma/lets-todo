"use client";

import { useState, useEffect, useCallback } from "react";

interface NotificationCounts {
  unreadChats: number;
  pendingShared: number;
}

export function useNotifications() {
  const [counts, setCounts] = useState<NotificationCounts>({
    unreadChats: 0,
    pendingShared: 0,
  });

  const fetchCounts = useCallback(async () => {
    try {
      const [chatRes, sharedRes] = await Promise.all([
        fetch("/api/chat/unread"),
        fetch("/api/notifications/shared-count"),
      ]);

      const chatData = chatRes.ok ? await chatRes.json() : { total: 0 };
      const sharedData = sharedRes.ok ? await sharedRes.json() : { count: 0 };

      setCounts({
        unreadChats: chatData.total || 0,
        pendingShared: sharedData.count || 0,
      });
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    fetchCounts();
    const interval = setInterval(fetchCounts, 10000);
    return () => clearInterval(interval);
  }, [fetchCounts]);

  return { ...counts, refresh: fetchCounts };
}
