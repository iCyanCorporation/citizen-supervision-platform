import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>();

export interface UserData {
  userId: string;
  email: string;
  citizenPoints?: Schema["CitizenPoints"]["type"];
  preferences?: Schema["UserPreferences"]["type"];
  supervisions?: Schema["Supervision"]["type"][];
}

/**
 * Initialize user data when they first sign up
 */
export async function initializeUserData(userId: string): Promise<UserData> {
  try {
    // Check if citizen points already exist
    const { data: existingPoints } = await client.models.CitizenPoints.list({
      filter: { userId: { eq: userId } },
    });

    let citizenPoints = existingPoints?.[0];

    if (!citizenPoints) {
      // Create initial citizen points record with welcome bonus
      const { data: newPoints } = await client.models.CitizenPoints.create({
        userId,
        balance: 100,
        totalEarned: 100,
        totalSpent: 0,
      });

      if (newPoints) {
        citizenPoints = newPoints;

        // Create welcome transaction
        await client.models.PointTransaction.create({
          citizenPointsId: newPoints.id,
          type: "EARNED",
          amount: 100,
          reason: "Welcome bonus for joining the platform",
          referenceType: "system",
        });
      }
    }

    // Check if user preferences already exist
    const { data: existingPrefs } = await client.models.UserPreferences.list({
      filter: { userId: { eq: userId } },
    });

    let preferences = existingPrefs?.[0];

    if (!preferences) {
      // Create default preferences
      const { data: newPrefs } = await client.models.UserPreferences.create({
        userId,
        language: "en",
        theme: "system",
        notifications: JSON.stringify({
          deadlineReminders: true,
          obligationUpdates: true,
          kpiAlerts: true,
          systemNotifications: true,
          emailNotifications: false,
          pushNotifications: false,
        }),
        dashboardLayout: JSON.stringify({ layout: "default" }),
      });
      preferences = newPrefs;
    }

    return {
      userId,
      email: "", // Will be populated by the calling component
      citizenPoints: citizenPoints || undefined,
      preferences: preferences || undefined,
    };
  } catch (error) {
    console.error("Error initializing user data:", error);
    throw error;
  }
}

/**
 * Get complete user data including points, preferences, and supervisions
 */
export async function getUserData(userId: string): Promise<UserData | null> {
  try {
    // Fetch citizen points
    const { data: citizenPoints } = await client.models.CitizenPoints.list({
      filter: { userId: { eq: userId } },
    });

    // Fetch user preferences
    const { data: preferences } = await client.models.UserPreferences.list({
      filter: { userId: { eq: userId } },
    });

    // Fetch active supervisions
    const { data: supervisions } = await client.models.Supervision.list({
      filter: { userId: { eq: userId }, isActive: { eq: true } },
    });

    return {
      userId,
      email: "", // Will be populated by the calling component
      citizenPoints: citizenPoints?.[0],
      preferences: preferences?.[0],
      supervisions: supervisions || [],
    };
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
}

/**
 * Award points to a user for completing actions
 */
export async function awardPoints(
  userId: string,
  amount: number,
  reason: string,
  referenceId?: string,
  referenceType?: string
): Promise<boolean> {
  try {
    // Get user's citizen points record
    const { data: citizenPointsData } = await client.models.CitizenPoints.list({
      filter: { userId: { eq: userId } },
    });

    const citizenPoints = citizenPointsData?.[0];
    if (!citizenPoints) {
      throw new Error("Citizen points record not found");
    }

    // Update the balance and total earned
    await client.models.CitizenPoints.update({
      id: citizenPoints.id,
      balance: (citizenPoints.balance || 0) + amount,
      totalEarned: (citizenPoints.totalEarned || 0) + amount,
    });

    // Create transaction record
    await client.models.PointTransaction.create({
      citizenPointsId: citizenPoints.id,
      type: "EARNED",
      amount,
      reason,
      referenceId,
      referenceType,
    });

    return true;
  } catch (error) {
    console.error("Error awarding points:", error);
    return false;
  }
}

/**
 * Spend points for rewards or other actions
 */
export async function spendPoints(
  userId: string,
  amount: number,
  reason: string,
  referenceId?: string,
  referenceType?: string
): Promise<boolean> {
  try {
    // Get user's citizen points record
    const { data: citizenPointsData } = await client.models.CitizenPoints.list({
      filter: { userId: { eq: userId } },
    });

    const citizenPoints = citizenPointsData?.[0];
    if (!citizenPoints) {
      throw new Error("Citizen points record not found");
    }

    // Check if user has enough points
    if ((citizenPoints.balance || 0) < amount) {
      throw new Error("Insufficient points");
    }

    // Update the balance and total spent
    await client.models.CitizenPoints.update({
      id: citizenPoints.id,
      balance: (citizenPoints.balance || 0) - amount,
      totalSpent: (citizenPoints.totalSpent || 0) + amount,
    });

    // Create transaction record
    await client.models.PointTransaction.create({
      citizenPointsId: citizenPoints.id,
      type: "SPENT",
      amount,
      reason,
      referenceId,
      referenceType,
    });

    return true;
  } catch (error) {
    console.error("Error spending points:", error);
    return false;
  }
}

/**
 * Create a notification for a user
 */
export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: "DEADLINE" | "UPDATE" | "ACHIEVEMENT" | "SYSTEM",
  referenceId?: string,
  referenceType?: string
): Promise<boolean> {
  try {
    await client.models.Notification.create({
      userId,
      title,
      message,
      type,
      isRead: false,
      referenceId,
      referenceType,
    });

    return true;
  } catch (error) {
    console.error("Error creating notification:", error);
    return false;
  }
}

/**
 * Get unread notifications for a user
 */
export async function getUnreadNotifications(userId: string) {
  try {
    const { data: notifications } = await client.models.Notification.list({
      filter: { userId: { eq: userId }, isRead: { eq: false } },
      limit: 50,
    });

    return notifications || [];
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(
  notificationId: string
): Promise<boolean> {
  try {
    await client.models.Notification.update({
      id: notificationId,
      isRead: true,
    });

    return true;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return false;
  }
}
