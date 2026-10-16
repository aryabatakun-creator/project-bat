"use client";

import React from "react";
import { ShieldCheck, LogOut, User } from "lucide-react";
import { useAuth } from "@/lib/authContext";
import { useRouter } from "next/navigation";

export function HeaderBranding() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  return (
    <header className="relative w-full bg-slate-900 text-white overflow-hidden shadow-md border-b border-slate-800 print:bg-slate-900 print:text-white">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between px-6 py-3.5 gap-4">
        {/* Left: Project Title */}
        <div className="flex items-center gap-3.5 z-10">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
          </div>

          <div>
            <h1 className="text-base md:text-lg font-black tracking-tight text-white flex items-center gap-2">
              <span>PROJECT BAT</span>
              <span className="text-[11px] font-bold text-amber-400 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30">
                CASE MONITORING &amp; FOLLOW-UP TRACKER
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 tracking-wide mt-0.5">
              Monitoring, Evaluation, Escalation &amp; Corrective Action
            </p>
          </div>
        </div>

        {/* Right: Authenticated User Profile & Logout */}
        <div className="flex items-center gap-4 z-10 w-full lg:w-auto justify-between lg:justify-end">
          {/* User Profile Pill */}
          <div className="flex items-center gap-3 bg-slate-800/90 border border-slate-700/80 rounded-xl px-3 py-1.5 shadow-xs">
            <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
              {user.full_name ? user.full_name.slice(0, 2).toUpperCase() : "US"}
            </div>
            <div className="leading-tight">
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>{user.full_name}</span>
                <span
                  className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-md ${
                    user.role === "admin"
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      : user.role === "management"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                  }`}
                >
                  {user.role}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 truncate block">
                {user.email || "user@bat-tracker.com"}
              </span>
            </div>

            {/* Logout Action */}
            <button
              onClick={handleLogout}
              className="ml-2 p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700/60 rounded-lg transition-colors print:hidden"
              title="Keluar / Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* BAT Corporate Logo Mark */}
          <div className="flex items-center gap-2 pl-3 border-l border-slate-700/80">
            <div className="text-right leading-none">
              <span className="text-xl font-black tracking-tighter text-white block">
                BAT
              </span>
              <span className="text-[9px] text-slate-400 tracking-widest uppercase font-semibold block">
                A BETTER TOMORROW
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Corporate Accent Ribbon Diagonal styling at top right */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute right-0 top-0 bottom-0 w-80 overflow-hidden opacity-30 lg:opacity-40 print:hidden"
      >
        <div className="absolute -top-12 -right-8 w-48 h-36 bg-gradient-to-bl from-amber-400 via-amber-600 to-transparent transform -skew-x-12" />
        <div className="absolute -top-8 right-16 w-12 h-32 bg-sky-500/20 transform -skew-x-12" />
      </div>
    </header>
  );
}
