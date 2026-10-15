"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ClipboardList, 
  Database, 
  ShieldAlert, 
  Lock
} from "lucide-react";
import { useAuth } from "@/lib/authContext";

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const navItems = [
    {
      label: "Dashboard Monitoring",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["admin", "management", "supervisor"],
    },
    {
      label: "Case Monitoring",
      href: "/cases",
      icon: ClipboardList,
      roles: ["admin", "management", "supervisor"],
    },
    {
      label: "Master Data",
      href: "/master-data",
      icon: Database,
      roles: ["admin"], // Admin Only
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 min-h-screen">
      {/* Brand Header in Sidebar */}
      <div className="px-5 py-5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center font-bold text-slate-950 text-sm shadow">
            BAT
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide">
              BAT TRACKER
            </h2>
            <span className="text-[10px] text-slate-400 font-medium">
              Operational System
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="px-3 py-4 flex-1 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
          Menu Navigasi
        </div>
        {navItems.map((item) => {
          const isAllowed = item.roles.includes(user.role);
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (!isAllowed) {
            // For management & supervisor, Master Data is completely hidden as per PRD
            return null;
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? "bg-slate-800 text-amber-400 border-l-4 border-amber-400 shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-amber-400" : "text-slate-400"}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}

        {/* Master Data Locked Badge (Shown only if management/supervisor tries to search) */}
        {user.role !== "admin" && (
          <div className="pt-4 px-3">
            <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>Master Data khusus akses Admin</span>
            </div>
          </div>
        )}
      </div>

      {/* User Info & Role Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-amber-400">
            {user.full_name.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">
              {user.full_name}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`inline-block w-1.5 h-1.5 rounded-full ${
                user.role === 'admin' ? 'bg-emerald-400' : user.role === 'management' ? 'bg-sky-400' : 'bg-amber-400'
              }`} />
              <span className="text-[10px] text-slate-300 font-semibold uppercase tracking-wider">
                {user.role}
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
