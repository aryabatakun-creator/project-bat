"use client";

import React, { useState, useMemo, useEffect } from "react";
import { GlobalFilterBar } from "@/components/dashboard/GlobalFilterBar";
import { KpiCards } from "@/components/dashboard/KpiCards";
import { VisualCharts } from "@/components/dashboard/VisualCharts";
import { CaseSummaryTable } from "@/components/dashboard/CaseSummaryTable";
import { CaseDetailModal } from "@/components/cases/CaseDetailModal";
import { CaseModal } from "@/components/cases/CaseModal";
import { 
  initialCases, 
  initialAreas, 
  initialCategories, 
  initialPics 
} from "@/lib/mockData";
import { CaseItem, FilterState } from "@/lib/types";
import { isOverdue } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

export default function DashboardPage() {
  const [cases, setCases] = useState<CaseItem[]>(initialCases);
  const [areas, setAreas] = useState(initialAreas);
  const [categories, setCategories] = useState(initialCategories);
  const [pics, setPics] = useState(initialPics);

  const [selectedCase, setSelectedCase] = useState<CaseItem | null>(null);
  const [editingCase, setEditingCase] = useState<CaseItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Filters State
  const defaultFilters: FilterState = {
    startDate: "2026-10-01",
    endDate: "2026-10-31",
    project: "Project BAT",
    area: "Semua Area",
    category: "Semua Kategori",
    status: "Semua Status",
  };
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  // Load from Supabase if connected
  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    // Load master data
    Promise.all([
      supabase.from("master_areas").select("*"),
      supabase.from("master_categories").select("*"),
      supabase.from("master_pics").select("*"),
      supabase.from("cases").select(`
        *,
        master_categories(name),
        master_areas(name),
        master_pics(name)
      `).order("date_reported", { ascending: false }),
    ]).then(([resAreas, resCats, resPics, resCases]) => {
      if (resAreas.data && resAreas.data.length > 0) setAreas(resAreas.data);
      if (resCats.data && resCats.data.length > 0) setCategories(resCats.data);
      if (resPics.data && resPics.data.length > 0) setPics(resPics.data);

      if (resCases.data) {
        const formatted: CaseItem[] = resCases.data.map((c: any) => ({
          ...c,
          category_name: c.master_categories?.name || c.category_name,
          area_name: c.master_areas?.name || c.area_name,
          pic_name: c.master_pics?.name || c.pic_name,
        }));
        setCases(formatted);
      }
    });
  }, []);

  // Filtered Cases
  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      if (filters.area !== "Semua Area" && c.area_name !== filters.area) {
        if (!c.area_name?.startsWith(filters.area)) return false;
      }
      if (filters.category !== "Semua Kategori" && c.category_name !== filters.category) {
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

  const handleDelete = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus kasus ini?")) {
      setCases((prev) => prev.filter((c) => c.id !== id));
      const supabase = createClient();
      if (supabase) {
        supabase.from("cases").delete().eq("id", id).then();
      }
    }
  };

  const handleSaveEdit = async (caseData: Partial<CaseItem>) => {
    if (!editingCase) return;
    const updated = {
      ...editingCase,
      ...caseData,
      last_update: new Date().toISOString().split("T")[0],
    };
    setCases((prev) => prev.map((c) => (c.id === editingCase.id ? updated : c)));

    const supabase = createClient();
    if (supabase) {
      await supabase.from("cases").update({
        case_title: updated.case_title,
        status: updated.status,
        progress: updated.progress,
        remarks: updated.remarks,
        priority: updated.priority,
        target_date: updated.target_date,
      }).eq("id", editingCase.id);
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Global Filter Bar */}
      <GlobalFilterBar
        filters={filters}
        onChange={setFilters}
        areas={areas}
        categories={categories}
        lastUpdated="06/10/2026 14:32"
        onReset={() => setFilters(defaultFilters)}
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

      {/* Detail Modal */}
      <CaseDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        caseItem={selectedCase}
      />

      {/* Edit Modal */}
      <CaseModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSave={handleSaveEdit}
        initialData={editingCase}
        areas={areas}
        categories={categories}
        pics={pics}
      />
    </div>
  );
}
