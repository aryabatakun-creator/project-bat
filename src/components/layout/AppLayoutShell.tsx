"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { HeaderBranding } from "@/components/layout/HeaderBranding";
import { NotificationProvider, useNotifications } from "@/lib/notificationContext";
import { NotificationToast } from "@/components/notifications/NotificationToast";
import { CaseDetailModal } from "@/components/cases/CaseDetailModal";
import { CaseModal } from "@/components/cases/CaseModal";
import { fetchAllAppData, saveCaseItem, getCachedData } from "@/lib/dataService";
import { MasterArea, MasterLocation, MasterCategory, MasterPic, CaseItem } from "@/lib/types";

function GlobalNotificationHost() {
  const {
    detailCase,
    closeDetail,
    editingCase,
    openEdit,
    closeEdit,
    addCaseNotification,
  } = useNotifications();

  const [areas, setAreas] = useState<MasterArea[]>(() => getCachedData().areas);
  const [locations, setLocations] = useState<MasterLocation[]>(() => getCachedData().locations);
  const [categories, setCategories] = useState<MasterCategory[]>(() => getCachedData().categories);
  const [pics, setPics] = useState<MasterPic[]>(() => getCachedData().pics);
  const [cases, setCases] = useState<CaseItem[]>(() => getCachedData().cases);

  useEffect(() => {
    fetchAllAppData().then((res) => {
      setAreas(res.areas);
      setLocations(res.locations);
      setCategories(res.categories);
      setPics(res.pics);
      setCases(res.cases);
    });
  }, []);

  const handleSaveEdit = async (
    caseData: Partial<CaseItem>,
    photoFiles: File[] = []
  ) => {
    if (!editingCase) return;
    const { updatedCases } = await saveCaseItem(
      caseData,
      photoFiles,
      editingCase,
      cases
    );
    setCases(updatedCases);
    const updated = updatedCases.find((c) => c.id === editingCase.id);
    if (updated) {
      addCaseNotification(updated, false);
    }
  };

  return (
    <>
      <NotificationToast />

      {/* Global Case Detail Modal (Opened by Notification Click) */}
      <CaseDetailModal
        isOpen={Boolean(detailCase)}
        onClose={closeDetail}
        caseItem={detailCase}
        onEdit={(item) => {
          closeDetail();
          openEdit(item);
        }}
      />

      {/* Global Case Edit Modal (Opened via Detail modal Edit button) */}
      <CaseModal
        isOpen={Boolean(editingCase)}
        onClose={closeEdit}
        onSave={handleSaveEdit}
        initialData={editingCase}
        areas={areas}
        locations={locations}
        categories={categories}
        pics={pics}
      />
    </>
  );
}

export function AppLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith("/auth");

  if (isAuthPage) {
    return <main className="min-h-screen bg-slate-950">{children}</main>;
  }

  return (
    <NotificationProvider>
      <div className="flex min-h-screen print:block print:min-h-0">
        {/* Sidebar Left */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 relative print:overflow-visible print:block">
          <HeaderBranding />
          <main className="flex-1 p-4 md:p-6 overflow-y-auto print:p-0 print:overflow-visible print:block">
            {children}
          </main>
        </div>
      </div>
      <GlobalNotificationHost />
    </NotificationProvider>
  );
}
