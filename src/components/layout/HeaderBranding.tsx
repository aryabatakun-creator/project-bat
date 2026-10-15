"use client";

import React from "react";
import { ShieldCheck, UserCog } from "lucide-react";
import { useAuth } from "@/lib/authContext";
import { AppRole } from "@/lib/types";

export function HeaderBranding() {
  const { user, setRole } = useAuth();

  return (
    <header className="relative w-full bg-slate-900 text-white overflow-hidden shadow-md border-b border-slate-800">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between px-6 py-3.5 gap-4">
        {/* Left: Nawakara & Project Title */}
        <div className="flex items-center gap-4 z-10">
          <div className="flex items-center gap-2.5 pr-4 border-r border-slate-700">
            <div className="w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
            </div>
            <div className="leading-tight">
              <span className="text-xs font-bold tracking-widest text-white uppercase block">
                NAWAKARA
              </span>
              <span className="text-[10px] text-slate-300 font-medium tracking-wider block">
                PERKASA NUSANTARA
              </span>
            </div>
          </div>

          <div>
            <h1 className="text-lg md:text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <span>PROJECT BAT</span>
              <span className="text-xs font-medium text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
                CASE MONITORING & FOLLOW-UP TRACKER
              </span>
            </h1>
            <p className="text-[11px] text-slate-300 tracking-wide mt-0.5">
              Monitoring, Evaluation, Escalation &amp; Corrective Action
            </p>
          </div>
        </div>

        {/* Right: Role Switcher & BAT Logo with Graphic Ribbon */}
        <div className="flex items-center gap-5 z-10 w-full lg:w-auto justify-between lg:justify-end">
          {/* Interactive Role Switcher for 3 POV testing */}
          <div className="flex items-center gap-1.5 bg-slate-800/90 border border-slate-700 rounded-lg px-2.5 py-1">
            <UserCog className="w-3.5 h-3.5 text-amber-400 mr-1" />
            <span className="text-[11px] text-slate-300 font-medium">POV Role:</span>
            {(['admin', 'management', 'supervisor'] as AppRole[]).map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`text-[11px] px-2 py-0.5 rounded capitalize font-medium transition-all ${
                  user.role === r
                    ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                    : "text-slate-300 hover:text-white hover:bg-slate-700"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* BAT Branding */}
          <div className="flex items-center gap-2 pl-3 border-l border-slate-700">
            <div className="text-right leading-none">
              <span className="text-xl font-black tracking-tighter text-white block">
                BAT
              </span>
              <span className="text-[9px] text-slate-300 tracking-widest uppercase font-semibold block">
                A BETTER TOMORROW
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Corporate Accent Ribbon Diagonal styling at top right */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute right-0 top-0 bottom-0 w-80 overflow-hidden opacity-30 lg:opacity-40"
      >
        <div className="absolute -top-12 -right-8 w-48 h-36 bg-gradient-to-bl from-amber-400 via-amber-600 to-transparent transform -skew-x-12" />
        <div className="absolute -top-8 right-16 w-12 h-32 bg-sky-500/20 transform -skew-x-12" />
      </div>
    </header>
  );
}
