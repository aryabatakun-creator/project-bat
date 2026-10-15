"use client";

import React from "react";
import { 
  ClipboardList, 
  AlertTriangle, 
  Clock, 
  PauseCircle, 
  ArrowUpRight, 
  CheckCircle2, 
  CalendarClock,
  PieChart
} from "lucide-react";

interface KpiData {
  total: number;
  open: number;
  onProgress: number;
  pending: number;
  escalated: number;
  closed: number;
  overdue: number;
  closureRate: number;
}

export function KpiCards({ data }: { data: KpiData }) {
  // SVG circular progress calculation for Closure Rate
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (data.closureRate / 100) * circumference;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3 mb-5">
      {/* 1. Total Case */}
      <div className="bg-[#0F172A] text-white rounded-xl p-3.5 flex flex-col justify-between shadow-xs">
        <div className="flex items-center justify-between mb-1">
          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300">
            <ClipboardList className="w-4 h-4 text-slate-200" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
            Total Case
          </span>
        </div>
        <div className="text-2xl font-extrabold text-white text-center py-1">
          {data.total}
        </div>
      </div>

      {/* 2. Open */}
      <div className="bg-[#EF4444] text-white rounded-xl p-3.5 flex flex-col justify-between shadow-xs">
        <div className="flex items-center justify-between mb-1">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-red-100">
            Open
          </span>
        </div>
        <div className="text-2xl font-extrabold text-white text-center py-1">
          {data.open}
        </div>
      </div>

      {/* 3. On Progress */}
      <div className="bg-[#F59E0B] text-slate-950 rounded-xl p-3.5 flex flex-col justify-between shadow-xs">
        <div className="flex items-center justify-between mb-1">
          <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center text-white">
            <Clock className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-950">
            On Progress
          </span>
        </div>
        <div className="text-2xl font-extrabold text-slate-950 text-center py-1">
          {data.onProgress}
        </div>
      </div>

      {/* 4. Pending */}
      <div className="bg-[#64748B] text-white rounded-xl p-3.5 flex flex-col justify-between shadow-xs">
        <div className="flex items-center justify-between mb-1">
          <div className="w-8 h-8 rounded-lg bg-slate-600 flex items-center justify-center text-white">
            <PauseCircle className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-200">
            Pending
          </span>
        </div>
        <div className="text-2xl font-extrabold text-white text-center py-1">
          {data.pending}
        </div>
      </div>

      {/* 5. Escalated */}
      <div className="bg-[#F97316] text-white rounded-xl p-3.5 flex flex-col justify-between shadow-xs">
        <div className="flex items-center justify-between mb-1">
          <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white">
            <ArrowUpRight className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-orange-100">
            Escalated
          </span>
        </div>
        <div className="text-2xl font-extrabold text-white text-center py-1">
          {data.escalated}
        </div>
      </div>

      {/* 6. Closed */}
      <div className="bg-[#10B981] text-white rounded-xl p-3.5 flex flex-col justify-between shadow-xs">
        <div className="flex items-center justify-between mb-1">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-100">
            Closed
          </span>
        </div>
        <div className="text-2xl font-extrabold text-white text-center py-1">
          {data.closed}
        </div>
      </div>

      {/* 7. Overdue */}
      <div className="bg-[#991B1B] text-white rounded-xl p-3.5 flex flex-col justify-between shadow-xs">
        <div className="flex items-center justify-between mb-1">
          <div className="w-8 h-8 rounded-lg bg-red-900 flex items-center justify-center text-white">
            <CalendarClock className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-red-200">
            Overdue
          </span>
        </div>
        <div className="text-2xl font-extrabold text-white text-center py-1">
          {data.overdue}
        </div>
      </div>

      {/* 8. Closure Rate */}
      <div className="bg-white border border-slate-200 text-slate-800 rounded-xl p-3.5 flex items-center justify-between shadow-xs">
        <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
          <svg className="w-14 h-14 transform -rotate-90">
            <circle
              cx="28"
              cy="28"
              r={radius}
              stroke="#E2E8F0"
              strokeWidth="5"
              fill="transparent"
            />
            <circle
              cx="28"
              cy="28"
              r={radius}
              stroke="#10B981"
              strokeWidth="5"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          <PieChart className="w-4 h-4 text-emerald-600 absolute" />
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            Closure Rate
          </span>
          <span className="text-lg font-extrabold text-slate-900 block leading-tight">
            {data.closureRate.toFixed(1).replace(".", ",")}%
          </span>
        </div>
      </div>
    </div>
  );
}
