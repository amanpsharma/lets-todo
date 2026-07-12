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

function playNotificationSound() {
  try {
    const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();

    // Play a pleasant two-tone chime
    const playTone = (freq: number, startTime: number, duration: number) => {
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime + startTime);
      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime + startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + startTime + duration);
      oscillator.start(audioCtx.currentTime + startTime);
      oscillator.stop(audioCtx.currentTime + startTime + duration);
    };

    playTone(880, 0, 0.15);
    playTone(1174, 0.12, 0.2);
  } catch {
    // Audio not available
  }
}

function showBrowserNotification(title: string, body: string, link?: string) {
  if (
    typeof window === "undefined" ||
    !("Notification" in window) ||
    Notification.permission !== "granted"
  ) {
    return;
  }

  const notification = new Notification(title, {
    body,
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-192x192.png",
    tag: `taskflow-${Date.now()}`,
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
  const prevChatsRef = useRef<number | null>(null);
  const prevSharedRef = useRef<number | null>(null);

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

      // Only notify if counts increased AFTER first load (not on app open)
      if (prevChatsRef.current !== null && prevSharedRef.current !== null) {
        if (newChats > prevChatsRef.current) {
          playNotificationSound();
          showBrowserNotification(
            "New message",
            `You have ${newChats - prevChatsRef.current} new message${newChats - prevChatsRef.current > 1 ? "s" : ""}`,
            "/dashboard/chat"
          );
        }
        if (newShared > prevSharedRef.current) {
          playNotificationSound();
          showBrowserNotification(
            "Task shared with you",
            `You have ${newShared - prevSharedRef.current} new shared task${newShared - prevSharedRef.current > 1 ? "s" : ""}`,
            "/dashboard/shared"
          );
        }
      }

      prevChatsRef.current = newChats;
      prevSharedRef.current = newShared;

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
