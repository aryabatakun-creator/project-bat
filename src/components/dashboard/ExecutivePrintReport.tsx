"use client";

import React from "react";
import { CaseItem, FilterState } from "@/lib/types";
import { formatDateIndo } from "@/lib/utils";

interface ExecutivePrintReportProps {
  cases: CaseItem[];
  filters: FilterState;
  kpiData: {
    total: number;
    open: number;
    onProgress: number;
    pending: number;
    escalated: number;
    closed: number;
    overdue: number;
    closureRate: number;
  };
}

const STATUS_COLORS: Record<string, string> = {
  Open: "#EF4444",
  "On Progress": "#F59E0B",
  Pending: "#64748B",
  Escalated: "#F97316",
  Closed: "#10B981",
};

const PRIORITY_COLORS: Record<string, string> = {
  Critical: "#991B1B",
  High: "#EF4444",
  Medium: "#F59E0B",
  Low: "#10B981",
};

const CATEGORY_COLORS = [
  "#2563EB",
  "#0284C7",
  "#6366F1",
  "#F59E0B",
  "#EC4899",
  "#14B8A6",
  "#10B981",
  "#84CC16",
  "#64748B",
];

/**
 * Pure deterministic SVG Donut Chart for reliable PDF printing without ResizeObserver
 */
function SvgDonutChart({
  items,
}: {
  items: { name: string; value: number; pct: number; color: string }[];
}) {
  const total = items.reduce((acc, i) => acc + i.value, 0);
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercent = 0;

  if (total === 0) {
    return (
      <svg viewBox="0 0 100 100" className="w-24 h-24 mx-auto">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="transparent"
          stroke="#E2E8F0"
          strokeWidth="16"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 100 100" className="w-24 h-24 shrink-0">
      {items.map((item, idx) => {
        const fraction = item.value / total;
        const strokeDasharray = `${fraction * circumference} ${circumference}`;
        const strokeDashoffset = -accumulatedPercent * circumference;
        accumulatedPercent += fraction;
        return (
          <circle
            key={idx}
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke={item.color}
            strokeWidth="16"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 50 50)"
          />
        );
      })}
      <circle cx="50" cy="50" r="22" fill="#FFFFFF" />
      <text
        x="50"
        y="53"
        textAnchor="middle"
        className="text-[11px] font-black fill-slate-800"
      >
        {total}
      </text>
    </svg>
  );
}

export function ExecutivePrintReport({
  cases,
  filters,
  kpiData,
}: ExecutivePrintReportProps) {
  const totalCases = cases.length || 1;

  // 1. Status Data
  const statusList = [
    { name: "Open", count: kpiData.open, color: STATUS_COLORS["Open"] },
    { name: "On Progress", count: kpiData.onProgress, color: STATUS_COLORS["On Progress"] },
    { name: "Pending", count: kpiData.pending, color: STATUS_COLORS["Pending"] },
    { name: "Escalated", count: kpiData.escalated, color: STATUS_COLORS["Escalated"] },
    { name: "Closed", count: kpiData.closed, color: STATUS_COLORS["Closed"] },
  ];
  const maxStatusCount = Math.max(...statusList.map((s) => s.count), 1);

  // 2. Category Data
  const catCounts: Record<string, number> = {};
  cases.forEach((c) => {
    const cat = c.category_name || "Lainnya";
    catCounts[cat] = (catCounts[cat] || 0) + 1;
  });
  const categoryList = Object.keys(catCounts).map((cat, idx) => ({
    name: cat,
    value: catCounts[cat],
    pct: Math.round((catCounts[cat] / totalCases) * 100),
    color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
  }));

  // 3. Priority Data
  const prioCounts: Record<string, number> = {
    Critical: 0,
    High: 0,
    Medium: 0,
    Low: 0,
  };
  cases.forEach((c) => {
    if (prioCounts[c.priority] !== undefined) prioCounts[c.priority]++;
  });
  const priorityList = Object.keys(prioCounts)
    .filter((p) => prioCounts[p] > 0)
    .map((p) => ({
      name: p,
      value: prioCounts[p],
      pct: Math.round((prioCounts[p] / totalCases) * 100),
      color: PRIORITY_COLORS[p] || "#64748B",
    }));

  // 4. Area Data
  const areaCounts: Record<string, number> = {};
  cases.forEach((c) => {
    const raw = c.area_name || "Lainnya";
    const area = raw.includes(" - ") ? raw.split(" - ")[0] : raw;
    areaCounts[area] = (areaCounts[area] || 0) + 1;
  });
  const areaList = Object.keys(areaCounts)
    .map((name) => ({
      name,
      count: areaCounts[name],
      pct: Math.round((areaCounts[name] / totalCases) * 100),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  const maxAreaCount = Math.max(...areaList.map((a) => a.count), 1);

  const printDate = new Date().toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="hidden print:block w-full text-slate-900 bg-white">
      {/* ==================== PAGE 1: EXECUTIVE SUMMARY (KPI + 4 CHARTS) ==================== */}
      <div className="space-y-3">
        {/* Banner Header */}
        <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2.5">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-slate-900 text-amber-400 font-black text-xs px-2 py-0.5 rounded">
                PROJECT BAT
              </span>
              <h1 className="text-base font-black text-slate-900 tracking-tight uppercase">
                Executive Case Monitoring &amp; Follow-Up Report
              </h1>
            </div>
            <p className="text-[10px] text-slate-600 mt-0.5 font-medium">
              Filter Area: <strong>{filters.area}</strong> &bull; Kategori:{" "}
              <strong>{filters.category}</strong> &bull; Status:{" "}
              <strong>{filters.status}</strong>
              {filters.startDate || filters.endDate
                ? ` • Periode: ${filters.startDate || "Awal"} s/d ${filters.endDate || "Sekarang"}`
                : " • Periode: Semua Periode"}
            </p>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-bold text-slate-800">
              Tanggal Cetak: {printDate}
            </div>
            <div className="text-[9px] text-slate-500">
              Total Data Terfilter: {cases.length} Kasus
            </div>
          </div>
        </div>

        {/* 8 KPI Summary Cards */}
        <div className="grid grid-cols-8 gap-2">
          <div className="border border-slate-300 rounded-lg p-2 bg-slate-50">
            <div className="text-[8px] font-bold uppercase text-slate-500">Total Case</div>
            <div className="text-lg font-black text-slate-900 leading-tight mt-0.5">
              {kpiData.total}
            </div>
            <div className="text-[8px] text-slate-500">Seluruh Kasus</div>
          </div>

          <div className="border border-red-200 rounded-lg p-2 bg-red-50/40">
            <div className="text-[8px] font-bold uppercase text-red-700">Open</div>
            <div className="text-lg font-black text-red-600 leading-tight mt-0.5">
              {kpiData.open}
            </div>
            <div className="text-[8px] text-slate-500">Belum Diproses</div>
          </div>

          <div className="border border-amber-200 rounded-lg p-2 bg-amber-50/40">
            <div className="text-[8px] font-bold uppercase text-amber-700">On Progress</div>
            <div className="text-lg font-black text-amber-600 leading-tight mt-0.5">
              {kpiData.onProgress}
            </div>
            <div className="text-[8px] text-slate-500">Sedang Ditangani</div>
          </div>

          <div className="border border-slate-300 rounded-lg p-2 bg-slate-50">
            <div className="text-[8px] font-bold uppercase text-slate-600">Pending</div>
            <div className="text-lg font-black text-slate-700 leading-tight mt-0.5">
              {kpiData.pending}
            </div>
            <div className="text-[8px] text-slate-500">Menunggu Keputusan</div>
          </div>

          <div className="border border-orange-200 rounded-lg p-2 bg-orange-50/40">
            <div className="text-[8px] font-bold uppercase text-orange-700">Escalated</div>
            <div className="text-lg font-black text-orange-600 leading-tight mt-0.5">
              {kpiData.escalated}
            </div>
            <div className="text-[8px] text-slate-500">Eskalasi Manajemen</div>
          </div>

          <div className="border border-emerald-200 rounded-lg p-2 bg-emerald-50/40">
            <div className="text-[8px] font-bold uppercase text-emerald-700">Closed</div>
            <div className="text-lg font-black text-emerald-600 leading-tight mt-0.5">
              {kpiData.closed}
            </div>
            <div className="text-[8px] text-slate-500">Kasus Selesai</div>
          </div>

          <div className="border border-rose-200 rounded-lg p-2 bg-rose-50/40">
            <div className="text-[8px] font-bold uppercase text-rose-700">Overdue</div>
            <div className="text-lg font-black text-rose-600 leading-tight mt-0.5">
              {kpiData.overdue}
            </div>
            <div className="text-[8px] text-slate-500">Lewat Target Date</div>
          </div>

          <div className="border border-slate-800 rounded-lg p-2 bg-slate-900 text-white">
            <div className="text-[8px] font-bold uppercase text-amber-400">Closure Rate</div>
            <div className="text-lg font-black text-white leading-tight mt-0.5">
              {kpiData.closureRate.toFixed(0)}%
            </div>
            <div className="text-[8px] text-slate-300">Rasio Penyelesaian</div>
          </div>
        </div>

        {/* 4 Visual Charts Row (Deterministic Print Layout) */}
        <div className="grid grid-cols-4 gap-2.5">
          {/* Chart 1: Status Kasus */}
          <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
            <div className="flex items-center justify-between mb-2 border-b border-slate-100 pb-1">
              <span className="text-[9px] font-black uppercase text-slate-800">
                1. Status Kasus
              </span>
              <span className="text-[8px] text-slate-500">Distribusi Status</span>
            </div>
            <div className="space-y-1.5 pt-1">
              {statusList.map((s, i) => {
                const widthPct = Math.round((s.count / maxStatusCount) * 100);
                const totalPct = Math.round((s.count / totalCases) * 100);
                return (
                  <div key={i} className="space-y-0.5">
                    <div className="flex justify-between text-[8.5px] font-bold">
                      <span className="text-slate-700">{s.name}</span>
                      <span className="text-slate-900">
                        {s.count} ({totalPct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-sm overflow-hidden">
                      <div
                        className="h-full rounded-sm"
                        style={{
                          width: `${Math.max(widthPct, s.count > 0 ? 8 : 0)}%`,
                          backgroundColor: s.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chart 2: Kategori Kasus (Pie + %) */}
          <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
            <div className="flex items-center justify-between mb-2 border-b border-slate-100 pb-1">
              <span className="text-[9px] font-black uppercase text-slate-800">
                2. Kategori Kasus
              </span>
              <span className="text-[8px] text-slate-500">{categoryList.length} Kategori</span>
            </div>
            <div className="flex items-center gap-2">
              <SvgDonutChart items={categoryList} />
              <div className="flex-1 space-y-1 min-w-0">
                {categoryList.map((cat, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-[8px] border-b border-slate-100 pb-0.5 last:border-none"
                  >
                    <div className="flex items-center gap-1 min-w-0">
                      <span
                        className="w-2 h-2 rounded-xs shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="truncate text-slate-700 font-medium">
                        {cat.name}
                      </span>
                    </div>
                    <span className="font-bold text-slate-900 shrink-0 ml-1">
                      {cat.value} ({cat.pct}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chart 3: Prioritas Kasus (Pie + %) */}
          <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
            <div className="flex items-center justify-between mb-2 border-b border-slate-100 pb-1">
              <span className="text-[9px] font-black uppercase text-slate-800">
                3. Prioritas Kasus
              </span>
              <span className="text-[8px] text-slate-500">Tingkat Urgensi</span>
            </div>
            <div className="flex items-center gap-2">
              <SvgDonutChart items={priorityList} />
              <div className="flex-1 space-y-1.5 min-w-0">
                {priorityList.map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-[8.5px] border-b border-slate-100 pb-0.5 last:border-none"
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: p.color }}
                      />
                      <span className="font-semibold text-slate-700">{p.name}</span>
                    </div>
                    <span className="font-bold text-slate-900">
                      {p.value} ({p.pct}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chart 4: Kasus per Area */}
          <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
            <div className="flex items-center justify-between mb-2 border-b border-slate-100 pb-1">
              <span className="text-[9px] font-black uppercase text-slate-800">
                4. Kasus per Area
              </span>
              <span className="text-[8px] text-slate-500">Top 5 Area</span>
            </div>
            <div className="space-y-1.5 pt-1">
              {areaList.map((a, i) => {
                const widthPct = Math.round((a.count / maxAreaCount) * 100);
                return (
                  <div key={i} className="space-y-0.5">
                    <div className="flex justify-between text-[8.5px] font-bold">
                      <span className="text-slate-700 truncate">{a.name}</span>
                      <span className="text-slate-900 shrink-0">
                        {a.count} ({a.pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-sm overflow-hidden">
                      <div
                        className="h-full rounded-sm bg-[#1E3A8A]"
                        style={{
                          width: `${Math.max(widthPct, a.count > 0 ? 10 : 0)}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ==================== DAFTAR RINCIAN KASUS TABLE ==================== */}
        <div className="pt-1">
          <div className="flex items-center justify-between mb-1.5">
            <h2 className="text-[10px] font-black uppercase tracking-wider text-slate-900">
              Rincian Daftar Kasus Operasional ({cases.length} Kasus)
            </h2>
          </div>

          <table className="w-full border-collapse border border-slate-300 text-[8pt]">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="border border-slate-400 py-1 px-1.5 text-center w-6">No</th>
                <th className="border border-slate-400 py-1 px-1.5 text-left whitespace-nowrap">Case ID</th>
                <th className="border border-slate-400 py-1 px-1.5 text-left whitespace-nowrap">Tgl Lapor</th>
                <th className="border border-slate-400 py-1 px-1.5 text-left">Kategori</th>
                <th className="border border-slate-400 py-1 px-1.5 text-left">Judul Kasus</th>
                <th className="border border-slate-400 py-1 px-1.5 text-left whitespace-nowrap">Area</th>
                <th className="border border-slate-400 py-1 px-1.5 text-left whitespace-nowrap">Lokasi</th>
                <th className="border border-slate-400 py-1 px-1.5 text-center whitespace-nowrap">Prioritas</th>
                <th className="border border-slate-400 py-1 px-1.5 text-left whitespace-nowrap">PIC</th>
                <th className="border border-slate-400 py-1 px-1.5 text-left whitespace-nowrap">Target</th>
                <th className="border border-slate-400 py-1 px-1.5 text-center whitespace-nowrap">Status</th>
                <th className="border border-slate-400 py-1 px-1.5 text-center whitespace-nowrap">Progress</th>
                <th className="border border-slate-400 py-1 px-1.5 text-left">Remarks / Tindak Lanjut</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((item, idx) => {
                const rawArea = item.area_name || "-";
                const displayArea = rawArea.includes(" - ")
                  ? rawArea.split(" - ")[0]
                  : rawArea;
                const displayLoc =
                  item.location_name ||
                  (rawArea.includes(" - ")
                    ? rawArea.split(" - ").slice(1).join(" - ")
                    : "-");

                const prioColor = PRIORITY_COLORS[item.priority] || "#475569";
                const statusColor = STATUS_COLORS[item.status] || "#475569";

                return (
                  <tr key={item.id} className="even:bg-slate-50/70">
                    <td className="border border-slate-300 py-1 px-1.5 text-center font-bold">
                      {idx + 1}
                    </td>
                    <td className="border border-slate-300 py-1 px-1.5 font-bold whitespace-nowrap">
                      {item.case_id}
                    </td>
                    <td className="border border-slate-300 py-1 px-1.5 whitespace-nowrap">
                      {formatDateIndo(item.date_reported)}
                    </td>
                    <td className="border border-slate-300 py-1 px-1.5">
                      {item.category_name || "-"}
                    </td>
                    <td className="border border-slate-300 py-1 px-1.5 font-semibold text-slate-900">
                      {item.case_title}
                    </td>
                    <td className="border border-slate-300 py-1 px-1.5 font-semibold whitespace-nowrap">
                      {displayArea}
                    </td>
                    <td className="border border-slate-300 py-1 px-1.5 whitespace-nowrap">
                      {displayLoc}
                    </td>
                    <td className="border border-slate-300 py-1 px-1.5 text-center whitespace-nowrap">
                      <span
                        className="inline-block px-1.5 py-0.5 rounded text-[7pt] font-bold text-white"
                        style={{
                          backgroundColor: prioColor,
                          color: item.priority === "Medium" ? "#0F172A" : "#FFFFFF",
                        }}
                      >
                        {item.priority}
                      </span>
                    </td>
                    <td className="border border-slate-300 py-1 px-1.5 whitespace-nowrap">
                      {item.pic_name || "-"}
                    </td>
                    <td className="border border-slate-300 py-1 px-1.5 whitespace-nowrap">
                      {formatDateIndo(item.target_date)}
                    </td>
                    <td className="border border-slate-300 py-1 px-1.5 text-center whitespace-nowrap">
                      <span
                        className="inline-block px-1.5 py-0.5 rounded text-[7pt] font-bold"
                        style={{
                          backgroundColor: statusColor,
                          color: item.status === "On Progress" ? "#0F172A" : "#FFFFFF",
                        }}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="border border-slate-300 py-1 px-1.5 text-center font-bold whitespace-nowrap">
                      {item.progress}%
                    </td>
                    <td className="border border-slate-300 py-1 px-1.5 text-slate-700">
                      {item.remarks || "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
