"use client";

import React, { useRef } from "react";
import { Calendar, Clock, RotateCcw, FileDown, SlidersHorizontal } from "lucide-react";
import { FilterState, MasterArea, MasterCategory } from "@/lib/types";

interface FilterBarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  areas: MasterArea[];
  categories: MasterCategory[];
  lastUpdated?: string;
  onReset: () => void;
  onExportPdf?: () => void;
}

export function GlobalFilterBar({
  filters,
  onChange,
  areas,
  categories,
  lastUpdated = "06/10/2026 14:32",
  onReset,
  onExportPdf,
}: FilterBarProps) {
  const startInputRef = useRef<HTMLInputElement>(null);
  const endInputRef = useRef<HTMLInputElement>(null);

  const updateField = (field: keyof FilterState, value: string) => {
    onChange({ ...filters, [field]: value });
  };

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-200/90 p-4 mb-5 print:hidden">
      {/* Top Action Toolbar: Title + Last Updated + Reset + Download PDF */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600">
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </div>
          <div>
            <h2 className="text-xs font-black text-slate-900 tracking-wide uppercase">
              Filter Data Kasus
            </h2>
            <p className="text-[10px] text-slate-400">
              Saring KPI &amp; grafik secara dinamis
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Last Updated Badge */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/90 rounded-xl px-3 py-1.5 text-[11px] text-slate-600 font-medium">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[10px] text-slate-400">Update:</span>
            <span className="font-bold text-slate-800">{lastUpdated}</span>
          </div>

          {/* Reset Filter Button */}
          <button
            onClick={onReset}
            title="Reset Seluruh Filter"
            className="flex items-center gap-1.5 px-3 py-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl border border-slate-200/90 text-xs font-bold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          {/* Download PDF Button */}
          {onExportPdf && (
            <button
              onClick={onExportPdf}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800 rounded-xl text-xs font-black shadow-sm transition-all cursor-pointer whitespace-nowrap"
              title="Cetak atau Simpan Dashboard ke Dokumen PDF"
            >
              <FileDown className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Download PDF</span>
            </button>
          )}
        </div>
      </div>

      {/* Bottom Filter Controls (5 Spacious Columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 pt-3.5">
        {/* 1. Periode Monitoring */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Periode Tanggal
              </label>
            </div>
            {(filters.startDate || filters.endDate) && (
              <button
                type="button"
                onClick={() => {
                  onChange({ ...filters, startDate: "", endDate: "" });
                }}
                className="text-[10px] font-bold text-amber-600 hover:text-amber-700 cursor-pointer"
                title="Hapus Filter Tanggal"
              >
                Reset Tgl
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <div
              onClick={() => {
                try {
                  startInputRef.current?.showPicker();
                } catch {}
              }}
              className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-xs text-slate-700 hover:bg-slate-100/80 focus-within:ring-2 focus-within:ring-amber-500 focus-within:bg-white cursor-pointer transition-all"
              title="Klik untuk memilih Tanggal Mulai"
            >
              <input
                ref={startInputRef}
                type="date"
                value={filters.startDate}
                onChange={(e) => updateField("startDate", e.target.value)}
                onClick={(e) => {
                  try {
                    e.currentTarget.showPicker();
                  } catch {}
                }}
                className="w-full bg-transparent border-none p-0 text-[11px] text-slate-800 font-semibold focus:outline-none cursor-pointer"
                aria-label="Tanggal Mulai"
              />
            </div>
            <div
              onClick={() => {
                try {
                  endInputRef.current?.showPicker();
                } catch {}
              }}
              className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-xs text-slate-700 hover:bg-slate-100/80 focus-within:ring-2 focus-within:ring-amber-500 focus-within:bg-white cursor-pointer transition-all"
              title="Klik untuk memilih Tanggal Akhir"
            >
              <input
                ref={endInputRef}
                type="date"
                value={filters.endDate}
                onChange={(e) => updateField("endDate", e.target.value)}
                onClick={(e) => {
                  try {
                    e.currentTarget.showPicker();
                  } catch {}
                }}
                className="w-full bg-transparent border-none p-0 text-[11px] text-slate-800 font-semibold focus:outline-none cursor-pointer"
                aria-label="Tanggal Akhir"
              />
            </div>
          </div>
        </div>

        {/* 2. Project */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Project
          </label>
          <select
            value={filters.project}
            onChange={(e) => updateField("project", e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none"
          >
            <option value="NPN - Project BAT">NPN - Project BAT</option>
            <option value="Semua Project">Semua Project</option>
          </select>
        </div>

        {/* 3. Area */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Area
          </label>
          <select
            value={filters.area}
            onChange={(e) => updateField("area", e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none"
          >
            <option value="Semua Area">Semua Area</option>
            {areas.map((a) => (
              <option key={a.id} value={a.name}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        {/* 4. Kategori */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Kategori Kasus
          </label>
          <select
            value={filters.category}
            onChange={(e) => updateField("category", e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none"
          >
            <option value="Semua Kategori">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* 5. Status */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Status Kasus
          </label>
          <select
            value={filters.status}
            onChange={(e) => updateField("status", e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none"
          >
            <option value="Semua Status">Semua Status</option>
            <option value="Open">Open</option>
            <option value="On Progress">On Progress</option>
            <option value="Pending">Pending</option>
            <option value="Escalated">Escalated</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>
    </div>
  );
}
