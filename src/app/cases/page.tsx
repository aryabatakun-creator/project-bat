"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Plus, Search, Filter, Download } from "lucide-react";
import { CaseSummaryTable } from "@/components/dashboard/CaseSummaryTable";
import { CaseModal } from "@/components/cases/CaseModal";
import { CaseDetailModal } from "@/components/cases/CaseDetailModal";
import { 
  initialCases, 
  initialAreas, 
  initialCategories, 
  initialPics 
} from "@/lib/mockData";
import { CaseItem } from "@/lib/types";
import { useAuth } from "@/lib/authContext";
import { createClient } from "@/lib/supabase/client";

export default function CasesPage() {
  const { user } = useAuth();
  const [cases, setCases] = useState<CaseItem[]>(initialCases);
  const [areas, setAreas] = useState(initialAreas);
  const [categories, setCategories] = useState(initialCategories);
  const [pics, setPics] = useState(initialPics);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Semua");
  const [selectedCategory, setSelectedCategory] = useState("Semua");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<CaseItem | null>(null);
  const [selectedCase, setSelectedCase] = useState<CaseItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Load from Supabase if connected
  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

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

  const handleSave = async (caseData: Partial<CaseItem>) => {
    if (editingCase) {
      // Update
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
          category_id: caseData.category_id || null,
          area_id: caseData.area_id || null,
          pic_id: caseData.pic_id || null,
        }).eq("id", editingCase.id);
      }
    } else {
      // Create new
      const reportDate = caseData.date_reported || new Date().toISOString().split("T")[0];
      const caseYear = new Date(reportDate).getFullYear();
      const existingYearCases = cases.filter((c) => c.case_id?.startsWith(`BAT-${caseYear}-`));
      const nextNum = existingYearCases.length + 1;
      const newCaseId = `BAT-${caseYear}-${String(nextNum).padStart(3, "0")}`;

      const newCase: CaseItem = {
        id: `case-${Date.now()}`,
        case_id: newCaseId,
        date_reported: reportDate,
        case_title: caseData.case_title || "Kasus Baru",
        category_id: caseData.category_id,
        category_name: caseData.category_name || categories[0]?.name || "Operasional",
        area_id: caseData.area_id,
        area_name: caseData.area_name || areas[0]?.name || "Malang",
        priority: caseData.priority || "Medium",
        pic_id: caseData.pic_id,
        pic_name: caseData.pic_name || pics[0]?.name || "PIC",
        target_date: caseData.target_date || new Date().toISOString().split("T")[0],
        status: caseData.status || "Open",
        progress: caseData.progress || 0,
        last_update: new Date().toISOString().split("T")[0],
        remarks: caseData.remarks || "",
      };

      setCases((prev) => [newCase, ...prev]);

      const supabase = createClient();
      if (supabase) {
        const { data: inserted } = await supabase.from("cases").insert({
          case_title: newCase.case_title,
          category_id: caseData.category_id || null,
          area_id: caseData.area_id || null,
          pic_id: caseData.pic_id || null,
          priority: newCase.priority,
          status: newCase.status,
          progress: newCase.progress,
          target_date: newCase.target_date,
          remarks: newCase.remarks,
        }).select(`
          *,
          master_categories(name),
          master_areas(name),
          master_pics(name)
        `).single();

        if (inserted) {
          setCases((prev) =>
            prev.map((c) =>
              c.id === newCase.id
                ? {
                    ...inserted,
                    category_name: inserted.master_categories?.name || c.category_name,
                    area_name: inserted.master_areas?.name || c.area_name,
                    pic_name: inserted.master_pics?.name || c.pic_name,
                  }
                : c
            )
          );
        }
      }
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Hapus kasus ini dari database?")) {
      setCases((prev) => prev.filter((c) => c.id !== id));
      const supabase = createClient();
      if (supabase) {
        supabase.from("cases").delete().eq("id", id).then();
      }
    }
  };

  const handleExportCSV = () => {
    const headers = [
      "Case ID",
      "Date Reported",
      "Category",
      "Case Title",
      "Area",
      "Priority",
      "PIC",
      "Target Date",
      "Status",
      "Progress (%)",
      "Last Update",
      "Remarks",
    ];
    const rows = filteredCases.map((c) => [
      c.case_id,
      c.date_reported,
      c.category_name,
      `"${c.case_title.replace(/"/g, '""')}"`,
      c.area_name,
      c.priority,
      c.pic_name,
      c.target_date,
      c.status,
      c.progress,
      c.last_update,
      `"${(c.remarks || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `BAT_Case_Monitoring_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        categories={categories}
        pics={pics}
      />

      {/* View Detail Modal */}
      <CaseDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        caseItem={selectedCase}
      />
    </div>
  );
}
