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
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5 print:grid-cols-4 print:gap-2.5 print:mb-3">
      {/* 1. Total Case */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between print:p-2.5 print:rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
            <ClipboardList className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/60">
            Semua Kasus
          </span>
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-500 block">Total Kasus</span>
          <div className="text-2xl xl:text-3xl font-black text-slate-900 tracking-tight mt-0.5 print:text-xl">
            {data.total}
          </div>
        </div>
        <div className="mt-2.5 pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Semua Area &bull; Aktif</span>
          <span className="font-bold text-slate-700">100%</span>
        </div>
      </div>

      {/* 2. Open */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between print:p-2.5 print:rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <div className="w-8 h-8 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shrink-0">
            <AlertCircle className="w-4 h-4" />
          </div>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
            Baru Masuk
          </span>
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-500 block">Kasus Open</span>
          <div className="text-2xl xl:text-3xl font-black text-red-600 tracking-tight mt-0.5 print:text-xl">
            {data.open}
          </div>
        </div>
        <div className="mt-2.5 pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Menunggu penanganan</span>
          <span className="font-bold text-red-600">
            {data.total > 0 ? Math.round((data.open / data.total) * 100) : 0}%
          </span>
        </div>
      </div>

      {/* 3. On Progress */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between print:p-2.5 print:rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            Sedang Dikerjakan
          </span>
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-500 block">On Progress</span>
          <div className="text-2xl xl:text-3xl font-black text-amber-600 tracking-tight mt-0.5 print:text-xl">
            {data.onProgress}
          </div>
        </div>
        <div className="mt-2.5 pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Tindak lanjut PIC</span>
          <span className="font-bold text-amber-600">
            {data.total > 0 ? Math.round((data.onProgress / data.total) * 100) : 0}%
          </span>
        </div>
      </div>

      {/* 4. Pending */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between print:p-2.5 print:rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
            <PauseCircle className="w-4 h-4" />
          </div>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            Tertunda
          </span>
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-500 block">Pending</span>
          <div className="text-2xl xl:text-3xl font-black text-slate-700 tracking-tight mt-0.5 print:text-xl">
            {data.pending}
          </div>
        </div>
        <div className="mt-2.5 pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Menunggu vendor / pihak ke-3</span>
          <span className="font-bold text-slate-700">
            {data.total > 0 ? Math.round((data.pending / data.total) * 100) : 0}%
          </span>
        </div>
      </div>

      {/* 5. Escalated */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between print:p-2.5 print:rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-200">
            Eskalasi
          </span>
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-500 block">Escalated</span>
          <div className="text-2xl xl:text-3xl font-black text-orange-600 tracking-tight mt-0.5 print:text-xl">
            {data.escalated}
          </div>
        </div>
        <div className="mt-2.5 pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Perlu arahan manajemen</span>
          <span className="font-bold text-orange-600">
            {data.total > 0 ? Math.round((data.escalated / data.total) * 100) : 0}%
          </span>
        </div>
      </div>

      {/* 6. Closed */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between print:p-2.5 print:rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Tuntas Selesai
          </span>
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-500 block">Closed</span>
          <div className="text-2xl xl:text-3xl font-black text-emerald-600 tracking-tight mt-0.5 print:text-xl">
            {data.closed}
          </div>
        </div>
        <div className="mt-2.5 pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Kasus terverifikasi 100%</span>
          <span className="font-bold text-emerald-600">
            {data.total > 0 ? Math.round((data.closed / data.total) * 100) : 0}%
          </span>
        </div>
      </div>

      {/* 7. Overdue */}
      <div className="bg-white rounded-2xl p-4 border border-red-200/80 bg-gradient-to-b from-white to-red-50/20 shadow-xs hover:shadow-md transition-all flex flex-col justify-between print:p-2.5 print:rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <div className="w-8 h-8 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
            <CalendarClock className="w-4 h-4" />
          </div>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-600 text-white">
            Perlu Perhatian
          </span>
        </div>
        <div>
          <span className="text-xs font-semibold text-red-600 block">Overdue</span>
          <div className="text-2xl xl:text-3xl font-black text-red-700 tracking-tight mt-0.5 print:text-xl">
            {data.overdue}
          </div>
        </div>
        <div className="mt-2.5 pt-2 border-t border-red-100 text-[11px] text-red-700/80 flex items-center justify-between">
          <span>Melewati batas target</span>
          <span className="font-bold text-red-700">
            {data.total > 0 ? Math.round((data.overdue / data.total) * 100) : 0}%
          </span>
        </div>
      </div>

      {/* 8. Closure Rate */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between print:p-2.5 print:rounded-xl">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-slate-500 block">
            Closure Rate
          </span>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            Penyelesaian
          </span>
        </div>
        <div className="flex items-center gap-3 my-1">
          <div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
            <svg className="w-12 h-12 transform -rotate-90">
              <circle
                cx="24"
                cy="24"
                r={radius}
                stroke="#E2E8F0"
                strokeWidth="4"
                fill="transparent"
              />
              <circle
                cx="24"
                cy="24"
                r={radius}
                stroke="#10B981"
                strokeWidth="4"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <PieChart className="w-4 h-4 text-emerald-600 absolute" />
          </div>
          <div>
            <span className="text-2xl xl:text-3xl font-black text-slate-900 block leading-none print:text-xl">
              {data.closureRate.toFixed(1).replace(".", ",")}%
            </span>
            <span className="text-[10px] text-slate-400 font-medium mt-1 block">
              Rasio Selesai
            </span>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Status Tuntas</span>
          <span className="font-bold text-emerald-600">{data.closed} dari {data.total} Kasus</span>
        </div>
      </div>
    </div>
  );
}
