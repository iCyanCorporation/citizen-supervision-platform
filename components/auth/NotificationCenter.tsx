"use client";

import React from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Bell,
  Clock,
  AlertTriangle,
  Trophy,
  Settings,
  X,
  CheckCheck,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "DEADLINE":
      return <Clock className="h-4 w-4 text-orange-500" />;
    case "UPDATE":
      return <AlertTriangle className="h-4 w-4 text-blue-500" />;
    case "ACHIEVEMENT":
      return <Trophy className="h-4 w-4 text-yellow-500" />;
    case "SYSTEM":
      return <Settings className="h-4 w-4 text-gray-500" />;
    default:
      return <Bell className="h-4 w-4 text-gray-500" />;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case "DEADLINE":
      return "border-l-orange-500";
    case "UPDATE":
      return "border-l-blue-500";
    case "ACHIEVEMENT":
      return "border-l-yellow-500";
    case "SYSTEM":
      return "border-l-gray-500";
    default:
      return "border-l-gray-300";
  }
};

interface NotificationCenterProps {
  compact?: boolean;
  maxHeight?: string;
}

export default function NotificationCenter({
  compact = false,
  maxHeight = "400px",
}: NotificationCenterProps) {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    clearAllNotifications,
  } = useNotifications();

  if (loading) {
    return (
      <Card className={compact ? "w-full" : "max-w-md"}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className="relative">
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </div>
    );
  }

  return (
    <Card className="max-w-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center space-x-2">
          <Bell className="h-5 w-5" />
          <span>Notifications</span>
          {unreadCount > 0 && <Badge variant="secondary">{unreadCount}</Badge>}
        </CardTitle>
        {notifications.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllNotifications}
            className="text-xs"
          >
            <CheckCheck className="h-3 w-3 mr-1" />
            Clear All
          </Button>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {notifications.length === 0 ? (
          <div className="text-center py-8 px-6">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No notifications</h3>
            <p className="text-sm text-muted-foreground">
              You're all caught up! New notifications will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-0 overflow-y-auto" style={{ maxHeight }}>
            {notifications.map((notification, index) => (
              <div key={notification.id}>
                <div
                  className={`p-4 border-l-4 ${getNotificationColor(notification.type || "SYSTEM")} hover:bg-muted/50 transition-colors`}
                >
                  <div className="flex items-start justify-between space-x-3">
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type || "SYSTEM")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium truncate">
                          {notification.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatDistanceToNow(
                            new Date(notification.createdAt || ""),
                            {
                              addSuffix: true,
                            }
                          )}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAsRead(notification.id)}
                      className="flex-shrink-0 h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                {index < notifications.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
