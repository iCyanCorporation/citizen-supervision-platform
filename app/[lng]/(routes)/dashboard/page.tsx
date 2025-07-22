"use client";

import AuthWrapper from "@/components/common/AuthWrapper";
import UserProfile from "@/components/auth/UserProfile";
import UserPreferences from "@/components/auth/UserPreferences";
import NotificationCenter from "@/components/auth/NotificationCenter";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Settings, BarChart3, Users, Bell } from "lucide-react";

export default function DashboardPage() {
  const { userData, loading } = useAuth();

  return (
    <AuthWrapper requireAuth={true}>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Citizen Supervision Dashboard
            </h1>
            <p className="text-muted-foreground">
              Monitor civil servants and track your supervision activities
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <NotificationCenter compact={true} />
            <UserProfile compact={true} showSettings={false} />
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger
              value="overview"
              className="flex items-center space-x-2"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger
              value="profile"
              className="flex items-center space-x-2"
            >
              <User className="h-4 w-4" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger
              value="preferences"
              className="flex items-center space-x-2"
            >
              <Settings className="h-4 w-4" />
              <span>Preferences</span>
            </TabsTrigger>
            <TabsTrigger
              value="supervision"
              className="flex items-center space-x-2"
            >
              <Users className="h-4 w-4" />
              <span>Supervision</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Supervised Civil Servants
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loading ? "..." : userData?.supervisions?.length || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {userData?.supervisions?.length === 0
                      ? "Start supervising civil servants"
                      : "Active supervisions"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Obligations
                  </CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">
                    Obligations being tracked
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    KPIs Monitored
                  </CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">
                    Performance indicators tracked
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Citizen Points
                  </CardTitle>
                  <User className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loading ? "..." : userData?.citizenPoints?.balance || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {userData?.citizenPoints?.balance === 100
                      ? "Welcome bonus received"
                      : "Current balance"}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Getting Started</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                      1
                    </div>
                    <div>
                      <h4 className="font-medium">Complete your profile</h4>
                      <p className="text-sm text-muted-foreground">
                        Set up your preferences and notification settings
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-medium">
                      2
                    </div>
                    <div>
                      <h4 className="font-medium">
                        Find civil servants to supervise
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Search for civil servants in your area or department of
                        interest
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-medium">
                      3
                    </div>
                    <div>
                      <h4 className="font-medium">
                        Start tracking obligations and KPIs
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Record campaign promises and set performance indicators
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <div className="flex justify-center">
              <UserProfile showSettings={true} />
            </div>
          </TabsContent>

          <TabsContent value="preferences">
            <div className="flex justify-center">
              <UserPreferences />
            </div>
          </TabsContent>

          <TabsContent value="supervision">
            <Card>
              <CardHeader>
                <CardTitle>Supervision Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    No supervision activities yet
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Start by searching for civil servants to supervise
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AuthWrapper>
  );
}
