"use client";

import React from "react";
import { 
  ClipboardList, 
  AlertCircle, 
  Clock, 
  PauseCircle, 
  AlertTriangle, 
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
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (data.closureRate / 100) * circumference;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3.5 mb-5">
      {/* 1. Total Case */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
            <ClipboardList className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Total
          </span>
        </div>
        <div>
          <span className="text-[11px] font-medium text-slate-500 block">Total Kasus</span>
          <div className="text-2xl xl:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
            {data.total}
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-500 flex items-center justify-between">
          <span>Semua Area</span>
          <span className="font-semibold text-slate-700">100%</span>
        </div>
      </div>

      {/* 2. Open */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <div className="w-8 h-8 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
            <AlertCircle className="w-4 h-4" />
          </div>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
            Baru
          </span>
        </div>
        <div>
          <span className="text-[11px] font-medium text-slate-500 block">Open</span>
          <div className="text-2xl xl:text-3xl font-black text-red-600 tracking-tight mt-0.5">
            {data.open}
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-500 flex items-center justify-between">
          <span>Menunggu aksi</span>
          <span className="font-semibold text-red-600">
            {data.total > 0 ? Math.round((data.open / data.total) * 100) : 0}%
          </span>
        </div>
      </div>

      {/* 3. On Progress */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <Clock className="w-4 h-4" />
          </div>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            Aktif
          </span>
        </div>
        <div>
          <span className="text-[11px] font-medium text-slate-500 block">On Progress</span>
          <div className="text-2xl xl:text-3xl font-black text-amber-600 tracking-tight mt-0.5">
            {data.onProgress}
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-500 flex items-center justify-between">
          <span>Pengerjaan</span>
          <span className="font-semibold text-amber-600">
            {data.total > 0 ? Math.round((data.onProgress / data.total) * 100) : 0}%
          </span>
        </div>
      </div>

      {/* 4. Pending */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
            <PauseCircle className="w-4 h-4" />
          </div>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            Hold
          </span>
        </div>
        <div>
          <span className="text-[11px] font-medium text-slate-500 block">Pending</span>
          <div className="text-2xl xl:text-3xl font-black text-slate-700 tracking-tight mt-0.5">
            {data.pending}
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-500 flex items-center justify-between">
          <span>Tunggu vendor</span>
          <span className="font-semibold text-slate-700">
            {data.total > 0 ? Math.round((data.pending / data.total) * 100) : 0}%
          </span>
        </div>
      </div>

      {/* 5. Escalated */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-200">
            Eskalasi
          </span>
        </div>
        <div>
          <span className="text-[11px] font-medium text-slate-500 block">Escalated</span>
          <div className="text-2xl xl:text-3xl font-black text-orange-600 tracking-tight mt-0.5">
            {data.escalated}
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-500 flex items-center justify-between">
          <span>Perlu Mgt</span>
          <span className="font-semibold text-orange-600">
            {data.total > 0 ? Math.round((data.escalated / data.total) * 100) : 0}%
          </span>
        </div>
      </div>

      {/* 6. Closed */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Tuntas
          </span>
        </div>
        <div>
          <span className="text-[11px] font-medium text-slate-500 block">Closed</span>
          <div className="text-2xl xl:text-3xl font-black text-emerald-600 tracking-tight mt-0.5">
            {data.closed}
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-500 flex items-center justify-between">
          <span>Terselesaikan</span>
          <span className="font-semibold text-emerald-600">
            {data.total > 0 ? Math.round((data.closed / data.total) * 100) : 0}%
          </span>
        </div>
      </div>

      {/* 7. Overdue */}
      <div className="bg-white rounded-2xl p-4 border border-red-200/80 bg-gradient-to-b from-white to-red-50/20 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <div className="w-8 h-8 rounded-xl bg-red-100 text-red-700 flex items-center justify-center">
            <CalendarClock className="w-4 h-4" />
          </div>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-600 text-white">
            Late
          </span>
        </div>
        <div>
          <span className="text-[11px] font-medium text-red-600 block">Overdue</span>
          <div className="text-2xl xl:text-3xl font-black text-red-700 tracking-tight mt-0.5">
            {data.overdue}
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-red-100 text-[10px] text-red-600/80 flex items-center justify-between">
          <span>Lewat target</span>
          <span className="font-semibold text-red-700">
            {data.total > 0 ? Math.round((data.overdue / data.total) * 100) : 0}%
          </span>
        </div>
      </div>

      {/* 8. Closure Rate */}
      <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Performa
          </span>
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
            Rate
          </span>
        </div>
        <div className="flex items-center gap-2.5 my-1">
          <div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
            <svg className="w-12 h-12 transform -rotate-90">
              <circle
                cx="24"
                cy="24"
                r={radius}
                stroke="#E2E8F0"
                strokeWidth="4.5"
                fill="transparent"
              />
              <circle
                cx="24"
                cy="24"
                r={radius}
                stroke="#10B981"
                strokeWidth="4.5"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <PieChart className="w-3.5 h-3.5 text-emerald-600 absolute" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-medium text-slate-500 block truncate">Closure Rate</span>
            <span className="text-xl font-black text-slate-900 block leading-tight">
              {data.closureRate.toFixed(1).replace(".", ",")}%
            </span>
          </div>
        </div>
        <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500 flex items-center justify-between">
          <span>Tingkat tuntas</span>
          <span className="font-semibold text-emerald-600">{data.closed}/{data.total}</span>
        </div>
      </div>
    </div>
  );
}
