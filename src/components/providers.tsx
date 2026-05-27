"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="light">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "oklch(1 0 0 / 85%)",
              backdropFilter: "blur(16px)",
              border: "1px solid oklch(0 0 0 / 8%)",
              borderRadius: "16px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            },
          }}
        />
      </ThemeProvider>
    </SessionProvider>
  );
}
