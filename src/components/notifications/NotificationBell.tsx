"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bell, CheckCheck, Trash2, ArrowRight, ShieldAlert, Sparkles } from "lucide-react";
import { useNotifications, AppNotification } from "@/lib/notificationContext";

function getTimeAgo(timestamp: string): string {
  try {
    const diff = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
    if (diff < 60) return "Baru saja";
    if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
    return `${Math.floor(diff / 86400)} hari lalu`;
  } catch {
    return "Baru saja";
  }
}

const PRIORITY_BADGE: Record<string, string> = {
  Critical: "bg-red-500",
  High: "bg-orange-500",
  Medium: "bg-amber-500",
  Low: "bg-emerald-500",
};

export function NotificationBell() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    openDetail,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleItemClick = (notif: AppNotification) => {
    markAsRead(notif.id);
    setIsOpen(false);
    openDetail(notif.caseItem);
  };

  return (
    <div className="relative print:hidden" ref={panelRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700/80 text-slate-300 hover:text-white transition-all shadow-xs cursor-pointer focus:outline-none"
        title="Pemberitahuan Kasus Baru"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white shadow-sm animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Floating Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 text-slate-900 animate-in fade-in zoom-in-95 duration-100">
          {/* Header */}
          <div className="bg-[#1E293B] text-white px-4 py-3 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-black tracking-wide">
                Notifikasi Kasus Lapangan
              </span>
              {unreadCount > 0 && (
                <span className="bg-amber-400/20 text-amber-300 text-[10px] font-bold px-1.5 py-0.2 rounded-md border border-amber-400/30">
                  {unreadCount} baru
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="p-1 text-slate-400 hover:text-amber-300 text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                  title="Tandai semua sudah dibaca"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Semua Dibaca</span>
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={clearNotifications}
                  className="p-1 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                  title="Hapus semua notifikasi"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* List Content */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Bell className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-slate-700">Belum Ada Notifikasi</div>
                <p className="text-[11px] text-slate-400 max-w-[200px] mx-auto">
                  Setiap kasus baru yang diinput di lapangan akan memunculkan pemberitahuan di sini.
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleItemClick(notif)}
                  className={`p-3 hover:bg-slate-50 transition-colors cursor-pointer flex items-start gap-2.5 ${
                    !notif.read ? "bg-amber-500/5 font-medium" : "opacity-80"
                  }`}
                >
                  {/* Priority Indicator Dot */}
                  <span
                    className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      PRIORITY_BADGE[notif.priority] || "bg-slate-400"
                    }`}
                  />

                  {/* Text Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {notif.title}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0 font-normal">
                        {getTimeAgo(notif.timestamp)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5 leading-snug">
                      {notif.message}
                    </p>
                    <div className="mt-1.5 flex items-center gap-1 text-[10px] text-amber-600 font-bold hover:underline">
                      <span>Lihat Rincian</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>

                  {/* Unread indicator */}
                  {!notif.read && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
