"use client";

import React, { useState } from "react";
import { X, Calendar, MapPin, User, Clock, Image as ImageIcon } from "lucide-react";
import { CaseItem } from "@/lib/types";
import {
  formatDateIndo,
  getStatusBadgeStyle,
  getPriorityBadgeStyle,
  getCategoryBadgeStyle,
  getProgressBarColor,
} from "@/lib/utils";

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseItem: CaseItem | null;
}

export function CaseDetailModal({
  isOpen,
  onClose,
  caseItem,
}: DetailModalProps) {
  const [previewImg, setPreviewImg] = useState<string | null>(null);

  if (!isOpen || !caseItem) return null;

  const attachments = caseItem.attachments || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-[#1E293B] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-black text-amber-400">
              {caseItem.case_id}
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${getStatusBadgeStyle(
                caseItem.status
              )}`}
            >
              {caseItem.status}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div>
            <h3 className="text-base font-bold text-slate-900 leading-snug">
              {caseItem.case_title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${getCategoryBadgeStyle(
                  caseItem.category_name || ""
                )}`}
              >
                {caseItem.category_name || "-"}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${getPriorityBadgeStyle(
                  caseItem.priority
                )}`}
              >
                Prioritas: {caseItem.priority}
              </span>
            </div>
          </div>

          {/* Key Specs */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span>
                <strong>Area:</strong>{" "}
                {caseItem.area_name?.includes(" - ")
                  ? caseItem.area_name.split(" - ")[0]
                  : caseItem.area_name || "-"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                <strong>Lokasi:</strong>{" "}
                {caseItem.location_name ||
                  (caseItem.area_name?.includes(" - ")
                    ? caseItem.area_name.split(" - ").slice(1).join(" - ")
                    : "-")}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <User className="w-4 h-4 text-slate-400 shrink-0" />
              <span>
                <strong>PIC:</strong> {caseItem.pic_name || "-"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <span>
                <strong>Lapor:</strong> {formatDateIndo(caseItem.date_reported)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-700 col-span-2">
              <Clock className="w-4 h-4 text-slate-400 shrink-0" />
              <span>
                <strong>Target Penyelesaian:</strong> {formatDateIndo(caseItem.target_date)}
              </span>
            </div>
          </div>

          {/* Progress */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
              <span className="text-slate-700">Progress Penanganan</span>
              <span className="text-slate-900">{caseItem.progress}%</span>
            </div>
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full ${getProgressBarColor(caseItem.progress)}`}
                style={{ width: `${caseItem.progress}%` }}
              />
            </div>
          </div>

          {/* Remarks */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Catatan Tindak Lanjut (Remarks)
            </h4>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 whitespace-pre-wrap">
              {caseItem.remarks || "Belum ada catatan tindak lanjut."}
            </div>
          </div>

          {/* Photo Attachments */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
              <span>Foto Bukti Lapangan ({attachments.length})</span>
            </h4>
            {attachments.length > 0 ? (
              <div className="grid grid-cols-3 gap-2.5">
                {attachments.map((att, i) => (
                  <button
                    key={att.id || i}
                    type="button"
                    onClick={() => setPreviewImg(att.file_url)}
                    className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 group block cursor-pointer bg-slate-100"
                    title="Klik untuk memperbesar foto"
                  >
                    <img
                      src={att.file_url}
                      alt={att.file_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </button>
                ))}
              </div>
            ) : (
              <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-4 text-center text-xs text-slate-400">
                Belum ada lampiran foto bukti.
              </div>
            )}
          </div>

          <div className="text-right pt-2 border-t border-slate-100">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen Image Lightbox */}
      {previewImg && (
        <div
          onClick={() => setPreviewImg(null)}
          className="fixed inset-0 z-60 bg-slate-950/85 flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              type="button"
              onClick={() => setPreviewImg(null)}
              className="absolute -top-10 right-0 text-white hover:text-amber-400 p-1.5"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={previewImg}
              alt="Foto Bukti"
              className="max-w-full max-h-[85vh] rounded-xl shadow-2xl border border-slate-700 object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
