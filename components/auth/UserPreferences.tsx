"use client";

import React, { useEffect, useState } from "react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Languages, Bell, Moon, Sun, Monitor, Save } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "next-themes";

const client = generateClient<Schema>();

interface NotificationPreferences {
  deadlineReminders: boolean;
  obligationUpdates: boolean;
  kpiAlerts: boolean;
  systemNotifications: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

const defaultNotificationPreferences: NotificationPreferences = {
  deadlineReminders: true,
  obligationUpdates: true,
  kpiAlerts: true,
  systemNotifications: true,
  emailNotifications: false,
  pushNotifications: false,
};

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "zh_tw", name: "繁體中文", flag: "🇹🇼" },
];

const themes = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export default function UserPreferences() {
  const { user } = useAuthenticator();
  const { theme, setTheme } = useTheme();
  const [preferences, setPreferences] = useState<
    Schema["UserPreferences"]["type"] | null
  >(null);
  const [notificationPrefs, setNotificationPrefs] =
    useState<NotificationPreferences>(defaultNotificationPreferences);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [selectedTheme, setSelectedTheme] = useState(theme || "system");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.userId) {
      fetchUserPreferences();
    }
  }, [user?.userId]);

  const fetchUserPreferences = async () => {
    try {
      setLoading(true);

      const { data: existingPrefs } = await client.models.UserPreferences.list({
        filter: { userId: { eq: user.userId } },
      });

      let prefsRecord = existingPrefs?.[0];

      if (!prefsRecord) {
        // Create default preferences
        const { data: newPrefs } = await client.models.UserPreferences.create({
          userId: user.userId,
          language: "en",
          theme: "system",
          notifications: JSON.stringify(defaultNotificationPreferences),
          dashboardLayout: JSON.stringify({ layout: "default" }),
        });
        prefsRecord = newPrefs;
      }

      if (prefsRecord) {
        setPreferences(prefsRecord);
        setSelectedLanguage(prefsRecord.language || "en");
        setSelectedTheme(prefsRecord.theme || "system");

        if (
          prefsRecord.notifications &&
          typeof prefsRecord.notifications === "string"
        ) {
          try {
            const parsedNotifications = JSON.parse(prefsRecord.notifications);
            setNotificationPrefs({
              ...defaultNotificationPreferences,
              ...parsedNotifications,
            });
          } catch (error) {
            console.error("Error parsing notification preferences:", error);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching user preferences:", error);
      toast.error("Failed to load preferences");
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!preferences || !user?.userId) return;

    try {
      setSaving(true);

      const themeValue = selectedTheme as "light" | "dark" | "system";

      await client.models.UserPreferences.update({
        id: preferences.id,
        language: selectedLanguage,
        theme: themeValue,
        notifications: JSON.stringify(notificationPrefs),
        dashboardLayout: preferences.dashboardLayout,
      });

      // Apply theme change immediately
      setTheme(selectedTheme);

      toast.success("Preferences saved successfully!");
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast.error("Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationChange = (
    key: keyof NotificationPreferences,
    value: boolean
  ) => {
    setNotificationPrefs((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  if (loading) {
    return (
      <Card className="max-w-2xl">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Languages className="h-5 w-5" />
          <span>User Preferences</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Language Settings */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Language</Label>
          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger>
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  <div className="flex items-center space-x-2">
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Choose your preferred language for the interface
          </p>
        </div>

        <Separator />

        {/* Theme Settings */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Theme</Label>
          <Select value={selectedTheme} onValueChange={setSelectedTheme}>
            <SelectTrigger>
              <SelectValue placeholder="Select theme" />
            </SelectTrigger>
            <SelectContent>
              {themes.map((themeOption) => {
                const Icon = themeOption.icon;
                return (
                  <SelectItem key={themeOption.value} value={themeOption.value}>
                    <div className="flex items-center space-x-2">
                      <Icon className="h-4 w-4" />
                      <span>{themeOption.label}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Choose your preferred color theme
          </p>
        </div>

        <Separator />

        {/* Notification Settings */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <Label className="text-base font-medium">
              Notification Preferences
            </Label>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Deadline Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified about upcoming obligation and KPI deadlines
                </p>
              </div>
              <Switch
                checked={notificationPrefs.deadlineReminders}
                onCheckedChange={(checked) =>
                  handleNotificationChange("deadlineReminders", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Obligation Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications when obligations are updated
                </p>
              </div>
              <Switch
                checked={notificationPrefs.obligationUpdates}
                onCheckedChange={(checked) =>
                  handleNotificationChange("obligationUpdates", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>KPI Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Get alerts when KPI targets are met or missed
                </p>
              </div>
              <Switch
                checked={notificationPrefs.kpiAlerts}
                onCheckedChange={(checked) =>
                  handleNotificationChange("kpiAlerts", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>System Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive important system updates and announcements
                </p>
              </div>
              <Switch
                checked={notificationPrefs.systemNotifications}
                onCheckedChange={(checked) =>
                  handleNotificationChange("systemNotifications", checked)
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Send notifications to your email address
                </p>
              </div>
              <Switch
                checked={notificationPrefs.emailNotifications}
                onCheckedChange={(checked) =>
                  handleNotificationChange("emailNotifications", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive browser push notifications
                </p>
              </div>
              <Switch
                checked={notificationPrefs.pushNotifications}
                onCheckedChange={(checked) =>
                  handleNotificationChange("pushNotifications", checked)
                }
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={savePreferences}
            disabled={saving}
            className="min-w-[120px]"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
