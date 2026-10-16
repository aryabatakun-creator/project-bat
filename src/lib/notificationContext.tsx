"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { CaseItem, PriorityLevel } from "./types";
import { getCachedData } from "./dataService";

export interface AppNotification {
  id: string;
  caseId: string;
  caseItem: CaseItem;
  title: string;
  message: string;
  timestamp: string;
  priority: PriorityLevel;
  read: boolean;
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  addCaseNotification: (item: CaseItem, isNew?: boolean) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  // Global modal state so clicking a notification from anywhere opens detail
  detailCase: CaseItem | null;
  openDetail: (item: CaseItem) => void;
  closeDetail: () => void;
  // Trigger edit modal if user clicks Edit in detail
  editingCase: CaseItem | null;
  openEdit: (item: CaseItem) => void;
  closeEdit: () => void;
  // Toast state
  latestToast: AppNotification | null;
  dismissToast: () => void;
}

const STORAGE_KEY = "bat_notifications_v2";

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  addCaseNotification: () => {},
  markAsRead: () => {},
  markAllAsRead: () => {},
  clearNotifications: () => {},
  detailCase: null,
  openDetail: () => {},
  closeDetail: () => {},
  editingCase: null,
  openEdit: () => {},
  closeEdit: () => {},
  latestToast: null,
  dismissToast: () => {},
});

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
      } catch {
        // fallback
      }
    }
    // Default initial seed from recent cases
    try {
      const cases = getCachedData().cases;
      return cases.slice(0, 3).map((item, idx) => {
        const rawArea = item.area_name || "Semua Area";
        const areaName = rawArea.includes(" - ") ? rawArea.split(" - ")[0] : rawArea;
        const locName = item.location_name || (rawArea.includes(" - ") ? rawArea.split(" - ").slice(1).join(" - ") : "");
        return {
          id: `seed-notif-${item.case_id}-${idx}`,
          caseId: item.case_id,
          caseItem: item,
          title: `Kasus Baru: ${item.case_id}`,
          message: `${item.case_title} (${areaName}${locName ? ` - ${locName}` : ""})`,
          timestamp: new Date(Date.now() - (idx + 1) * 3600000 * 2).toISOString(),
          priority: item.priority || "Medium",
          read: idx > 0, // 1st is unread
        };
      });
    } catch {
      return [];
    }
  });

  const [detailCase, setDetailCase] = useState<CaseItem | null>(null);
  const [editingCase, setEditingCase] = useState<CaseItem | null>(null);
  const [latestToast, setLatestToast] = useState<AppNotification | null>(null);

  // Sync to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
      } catch {
        // ignore
      }
    }
  }, [notifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const addCaseNotification = useCallback((item: CaseItem, isNew: boolean = true) => {
    const rawArea = item.area_name || "Semua Area";
    const areaName = rawArea.includes(" - ") ? rawArea.split(" - ")[0] : rawArea;
    const locName = item.location_name || (rawArea.includes(" - ") ? rawArea.split(" - ").slice(1).join(" - ") : "");

    const newNotif: AppNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      caseId: item.case_id,
      caseItem: item,
      title: isNew ? `Kasus Baru: ${item.case_id}` : `Update Kasus: ${item.case_id}`,
      message: `${item.case_title} (${areaName}${locName ? ` - ${locName}` : ""})`,
      timestamp: new Date().toISOString(),
      priority: item.priority || "Medium",
      read: false,
    };

    setNotifications((prev) => [newNotif, ...prev.slice(0, 49)]); // Keep up to 50
    setLatestToast(newNotif);

    // Auto dismiss toast after 5s
    setTimeout(() => {
      setLatestToast((curr) => (curr?.id === newNotif.id ? null : curr));
    }, 5000);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const openDetail = useCallback((item: CaseItem) => {
    setDetailCase(item);
  }, []);

  const closeDetail = useCallback(() => {
    setDetailCase(null);
  }, []);

  const openEdit = useCallback((item: CaseItem) => {
    setEditingCase(item);
  }, []);

  const closeEdit = useCallback(() => {
    setEditingCase(null);
  }, []);

  const dismissToast = useCallback(() => {
    setLatestToast(null);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addCaseNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications,
        detailCase,
        openDetail,
        closeDetail,
        editingCase,
        openEdit,
        closeEdit,
        latestToast,
        dismissToast,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
