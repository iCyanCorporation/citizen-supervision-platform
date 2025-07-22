"use client";

import React, { useEffect, useState } from "react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Coins, Trophy, Activity, Settings } from "lucide-react";
import { toast } from "sonner";

const client = generateClient<Schema>();

interface UserProfileProps {
  showSettings?: boolean;
  compact?: boolean;
}

export default function UserProfile({
  showSettings = true,
  compact = false,
}: UserProfileProps) {
  const { signOut } = useAuthenticator();
  const { userData, loading, user } = useAuth();
  const [recentTransactions, setRecentTransactions] = useState<
    Schema["PointTransaction"]["type"][]
  >([]);

  useEffect(() => {
    if (userData?.citizenPoints?.id) {
      fetchRecentTransactions();
    }
  }, [userData?.citizenPoints?.id]);

  const fetchRecentTransactions = async () => {
    if (!userData?.citizenPoints?.id) return;

    try {
      const { data: transactions } = await client.models.PointTransaction.list({
        filter: { citizenPointsId: { eq: userData.citizenPoints.id } },
        limit: 5,
      });
      setRecentTransactions(transactions || []);
    } catch (error) {
      console.error("Error fetching recent transactions:", error);
    }
  };

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Card className={compact ? "w-full" : "max-w-md"}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-16 w-16 bg-gray-200 rounded-full mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center space-x-3 p-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user?.signInDetails?.loginId} />
          <AvatarFallback className="text-xs">
            {getInitials(user?.signInDetails?.loginId || "U")}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {user?.signInDetails?.loginId}
          </p>
          <div className="flex items-center space-x-1">
            <Coins className="h-3 w-3 text-yellow-500" />
            <span className="text-xs text-muted-foreground">
              {userData?.citizenPoints?.balance || 0} points
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="max-w-md">
      <CardHeader className="text-center">
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user?.signInDetails?.loginId} />
            <AvatarFallback className="text-lg">
              {getInitials(user?.signInDetails?.loginId || "U")}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-xl">
              {user?.signInDetails?.loginId}
            </CardTitle>
            <p className="text-sm text-muted-foreground">Citizen Supervisor</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Citizen Points Summary */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <div className="flex items-center justify-center">
              <Coins className="h-4 w-4 text-yellow-500 mr-1" />
              <span className="text-2xl font-bold text-yellow-600">
                {userData?.citizenPoints?.balance || 0}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Current Points</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-center">
              <Trophy className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-2xl font-bold text-green-600">
                {userData?.citizenPoints?.totalEarned || 0}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Total Earned</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-center">
              <Activity className="h-4 w-4 text-blue-500 mr-1" />
              <span className="text-2xl font-bold text-blue-600">
                {userData?.citizenPoints?.totalSpent || 0}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Total Spent</p>
          </div>
        </div>

        <Separator />

        {/* Recent Activity */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Recent Activity</h4>
          {recentTransactions.length > 0 ? (
            <div className="space-y-2">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex-1">
                    <p className="truncate">{transaction.reason}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(transaction.createdAt || "")}
                    </p>
                  </div>
                  <Badge
                    variant={
                      transaction.type === "EARNED" ? "default" : "secondary"
                    }
                    className="ml-2"
                  >
                    {transaction.type === "EARNED" ? "+" : "-"}
                    {transaction.amount}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No recent activity</p>
          )}
        </div>

        {showSettings && (
          <>
            <Separator />

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button variant="outline" className="w-full" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Account Settings
              </Button>
              <Button
                variant="outline"
                className="w-full"
                size="sm"
                onClick={signOut}
              >
                Sign Out
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
