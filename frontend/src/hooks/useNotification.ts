"use client";

import { useState, useCallback } from "react";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
  timestamp: number;
}

export function useNotification() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback(
    (
      title: string,
      message: string,
      type: "success" | "error" | "info" | "warning" = "info"
    ) => {
      const notification: Notification = {
        id: `notification_${Date.now()}`,
        title,
        message,
        type,
        timestamp: Date.now(),
      };

      setNotifications((prev) => [notification, ...prev]);

      // Auto-remove after 5 seconds
      setTimeout(() => {
        setNotifications((prev) =>
          prev.filter((n) => n.id !== notification.id)
        );
      }, 5000);

      return notification.id;
    },
    []
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return {
    notifications,
    addNotification,
    removeNotification,
  };
}

/**
 * Push Notification provider (for browsers that support it)
 */
export async function requestNotificationPermission() {
  if (!("Notification" in window)) {
    console.log("Browser does not support notifications");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
}

/**
 * Send browser notification
 */
export function sendBrowserNotification(
  title: string,
  options?: NotificationOptions
) {
  if (Notification.permission === "granted") {
    new Notification(title, options);
  }
}

/**
 * Escrow-specific notifications
 */
export function sendEscrowNotification(
  type: "created" | "deposited" | "released" | "refunded" | "bridged",
  escrowId: number,
  data?: any
) {
  const notifications = {
    created: {
      title: `Escrow #${escrowId} Created`,
      body: `Escrow created successfully. Waiting for deposit...`,
      icon: "📝",
    },
    deposited: {
      title: `Escrow #${escrowId} Funded`,
      body: `${data?.amount || "Funds"} deposited. Ready to release!`,
      icon: "💰",
    },
    released: {
      title: `Escrow #${escrowId} Released`,
      body: `Payment released to freelancer`,
      icon: "✓",
    },
    refunded: {
      title: `Escrow #${escrowId} Refunded`,
      body: `Funds refunded to your account`,
      icon: "🔄",
    },
    bridged: {
      title: `Escrow #${escrowId} Bridged`,
      body: `Funds bridged to ${data?.chain || "destination chain"}`,
      icon: "🌉",
    },
  };

  const notification = notifications[type];
  sendBrowserNotification(notification.title, {
    body: notification.body,
    icon: notification.icon,
  });
}
