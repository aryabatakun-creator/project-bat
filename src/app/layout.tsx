import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/authContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { HeaderBranding } from "@/components/layout/HeaderBranding";

export const metadata: Metadata = {
  title: "Project BAT - Case Monitoring & Follow-Up Tracker",
  description: "Operational Case Monitoring System for Nawakara & Project BAT",
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
          <div className="flex min-h-screen">
            {/* Sidebar Left */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
              <HeaderBranding />
              <main className="flex-1 p-5 lg:p-6 overflow-y-auto">
                {children}
              </main>
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
