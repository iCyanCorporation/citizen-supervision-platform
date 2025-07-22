import { useEffect, useState } from "react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import {
  getUnreadNotifications,
  markNotificationAsRead,
  createNotification,
} from "@/lib/auth";
import type { Schema } from "@/amplify/data/resource";

export function useNotifications() {
  const { user, authStatus } = useAuthenticator();
  const [notifications, setNotifications] = useState<
    Schema["Notification"]["type"][]
  >([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (authStatus === "authenticated" && user?.userId) {
      loadNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
    }
  }, [authStatus, user?.userId]);

  const loadNotifications = async () => {
    if (!user?.userId) return;

    try {
      setLoading(true);
      const unreadNotifications = await getUnreadNotifications(user.userId);
      setNotifications(unreadNotifications);
      setUnreadCount(unreadNotifications.length);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const success = await markNotificationAsRead(notificationId);
      if (success) {
        setNotifications((prev) =>
          prev.filter((notification) => notification.id !== notificationId)
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const addNotification = async (
    title: string,
    message: string,
    type: "DEADLINE" | "UPDATE" | "ACHIEVEMENT" | "SYSTEM",
    referenceId?: string,
    referenceType?: string
  ) => {
    if (!user?.userId) return false;

    try {
      const success = await createNotification(
        user.userId,
        title,
        message,
        type,
        referenceId,
        referenceType
      );

      if (success) {
        // Refresh notifications to include the new one
        await loadNotifications();
      }

      return success;
    } catch (error) {
      console.error("Error creating notification:", error);
      return false;
    }
  };

  const clearAllNotifications = async () => {
    try {
      // Mark all notifications as read
      const promises = notifications.map((notification) =>
        markNotificationAsRead(notification.id)
      );

      await Promise.all(promises);

      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    addNotification,
    clearAllNotifications,
    refreshNotifications: loadNotifications,
  };
}
