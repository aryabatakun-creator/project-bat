"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ClipboardList, 
  Database, 
  ChevronLeft,
  ChevronRight,
  Menu,
  X
} from "lucide-react";
import { useAuth } from "@/lib/authContext";

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    {
      label: "Dashboard Monitoring",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["admin", "management", "supervisor"],
    },
    {
      label: "Monitoring & Follow Up",
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
    <>
      {/* Mobile Hamburger Toggle Button (Top Floating on Small Screens) */}
      <div className="lg:hidden fixed top-3 left-3 z-50">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2.5 rounded-xl bg-slate-900 text-white shadow-lg border border-slate-700 hover:bg-slate-800 transition-colors"
          title="Toggle Navigation Menu"
        >
          {isMobileOpen ? <X className="w-5 h-5 text-amber-400" /> : <Menu className="w-5 h-5 text-amber-400" />}
        </button>
      </div>

      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 transition-opacity"
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 min-h-screen transition-all duration-300 z-40 print:hidden ${
          isCollapsed ? "w-20" : "w-64"
        } ${
          isMobileOpen
            ? "fixed inset-y-0 left-0 shadow-2xl translate-x-0"
            : "hidden lg:flex"
        }`}
      >
        {/* Brand Header */}
        <div className="px-4 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-[#0B1026] border border-slate-700/80 p-0.5 flex items-center justify-center shadow-md shrink-0 overflow-hidden">
              <img
                src="/images/satpam-logo.png"
                alt="Logo Satpam NPN"
                className="w-full h-full object-contain"
              />
            </div>
            {!isCollapsed && (
              <div className="leading-tight truncate">
                <h2 className="text-xs font-black text-white tracking-wide truncate">
                  NPN - PROJECT BAT
                </h2>
                <span className="text-[10px] text-slate-400 font-medium tracking-wider">
                  Operational System
                </span>
              </div>
            )}
          </div>

          {/* Desktop Collapse / Expand Toggle Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={isCollapsed ? "Perluas Sidebar" : "Perkecil Sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-amber-400" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-slate-400" />
            )}
          </button>
        </div>

        {/* Navigation Links */}
        <div className="px-3 py-5 flex-1 space-y-1.5 overflow-y-auto">
          {!isCollapsed && (
            <div className="px-3 pb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              Menu Navigasi
            </div>
          )}

          {navItems.map((item) => {
            const isAllowed = item.roles.includes(user.role);
            const isActive = pathname === item.href;
            const Icon = item.icon;

            if (!isAllowed) {
              return null;
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                title={isCollapsed ? item.label : undefined}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all group ${
                  isActive
                    ? "bg-slate-800 text-amber-400 border-l-4 border-amber-400 shadow-sm"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                } ${isCollapsed ? "justify-center px-0" : ""}`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? "text-amber-400" : "text-slate-400 group-hover:text-slate-200"
                  }`}
                />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </div>

        {/* User Info & Role Footer */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950/60">
          <div className={`flex items-center gap-3 ${isCollapsed ? "justify-center" : ""}`}>
            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-black text-amber-400 shrink-0">
              {user.full_name ? user.full_name.slice(0, 2).toUpperCase() : "US"}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">
                  {user.full_name}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={`inline-block w-1.5 h-1.5 rounded-full ${
                      user.role === "admin"
                        ? "bg-amber-400"
                        : user.role === "management"
                        ? "bg-emerald-400"
                        : "bg-sky-400"
                    }`}
                  />
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    {user.role}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* OrstedLabs Remarks Badge / Footer */}
        {!isCollapsed ? (
          <div className="px-3.5 py-2.5 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
            <span className="text-slate-400 font-medium">Supported by</span>
            <img
              src="/images/orstedlabs-logo.png"
              alt="OrstedLabs"
              className="h-4 w-auto object-contain"
            />
          </div>
        ) : (
          <div
            className="py-2.5 bg-slate-950 border-t border-slate-800/80 flex justify-center cursor-default"
            title="Supported by OrstedLabs"
          >
            <img
              src="/images/orstedlabs-mark.png"
              alt="OrstedLabs"
              className="w-4 h-4 object-contain rounded"
            />
          </div>
        )}
      </aside>
    </>
  );
}
