"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Plus, Search, Filter, Download } from "lucide-react";
import { CaseSummaryTable } from "@/components/dashboard/CaseSummaryTable";
import { CaseModal } from "@/components/cases/CaseModal";
import { CaseDetailModal } from "@/components/cases/CaseDetailModal";
import { CaseItem } from "@/lib/types";
import { useAuth } from "@/lib/authContext";
import { useNotifications } from "@/lib/notificationContext";
import { getAutoDownloadUrl } from "@/lib/utils";
import {
  fetchAllAppData,
  getCachedData,
  saveCaseItem,
  removeCaseItem,
} from "@/lib/dataService";

export default function CasesPage() {
  const { user } = useAuth();
  const { addCaseNotification } = useNotifications();
  const [cases, setCases] = useState<CaseItem[]>(() => getCachedData().cases);
  const [areas, setAreas] = useState(() => getCachedData().areas);
  const [locations, setLocations] = useState(() => getCachedData().locations);
  const [categories, setCategories] = useState(() => getCachedData().categories);
  const [pics, setPics] = useState(() => getCachedData().pics);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Semua");
  const [selectedCategory, setSelectedCategory] = useState("Semua");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<CaseItem | null>(null);
  const [selectedCase, setSelectedCase] = useState<CaseItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Load from Supabase & local persistence (with auto-sync on focus/visibility change)
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

    const handleSync = () => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        loadData();
      }
    };

    window.addEventListener("focus", handleSync);
    document.addEventListener("visibilitychange", handleSync);
    return () => {
      window.removeEventListener("focus", handleSync);
      document.removeEventListener("visibilitychange", handleSync);
    };
  }, []);

  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchTitle = c.case_title.toLowerCase().includes(query);
        const matchId = c.case_id.toLowerCase().includes(query);
        const matchPic = (c.pic_name || "").toLowerCase().includes(query);
        if (!matchTitle && !matchId && !matchPic) return false;
      }
      if (selectedStatus !== "Semua" && c.status !== selectedStatus) {
        return false;
      }
      if (selectedCategory !== "Semua" && c.category_name !== selectedCategory) {
        return false;
      }
      return true;
    });
  }, [cases, searchQuery, selectedStatus, selectedCategory]);

  const handleOpenCreate = () => {
    setEditingCase(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: CaseItem) => {
    setEditingCase(item);
    setIsModalOpen(true);
  };

  const handleSave = async (
    caseData: Partial<CaseItem>,
    photoFiles: File[] = []
  ) => {
    const isNew = !editingCase;
    const { updatedCases } = await saveCaseItem(
      caseData,
      photoFiles,
      editingCase,
      cases
    );
    setCases(updatedCases);
    const saved = editingCase
      ? updatedCases.find((c) => c.id === editingCase.id)
      : updatedCases[0];
    if (saved) {
      addCaseNotification(saved, isNew);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Hapus kasus ini dari database?")) {
      const updatedCases = await removeCaseItem(id, cases);
      setCases(updatedCases);
    }
  };

  const handleExportCSV = () => {
    const headers = [
      "Case ID",
      "Date Reported",
      "Category",
      "Case Title",
      "Area",
      "Lokasi",
      "Priority",
      "PIC",
      "Target Date",
      "Status",
      "Progress (%)",
      "Last Update",
      "Remarks",
      "URL Foto (Auto-Download)",
    ];
    const rows = filteredCases.map((c) => {
      const rawArea = c.area_name || "";
      const areaOnly = rawArea.includes(" - ") ? rawArea.split(" - ")[0] : rawArea;
      const locOnly =
        c.location_name ||
        (rawArea.includes(" - ") ? rawArea.split(" - ").slice(1).join(" - ") : "");

      const photoUrls = (c.attachments || [])
        .map((att) => getAutoDownloadUrl(att.file_url, att.file_name))
        .filter(Boolean);
      const photoUrlValue = photoUrls.join(" ; ");

      return [
        `"${(c.case_id || "").replace(/"/g, '""')}"`,
        `"${(c.date_reported || "").replace(/"/g, '""')}"`,
        `"${(c.category_name || "").replace(/"/g, '""')}"`,
        `"${(c.case_title || "").replace(/"/g, '""')}"`,
        `"${areaOnly.replace(/"/g, '""')}"`,
        `"${locOnly.replace(/"/g, '""')}"`,
        `"${(c.priority || "").replace(/"/g, '""')}"`,
        `"${(c.pic_name || "").replace(/"/g, '""')}"`,
        `"${(c.target_date || "").replace(/"/g, '""')}"`,
        `"${(c.status || "").replace(/"/g, '""')}"`,
        c.progress,
        `"${(c.last_update || "").replace(/"/g, '""')}"`,
        `"${(c.remarks || "").replace(/"/g, '""')}"`,
        `"${photoUrlValue.replace(/"/g, '""')}"`,
      ];
    });

    const csvContent =
      "\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `BAT_Case_Monitoring_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const canCreate = user.role === "admin" || user.role === "supervisor";

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-base font-bold text-slate-900 tracking-tight">
            Case Monitoring &amp; Follow-Up List
          </h1>
          <p className="text-xs text-slate-500">
            Daftar lengkap seluruh kasus operasional ({filteredCases.length} kasus)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          {canCreate && (
            <button
              onClick={handleOpenCreate}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4 text-slate-950" />
              <span>Input Kasus Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari Judul, Case ID, atau PIC..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
          />
        </div>

        {/* Filter Status */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 shrink-0">Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-xs text-slate-800 font-medium focus:ring-1 focus:ring-amber-500 focus:outline-none"
          >
            <option value="Semua">Semua Status</option>
            <option value="Open">Open</option>
            <option value="On Progress">On Progress</option>
            <option value="Pending">Pending</option>
            <option value="Escalated">Escalated</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        {/* Filter Kategori */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 shrink-0">Kategori:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-xs text-slate-800 font-medium focus:ring-1 focus:ring-amber-500 focus:outline-none"
          >
            <option value="Semua">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Component */}
      <CaseSummaryTable
        cases={filteredCases}
        onView={(item) => {
          setSelectedCase(item);
          setIsDetailOpen(true);
        }}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
      />

      {/* Create / Edit Modal */}
      <CaseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingCase}
        areas={areas}
        locations={locations}
        categories={categories}
        pics={pics}
      />

      {/* View Detail Modal */}
      <CaseDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        caseItem={selectedCase}
        onEdit={handleOpenEdit}
      />
    </div>
  );
}
