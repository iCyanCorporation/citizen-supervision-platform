"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthenticator } from "@aws-amplify/ui-react";
import AuthWrapper from "@/components/common/AuthWrapper";

export default function AuthPage() {
  const router = useRouter();
  const { authStatus } = useAuthenticator();

  useEffect(() => {
    if (authStatus === "authenticated") {
      router.push("/dashboard");
    }
  }, [authStatus, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <AuthWrapper requireAuth={false} showAuthenticator={true}>
        {/* This will redirect to dashboard if already authenticated */}
        <div className="text-center">
          <p>Redirecting to dashboard...</p>
        </div>
      </AuthWrapper>
    </div>
  );
}
