"use client";

import React, { useEffect, useState } from "react";
import { useAuthenticator, Authenticator } from "@aws-amplify/ui-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, ArrowRight } from "lucide-react";

type AuthWrapperProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAuth?: boolean;
  showAuthenticator?: boolean;
};

export default function AuthWrapper({
  children,
  fallback,
  requireAuth = true,
  showAuthenticator = false,
}: AuthWrapperProps) {
  const { user, authStatus } = useAuthenticator((context) => [
    context.user,
    context.authStatus,
  ]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything until mounted (prevents hydration issues)
  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show loading state while auth is being determined
  if (authStatus === "configuring") {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If authentication is required and user is not authenticated
  if (requireAuth && authStatus !== "authenticated") {
    if (showAuthenticator) {
      return (
        <div className="container mx-auto px-4 py-8 max-w-md">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Shield className="h-12 w-12 text-primary" />
              </div>
              <CardTitle>Citizen Supervision Platform</CardTitle>
              <p className="text-sm text-muted-foreground">
                Sign in to start supervising civil servants and earning citizen
                points
              </p>
            </CardHeader>
            <CardContent>
              <Authenticator
                signUpAttributes={["email"]}
                socialProviders={[]}
                variation="modal"
                hideSignUp={false}
              />
            </CardContent>
          </Card>
        </div>
      );
    }

    // Default fallback content if not provided
    const defaultFallback = (
      <div className="container mx-auto px-4 py-8 max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Shield className="h-12 w-12 text-primary" />
            </div>
            <CardTitle>Authentication Required</CardTitle>
            <p className="text-sm text-muted-foreground">
              You need to sign in to access this content
            </p>
          </CardHeader>
          <CardContent className="text-center">
            <Button
              onClick={() => (window.location.href = "/auth")}
              className="w-full"
            >
              Sign In
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );

    return fallback ? <>{fallback}</> : defaultFallback;
  }

  // If user is authenticated or auth is not required, show the protected content
  return <>{children}</>;
}
