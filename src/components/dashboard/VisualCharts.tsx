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
  Pending: "#64748B",
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
  "#2563EB", // Blue
  "#0284C7", // Sky
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
    return <div className="h-64 bg-white rounded-2xl shadow-xs border border-slate-200 animate-pulse mb-5" />;
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
  const statusData = [
    { name: "Open", count: statusCounts["Open"], fill: STATUS_COLORS["Open"] },
    { name: "On Progress", count: statusCounts["On Progress"], fill: STATUS_COLORS["On Progress"] },
    { name: "Pending", count: statusCounts["Pending"], fill: STATUS_COLORS["Pending"] },
    { name: "Escalated", count: statusCounts["Escalated"], fill: STATUS_COLORS["Escalated"] },
    { name: "Closed", count: statusCounts["Closed"], fill: STATUS_COLORS["Closed"] },
  ];

  // 2. Category Data
  const totalCases = cases.length || 1;
  const categoryCounts: Record<string, number> = {};
  cases.forEach((c) => {
    const cat = c.category_name || "Lainnya";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });
  const categoryData = Object.keys(categoryCounts).map((cat, idx) => {
    const val = categoryCounts[cat];
    const pct = Math.round((val / totalCases) * 100);
    return {
      name: cat,
      value: val,
      pct,
      color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
    };
  });

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
    .map((p) => {
      const val = priorityCounts[p];
      const pct = Math.round((val / totalCases) * 100);
      return {
        name: p,
        value: val,
        pct,
        fill: PRIORITY_COLORS[p] || "#94A3B8",
      };
    });

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
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6 print:grid-cols-4 print:gap-2.5 print:mb-0">
      {/* Chart 1: Status Case */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/90 flex flex-col justify-between print:p-2.5 print:rounded-xl print:shadow-none">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Status Kasus
          </h3>
          <span className="text-[10px] text-slate-400 font-medium">Berdasarkan Status</span>
        </div>
        <div className="h-56 print:h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={statusData} 
              margin={{ top: 20, right: 10, left: -22, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 10, fill: "#475569", fontWeight: 600 }} 
                interval={0}
                angle={-25}
                textAnchor="end"
                height={35}
              />
              <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#64748B" }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0F172A', 
                  borderRadius: '8px', 
                  color: '#FFFFFF', 
                  border: 'none',
                  fontSize: '12px'
                }} 
              />
              <Bar dataKey="count" radius={[5, 5, 0, 0]} maxBarSize={38}>
                <LabelList 
                  dataKey="count" 
                  position="top" 
                  style={{ fontSize: 11, fontWeight: 'bold', fill: '#1E293B' }} 
                />
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Kategori Case */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/90 flex flex-col justify-between print:p-2.5 print:rounded-xl print:shadow-none">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Kategori Kasus
          </h3>
          <span className="text-[10px] text-slate-400 font-medium">{categoryData.length} Kategori</span>
        </div>
        <div className="h-56 print:h-44 w-full flex items-center">
          <div className="w-[45%] h-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip 
                  formatter={(value, name, props) => [
                    `${value} Kasus (${props?.payload?.pct ?? 0}%)`,
                    name,
                  ]}
                  contentStyle={{ 
                    backgroundColor: '#0F172A', 
                    borderRadius: '8px', 
                    color: '#FFFFFF', 
                    border: 'none',
                    fontSize: '11px'
                  }} 
                />
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={26}
                  outerRadius={52}
                  paddingAngle={2}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cat-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-[55%] pl-2 text-[10px] flex flex-col justify-center gap-1">
            {categoryData.map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between gap-1 py-0.5 border-b border-slate-100/70 last:border-none">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="w-2 h-2 rounded-xs shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-slate-600 truncate font-medium text-[9.5px] leading-tight">{cat.name}</span>
                </div>
                <span className="font-bold text-slate-900 shrink-0 text-[10px] whitespace-nowrap">
                  {cat.value} <span className="text-slate-500 font-semibold">({cat.pct}%)</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chart 3: Prioritas Case */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/90 flex flex-col justify-between print:p-2.5 print:rounded-xl print:shadow-none">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Prioritas Kasus
          </h3>
          <span className="text-[10px] text-slate-400 font-medium">Tingkat Urgensi</span>
        </div>
        <div className="h-56 print:h-44 w-full flex items-center">
          <div className="w-[46%] h-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip 
                  formatter={(value, name, props) => [
                    `${value} Kasus (${props?.payload?.pct ?? 0}%)`,
                    name,
                  ]}
                  contentStyle={{ 
                    backgroundColor: '#0F172A', 
                    borderRadius: '8px', 
                    color: '#FFFFFF', 
                    border: 'none',
                    fontSize: '11px'
                  }} 
                />
                <Pie
                  data={priorityData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={28}
                  outerRadius={54}
                  paddingAngle={3}
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`prio-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-[54%] pl-2 space-y-1.5">
            {priorityData.map((p, idx) => (
              <div key={idx} className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: p.fill }}
                  />
                  <span className="text-[11px] font-semibold text-slate-700">{p.name}</span>
                </div>
                <span className="text-[10.5px] font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded-md whitespace-nowrap">
                  {p.value} <span className="text-slate-500 font-semibold">({p.pct}%)</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chart 4: Case by Area */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/90 flex flex-col justify-between print:p-2.5 print:rounded-xl print:shadow-none">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Kasus per Area
          </h3>
          <span className="text-[10px] text-slate-400 font-medium">Top 5 Area</span>
        </div>
        <div className="h-56 print:h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={areaData}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 15, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10, fill: "#64748B" }} />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 10, fill: "#475569", fontWeight: 600 }}
                width={80}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0F172A', 
                  borderRadius: '8px', 
                  color: '#FFFFFF', 
                  border: 'none',
                  fontSize: '11px'
                }} 
              />
              <Bar dataKey="count" fill="#1E3A8A" radius={[0, 6, 6, 0]} barSize={18}>
                <LabelList 
                  dataKey="count" 
                  position="right" 
                  style={{ fontSize: 11, fontWeight: 'bold', fill: '#1E293B' }} 
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
