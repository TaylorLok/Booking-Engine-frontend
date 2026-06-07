"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

function AuthRehydration() {
  useAuth();
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthRehydration />
      {children}
    </QueryClientProvider>
  );
}
