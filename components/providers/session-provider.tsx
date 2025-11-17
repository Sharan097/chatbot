// components/providers/session-provider.tsx
"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider
      // Session persists until explicit logout
      refetchInterval={0}              // Don't auto-refetch (saves API calls)
      refetchOnWindowFocus={true}      // Refetch when tab becomes active
      refetchWhenOffline={false}       // Don't refetch when offline
    >
      {children}
    </SessionProvider>
  );
}
