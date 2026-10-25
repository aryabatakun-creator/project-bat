"use client";

import React, { useState, useMemo, useEffect } from "react";
import { GlobalFilterBar } from "@/components/dashboard/GlobalFilterBar";
import { KpiCards } from "@/components/dashboard/KpiCards";
import { VisualCharts } from "@/components/dashboard/VisualCharts";
import { CaseSummaryTable } from "@/components/dashboard/CaseSummaryTable";
import { ExecutivePrintReport } from "@/components/dashboard/ExecutivePrintReport";
import { CaseDetailModal } from "@/components/cases/CaseDetailModal";
import { CaseModal } from "@/components/cases/CaseModal";
import { CaseItem, FilterState } from "@/lib/types";
import { isOverdue } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import {
  fetchAllAppData,
  getCachedData,
  saveCaseItem,
  removeCaseItem,
} from "@/lib/dataService";
import { useNotifications } from "@/lib/notificationContext";

export default function DashboardPage() {
  const { addCaseNotification } = useNotifications();
  const [cases, setCases] = useState<CaseItem[]>(() => getCachedData().cases);
  const [areas, setAreas] = useState(() => getCachedData().areas);
  const [locations, setLocations] = useState(() => getCachedData().locations);
  const [categories, setCategories] = useState(() => getCachedData().categories);
  const [pics, setPics] = useState(() => getCachedData().pics);

  const [selectedCase, setSelectedCase] = useState<CaseItem | null>(null);
  const [editingCase, setEditingCase] = useState<CaseItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Filters State (Default: tampilkan seluruh periode agar semua data Supabase tampil)
  const defaultFilters: FilterState = {
    startDate: "",
    endDate: "",
    project: "BAT",
    area: "Semua Area",
    category: "Semua Kategori",
    status: "Semua Status",
  };
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  // Load from Supabase & local persistence (with realtime sync and focus/visibility change)
  useEffect(() => {
    const loadData = () => {
      fetchAllAppData().then((res) => {
        setAreas(res.areas);
        setLocations(res.locations);
        setCategories(res.categories);
        setPics(res.pics);
        setCases(res.cases);
      });
    };

    loadData();

    // 1. Supabase Realtime Subscription for cases table
    const supabase = createClient();
    let channel: any = null;
    if (supabase) {
      channel = supabase
        .channel("dashboard-realtime")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "cases" },
          () => {
            loadData();
          }
        )
        .subscribe();
    }

    // 2. Window focus & visibility sync (e.g. returning to tab or app)
    const handleSync = () => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        loadData();
      }
    };

    window.addEventListener("focus", handleSync);
    document.addEventListener("visibilitychange", handleSync);
    return () => {
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
      window.removeEventListener("focus", handleSync);
      document.removeEventListener("visibilitychange", handleSync);
    };
  }, []);

  // Filtered Cases
  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      if (filters.area !== "Semua Area" && c.area_name !== filters.area) {
        if (!c.area_name?.startsWith(filters.area)) return false;
      }
      if (
        filters.category !== "Semua Kategori" &&
        c.category_name !== filters.category
      ) {
        return false;
      }
      if (filters.status !== "Semua Status" && c.status !== filters.status) {
        return false;
      }
      if (filters.startDate && c.date_reported < filters.startDate) {
        return false;
      }
      if (filters.endDate && c.date_reported > filters.endDate) {
        return false;
      }
      return true;
    });
  }, [cases, filters]);

  // Compute 8 KPIs
  const kpiData = useMemo(() => {
    const total = filteredCases.length;
    let open = 0;
    let onProgress = 0;
    let pending = 0;
    let escalated = 0;
    let closed = 0;
    let overdue = 0;

    filteredCases.forEach((c) => {
      if (c.status === "Open") open++;
      else if (c.status === "On Progress") onProgress++;
      else if (c.status === "Pending") pending++;
      else if (c.status === "Escalated") escalated++;
      else if (c.status === "Closed") closed++;

      if (isOverdue(c.target_date, c.status)) {
        overdue++;
      }
    });

    const closureRate = total > 0 ? (closed / total) * 100 : 0;

    return {
      total,
      open,
      onProgress,
      pending,
      escalated,
      closed,
      overdue,
      closureRate,
    };
  }, [filteredCases]);

  const handleView = (item: CaseItem) => {
    setSelectedCase(item);
    setIsDetailOpen(true);
  };

  const handleEdit = (item: CaseItem) => {
    setEditingCase(item);
    setIsEditOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus kasus ini?")) {
      const updatedCases = await removeCaseItem(id, cases);
      setCases(updatedCases);
    }
  };

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

  const handleExportPdf = () => {
    window.print();
  };

  const lastUpdateStr = useMemo(() => {
    return new Date().toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }, []);

  return (
    <div>
      {/* Dedicated Clean Print / PDF Report (Only shown when printing/saving PDF) */}
      <ExecutivePrintReport
        cases={filteredCases}
        filters={filters}
        kpiData={kpiData}
      />

      {/* Interactive Screen Dashboard (Hidden during PDF print) */}
      <div className="space-y-4 print:hidden">
        {/* 1. Global Filter Bar */}
        <GlobalFilterBar
          filters={filters}
          onChange={setFilters}
          areas={areas}
          categories={categories}
          lastUpdated={lastUpdateStr}
          onReset={() => setFilters(defaultFilters)}
          onExportPdf={handleExportPdf}
        />

        {/* 2. 8 KPI Cards */}
        <KpiCards data={kpiData} />

        {/* 3. 4 Visual Charts */}
        <VisualCharts cases={filteredCases} />

        {/* 4. Data Table Summary */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 tracking-wide">
              Daftar Monitoring Kasus Terkini ({filteredCases.length})
            </h2>
          </div>
          <CaseSummaryTable
            cases={filteredCases}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {/* Detail Modal */}
      <CaseDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        caseItem={selectedCase}
        onEdit={handleEdit}
      />

      {/* Edit Modal */}
      <CaseModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSave={handleSaveEdit}
        initialData={editingCase}
        areas={areas}
        locations={locations}
        categories={categories}
        pics={pics}
      />
    </div>
  );
}
