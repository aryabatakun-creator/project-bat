"use client";

import React from "react";
import { Bell, X, ArrowRight } from "lucide-react";
import { useNotifications } from "@/lib/notificationContext";

export function NotificationToast() {
  const { latestToast, dismissToast, openDetail, markAsRead } = useNotifications();

  if (!latestToast) return null;

  const handleClick = () => {
    markAsRead(latestToast.id);
    openDetail(latestToast.caseItem);
    dismissToast();
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-slate-700 animate-in slide-in-from-bottom-5 duration-300 print:hidden">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
          <Bell className="w-4 h-4" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400">
              {latestToast.title}
            </span>
            <button
              onClick={dismissToast}
              className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs text-slate-300 mt-0.5 line-clamp-2">
            {latestToast.message}
          </p>

          <button
            onClick={handleClick}
            className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
          >
            <span>Buka Detail Kasus</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
