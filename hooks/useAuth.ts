import { useEffect, useState } from "react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { getUserData, initializeUserData, type UserData } from "@/lib/auth";

export function useAuth() {
  const { user, authStatus, signOut } = useAuthenticator();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authStatus === "authenticated" && user?.userId) {
      loadUserData();
    } else if (authStatus === "unauthenticated") {
      setUserData(null);
      setLoading(false);
      setError(null);
    }
  }, [authStatus, user?.userId]);

  const loadUserData = async () => {
    if (!user?.userId) return;

    try {
      setLoading(true);
      setError(null);

      // Try to get existing user data
      let data = await getUserData(user.userId);

      // If no data exists, initialize it
      if (!data || !data.citizenPoints || !data.preferences) {
        data = await initializeUserData(user.userId);
      }

      // Add email from auth user
      if (data) {
        data.email = user.signInDetails?.loginId || "";
        setUserData(data);
      }
    } catch (err) {
      console.error("Error loading user data:", err);
      setError("Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  const refreshUserData = async () => {
    if (user?.userId) {
      await loadUserData();
    }
  };

  return {
    user,
    userData,
    authStatus,
    loading,
    error,
    signOut,
    refreshUserData,
    isAuthenticated: authStatus === "authenticated",
    isLoading: authStatus === "configuring" || loading,
  };
}
