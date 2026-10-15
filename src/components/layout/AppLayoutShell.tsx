"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { HeaderBranding } from "@/components/layout/HeaderBranding";

export function AppLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith("/auth");

  if (isAuthPage) {
    return <main className="min-h-screen bg-slate-950">{children}</main>;
  }

  return (
    <div className="flex min-h-screen print:block print:min-h-0">
      {/* Sidebar Left */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden print:overflow-visible print:block">
        <HeaderBranding />
        <main className="flex-1 p-4 md:p-6 overflow-y-auto print:p-0 print:overflow-visible print:block">
          {children}
        </main>
      </div>
    </div>
  );
}
