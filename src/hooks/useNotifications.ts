'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  icon: string; // prayer name or 'system'
  timestamp: number;
  read: boolean;
}

interface UseNotificationsProps {
  prayerTimes: Record<string, string>; // e.g. { Fajr: "05:12", Dhuhr: "12:30", ... }
  todayLogs: Record<string, string>;  // e.g. { Fajr: "Prayed", Dhuhr: "Missed", ... }
}

const STORAGE_KEY = 'sajda_notifications';
const PERM_KEY = 'sajda_notifications_enabled';
const MAX_NOTIFICATIONS = 50;

function loadNotifications(): AppNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveNotifications(notifs: AppNotification[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifs.slice(0, MAX_NOTIFICATIONS)));
  } catch {}
}

export function useNotifications({ prayerTimes, todayLogs }: UseNotificationsProps) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationToast, setNotificationToast] = useState<AppNotification | null>(null);

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const todayLogsRef = useRef(todayLogs);
  todayLogsRef.current = todayLogs;

  // Load on mount
  useEffect(() => {
    setNotifications(loadNotifications());
    const enabled = localStorage.getItem(PERM_KEY) === 'true';
    setNotificationsEnabled(enabled);
  }, []);

  // Persist notifications
  useEffect(() => {
    saveNotifications(notifications);
  }, [notifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  // ─── Add notification ───
  const addNotification = useCallback((title: string, body: string, icon: string) => {
    const notif: AppNotification = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      title,
      body,
      icon,
      timestamp: Date.now(),
      read: false,
    };

    setNotifications(prev => [notif, ...prev].slice(0, MAX_NOTIFICATIONS));

    // Show in-app toast
    setNotificationToast(notif);
    setTimeout(() => setNotificationToast(null), 10000);

    // Send PWA / browser notification
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      try {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'SHOW_NOTIFICATION',
            title,
            body,
            icon: '/icons/icon-192x192.svg',
            tag: notif.id,
          });
        } else {
          new Notification(title, {
            body,
            icon: '/icons/icon-192x192.svg',
            tag: notif.id,
          });
        }
      } catch {
        // Fallback: we already have in-app toast
      }
    }

    return notif;
  }, []);

  // ─── Request permission ───
  const requestPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') return false;
    const result = await Notification.requestPermission();
    const granted = result === 'granted';
    setNotificationsEnabled(granted);
    localStorage.setItem(PERM_KEY, String(granted));
    return granted;
  }, []);

  // ─── Enable notifications ───
  const enableNotifications = useCallback(async () => {
    const granted = await requestPermission();
    if (granted) {
      setNotificationsEnabled(true);
      localStorage.setItem(PERM_KEY, 'true');
      setTimeout(() => addNotification("Notifications Enabled", "You will now receive prayer reminders. Make sure to keep the tab open or app installed.", "system"), 500);
    } else {
      setTimeout(() => addNotification("Permission Denied", "System alerts are blocked. Please unblock in your browser to receive push reminders.", "system"), 500);
    }
    return granted;
  }, [requestPermission, addNotification]);

  // ─── Disable notifications ───
  const disableNotifications = useCallback(() => {
    setNotificationsEnabled(false);
    localStorage.setItem(PERM_KEY, 'false');
    // Clear scheduled timers
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  // ─── Mark all read ───
  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  // ─── Clear all ───
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // ─── Dismiss single ───
  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);


  // ─── Schedule prayer time notifications ───
  useEffect(() => {
    if (!notificationsEnabled) return;
    if (!prayerTimes || Object.keys(prayerTimes).length === 0) return;

    // Clear old timers
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    const now = new Date();
    const PRAYERS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

    PRAYERS.forEach(prayer => {
      const raw = prayerTimes[prayer];
      if (!raw) return;

      const [hh, mm] = raw.split(':').map(Number);
      const prayerDate = new Date();
      prayerDate.setHours(hh, mm, 0, 0);

      const diff = prayerDate.getTime() - now.getTime();
      if (diff > 0) {
        // Schedule notification at prayer time
        const timer = setTimeout(() => {
          addNotification(
            `🕌 ${prayer} Time`,
            `It's time for ${prayer} prayer. May Allah accept your salah.`,
            prayer
          );
        }, diff);
        timersRef.current.push(timer);
      }
    });

    // ─── End-of-day reminder at 8 PM ───
    const eodDate = new Date();
    eodDate.setHours(20, 0, 0, 0);
    const eodDiff = eodDate.getTime() - now.getTime();

    if (eodDiff > 0) {
      const eodTimer = setTimeout(() => {
        const logs = todayLogsRef.current;
        const unprayed = PRAYERS.filter(p => !logs[p] || logs[p] === 'None');
        if (unprayed.length > 0) {
          addNotification(
            '⏰ End of Day Reminder',
            `You haven't logged ${unprayed.join(', ')} yet today. Don't forget to pray!`,
            'system'
          );
        }
      }, eodDiff);
      timersRef.current.push(eodTimer);
    }

    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, [prayerTimes, notificationsEnabled, addNotification]);

  // ─── Register SW notification click handler ───
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const handler = (event: MessageEvent) => {
        if (event.data?.type === 'NOTIFICATION_CLICK') {
          window.focus();
        }
      };
      navigator.serviceWorker.addEventListener('message', handler);
      return () => navigator.serviceWorker.removeEventListener('message', handler);
    }
  }, []);

  return {
    notifications,
    unreadCount,
    notificationsEnabled,
    notificationToast,
    setNotificationToast,
    addNotification,
    markAllRead,
    clearNotifications,
    dismissNotification,
    enableNotifications,
    disableNotifications,
    requestPermission,
  };
}
