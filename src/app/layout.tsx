import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/authContext";
import { AppLayoutShell } from "@/components/layout/AppLayoutShell";

export const viewport: Viewport = {
  themeColor: "#0B1026",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Case Tracker by Orstedlabs - Case Monitoring & Follow-Up Tracker",
  description: "Operational Case Monitoring System - Case Tracker by Orstedlabs",
  applicationName: "Case Tracker by Orstedlabs",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Case Tracker by Orstedlabs",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="application-name" content="Case Tracker by Orstedlabs" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Case Tracker by Orstedlabs" />
        <meta name="theme-color" content="#0B1026" />
      </head>
      <body className="bg-slate-100 min-h-screen text-slate-900 antialiased">
        <AuthProvider>
          <AppLayoutShell>{children}</AppLayoutShell>
        </AuthProvider>
      </body>
    </html>
  );
}
