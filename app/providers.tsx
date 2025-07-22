"use client";

import { ThemeProvider } from "next-themes";
import { ReactNode, useEffect, useState } from "react";
import { Authenticator } from "@aws-amplify/ui-react";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";
import { Toaster } from "@/components/ui/sonner";

// Configure Amplify
Amplify.configure(outputs);

export function Providers({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) {
    return null; // Optionally, return a loading spinner here
  }
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Authenticator.Provider>
        {children}
        <Toaster />
      </Authenticator.Provider>
    </ThemeProvider>
  );
}
