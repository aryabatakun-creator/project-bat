"use client";

import React from "react";
import { Calendar, Clock, RotateCcw } from "lucide-react";
import { FilterState, MasterArea, MasterCategory } from "@/lib/types";

interface FilterBarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  areas: MasterArea[];
  categories: MasterCategory[];
  lastUpdated?: string;
  onReset: () => void;
}

export function GlobalFilterBar({
  filters,
  onChange,
  areas,
  categories,
  lastUpdated = "06/10/2026 14:32",
  onReset,
}: FilterBarProps) {
  const updateField = (field: keyof FilterState, value: string) => {
    onChange({ ...filters, [field]: value });
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-3.5 mb-5">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
        {/* 1. Periode Monitoring */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
            Periode Monitoring
          </label>
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => updateField("startDate", e.target.value)}
              className="bg-transparent border-none p-0 text-xs text-slate-800 focus:outline-none w-28"
            />
            <span className="text-slate-400">-</span>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => updateField("endDate", e.target.value)}
              className="bg-transparent border-none p-0 text-xs text-slate-800 focus:outline-none w-28"
            />
          </div>
        </div>

        {/* 2. Project */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
            Project
          </label>
          <select
            value={filters.project}
            onChange={(e) => updateField("project", e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:ring-1 focus:ring-amber-500 focus:outline-none"
          >
            <option value="Project BAT">Project BAT</option>
            <option value="Semua Project">Semua Project</option>
          </select>
        </div>

        {/* 3. Area / Lokasi */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
            Area / Lokasi
          </label>
          <select
            value={filters.area}
            onChange={(e) => updateField("area", e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:ring-1 focus:ring-amber-500 focus:outline-none"
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
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
            Kategori
          </label>
          <select
            value={filters.category}
            onChange={(e) => updateField("category", e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:ring-1 focus:ring-amber-500 focus:outline-none"
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
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => updateField("status", e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:ring-1 focus:ring-amber-500 focus:outline-none"
          >
            <option value="Semua Status">Semua Status</option>
            <option value="Open">Open</option>
            <option value="On Progress">On Progress</option>
            <option value="Pending">Pending</option>
            <option value="Escalated">Escalated</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        {/* 6. Last Updated & Reset */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
            <span className="block text-[10px] text-slate-400 font-medium">Last Updated</span>
            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700">
              <Clock className="w-3 h-3 text-slate-500" />
              <span>{lastUpdated}</span>
            </div>
          </div>
          <button
            onClick={onReset}
            title="Reset Filters"
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
