"use client";

import { useNotification } from "@/hooks/useNotification";
import { useEffect } from "react";

type NotificationType = "success" | "error" | "info" | "warning";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  duration?: number;
}

interface NotificationToastProps {
  title: string;
  message: string;
  type?: NotificationType;
  autoClose?: boolean;
  duration?: number;
}

function NotificationToast({
  title,
  message,
  type = "info",
  autoClose = true,
  duration = 5000,
}: NotificationToastProps) {
  const { addNotification } = useNotification();

  useEffect(() => {
    addNotification(title, message, type);
  }, [title, message, type, addNotification]);

  return null;
}

interface NotificationContainerProps {
  notifications: Notification[];
  onRemove: (id: string) => void;
}

export function NotificationContainer({
  notifications,
  onRemove,
}: NotificationContainerProps) {
  const icons = {
    success: "✓",
    error: "✗",
    info: "ℹ",
    warning: "⚠",
  };

  const colors = {
    success: "bg-green-900 border-green-700 text-green-200",
    error: "bg-red-900 border-red-700 text-red-200",
    info: "bg-blue-900 border-blue-700 text-blue-200",
    warning: "bg-yellow-900 border-yellow-700 text-yellow-200",
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm space-y-3">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`border rounded-lg p-4 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 ${
            colors[notification.type]
          }`}
        >
          <span className="text-lg flex-shrink-0">
            {icons[notification.type]}
          </span>
          <div className="flex-1">
            <h3 className="font-semibold">{notification.title}</h3>
            <p className="text-sm opacity-90">{notification.message}</p>
          </div>
          <button
            onClick={() => onRemove(notification.id)}
            className="flex-shrink-0 opacity-50 hover:opacity-100 transition"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

export { NotificationToast };
