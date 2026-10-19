import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/authContext";
import { AppLayoutShell } from "@/components/layout/AppLayoutShell";

export const metadata: Metadata = {
  title: "NPN - Project BAT - Case Monitoring & Follow-Up Tracker",
  description: "Operational Case Monitoring System for NPN - Project BAT (Supported by OrstedLabs)",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-slate-100 min-h-screen text-slate-900 antialiased">
        <AuthProvider>
          <AppLayoutShell>{children}</AppLayoutShell>
        </AuthProvider>
      </body>
    </html>
  );
}
