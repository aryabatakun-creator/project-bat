"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  LabelList
} from "recharts";
import { CaseItem } from "@/lib/types";

interface ChartsProps {
  cases: CaseItem[];
}

const STATUS_COLORS: Record<string, string> = {
  Open: "#EF4444",
  "On Progress": "#F59E0B",
  Pending: "#94A3B8",
  Escalated: "#F97316",
  Closed: "#10B981",
};

const PRIORITY_COLORS: Record<string, string> = {
  Critical: "#B91C1C",
  High: "#EF4444",
  Medium: "#F59E0B",
  Low: "#10B981",
};

const CATEGORY_COLORS = [
  "#0284C7", // Sky
  "#0EA5E9",
  "#6366F1", // Indigo
  "#F59E0B", // Amber
  "#EC4899", // Pink
  "#14B8A6", // Teal
  "#10B981", // Emerald
  "#84CC16", // Lime
  "#64748B", // Slate
];

export function VisualCharts({ cases }: ChartsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-64 bg-white rounded-xl shadow-xs border border-slate-200 animate-pulse mb-5" />;
  }

  // 1. Status Data
  const statusCounts: Record<string, number> = {
    Open: 0,
    "On Progress": 0,
    Pending: 0,
    Escalated: 0,
    Closed: 0,
  };
  cases.forEach((c) => {
    if (statusCounts[c.status] !== undefined) {
      statusCounts[c.status]++;
    }
  });
  const statusData = Object.keys(statusCounts).map((key) => ({
    name: key,
    count: statusCounts[key],
    fill: STATUS_COLORS[key] || "#94A3B8",
  }));

  // 2. Category Data
  const categoryCounts: Record<string, number> = {};
  cases.forEach((c) => {
    const cat = c.category_name || "Lainnya";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });
  const categoryData = Object.keys(categoryCounts).map((cat, idx) => ({
    name: cat,
    value: categoryCounts[cat],
    color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
  }));

  // 3. Priority Data
  const priorityCounts: Record<string, number> = {
    Critical: 0,
    High: 0,
    Medium: 0,
    Low: 0,
  };
  cases.forEach((c) => {
    if (priorityCounts[c.priority] !== undefined) {
      priorityCounts[c.priority]++;
    }
  });
  const priorityData = Object.keys(priorityCounts)
    .filter((p) => priorityCounts[p] > 0)
    .map((p) => ({
      name: p,
      value: priorityCounts[p],
      fill: PRIORITY_COLORS[p] || "#94A3B8",
    }));

  // 4. Area Data
  const areaCounts: Record<string, number> = {};
  cases.forEach((c) => {
    const area = c.area_name ? c.area_name.split(" - ")[0] : "Lainnya";
    areaCounts[area] = (areaCounts[area] || 0) + 1;
  });
  const areaData = Object.keys(areaCounts)
    .map((area) => ({
      name: area,
      count: areaCounts[area],
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5 mb-5">
      {/* Chart 1: Status Case */}
      <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200 flex flex-col">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
          Status Case
        </h3>
        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statusData} margin={{ top: 20, right: 10, left: -25, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748B" }} interval={0} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#64748B" }} />
              <Tooltip />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                <LabelList dataKey="count" position="top" style={{ fontSize: 11, fontWeight: 'bold', fill: '#1E293B' }} />
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Kategori Case */}
      <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200 flex flex-col">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
          Kategori Case
        </h3>
        <div className="h-52 w-full flex items-center">
          <div className="w-1/2 h-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip />
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={28}
                  outerRadius={55}
                  paddingAngle={2}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cat-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-1/2 max-h-48 overflow-y-auto pl-2 text-[10px] space-y-1">
            {categoryData.map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="w-2 h-2 rounded-xs shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-slate-600 truncate">{cat.name}</span>
                </div>
                <span className="font-bold text-slate-800 shrink-0">{cat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chart 3: Prioritas Case */}
      <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200 flex flex-col">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
          Prioritas Case
        </h3>
        <div className="h-52 w-full flex items-center">
          <div className="w-3/5 h-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip />
                <Pie
                  data={priorityData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={55}
                  paddingAngle={3}
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`pri-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-2/5 pl-2 text-[11px] space-y-1.5">
            {priorityData.map((p, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: p.fill }}
                  />
                  <span className="text-slate-600 font-medium">{p.name}</span>
                </div>
                <span className="font-bold text-slate-900">{p.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chart 4: Case by Area */}
      <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200 flex flex-col">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
          Case by Area
        </h3>
        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={areaData}
              layout="vertical"
              margin={{ top: 5, right: 25, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10, fill: "#64748B" }} />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 10, fill: "#334155" }}
                width={70}
              />
              <Tooltip />
              <Bar dataKey="count" fill="#1E3A8A" radius={[0, 4, 4, 0]}>
                <LabelList dataKey="count" position="right" style={{ fontSize: 11, fontWeight: 'bold', fill: '#0F172A' }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
