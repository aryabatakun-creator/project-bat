"use client";

import React from "react";
import { CaseItem } from "@/lib/types";
import { 
  formatDateIndo, 
  getStatusBadgeStyle, 
  getPriorityBadgeStyle, 
  getCategoryBadgeStyle,
  getProgressBarColor
} from "@/lib/utils";
import { Eye, Edit3, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/authContext";

interface TableProps {
  cases: CaseItem[];
  onView?: (item: CaseItem) => void;
  onEdit?: (item: CaseItem) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

const PRIORITY_STYLE_MAP: Record<string, { bg: string; text: string; border: string }> = {
  Critical: { bg: "#991B1B", text: "#FFFFFF", border: "#7F1D1D" },
  High: { bg: "#EF4444", text: "#FFFFFF", border: "#DC2626" },
  Medium: { bg: "#FBBF24", text: "#0F172A", border: "#F59E0B" },
  Low: { bg: "#10B981", text: "#FFFFFF", border: "#059669" },
};

const STATUS_STYLE_MAP: Record<string, { bg: string; text: string; border: string }> = {
  Open: { bg: "#EF4444", text: "#FFFFFF", border: "#DC2626" },
  "On Progress": { bg: "#FBBF24", text: "#0F172A", border: "#F59E0B" },
  Pending: { bg: "#64748B", text: "#FFFFFF", border: "#475569" },
  Escalated: { bg: "#F97316", text: "#FFFFFF", border: "#EA580C" },
  Closed: { bg: "#10B981", text: "#FFFFFF", border: "#059669" },
};

export function CaseSummaryTable({
  cases,
  onView,
  onEdit,
  onDelete,
  showActions = true,
}: TableProps) {
  const { user } = useAuth();

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden print:border-none print:shadow-none print:rounded-none">
      <div className="overflow-x-auto print:overflow-visible">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#1E293B] text-white">
              <th className="py-2.5 px-3 font-semibold text-center w-10 print:py-1 print:px-1.5 print:w-6">No.</th>
              <th className="py-2.5 px-3 font-semibold whitespace-nowrap print:py-1 print:px-1.5">Case ID</th>
              <th className="py-2.5 px-3 font-semibold whitespace-nowrap print:py-1 print:px-1.5">Date Reported</th>
              <th className="py-2.5 px-3 font-semibold whitespace-nowrap print:py-1 print:px-1.5">Category</th>
              <th className="py-2.5 px-3 font-semibold min-w-[180px] print:min-w-0 print:py-1 print:px-1.5">Case Title</th>
              <th className="py-2.5 px-3 font-semibold whitespace-nowrap print:py-1 print:px-1.5">Area</th>
              <th className="py-2.5 px-3 font-semibold whitespace-nowrap print:py-1 print:px-1.5">Lokasi</th>
              <th className="py-2.5 px-3 font-semibold text-center whitespace-nowrap print:py-1 print:px-1.5">Priority</th>
              <th className="py-2.5 px-3 font-semibold whitespace-nowrap print:py-1 print:px-1.5">PIC</th>
              <th className="py-2.5 px-3 font-semibold whitespace-nowrap print:py-1 print:px-1.5">Target Date</th>
              <th className="py-2.5 px-3 font-semibold text-center whitespace-nowrap print:py-1 print:px-1.5">Status</th>
              <th className="py-2.5 px-3 font-semibold min-w-[120px] print:min-w-0 print:py-1 print:px-1.5">Progress</th>
              <th className="py-2.5 px-3 font-semibold whitespace-nowrap print:py-1 print:px-1.5">Last Update</th>
              <th className="py-2.5 px-3 font-semibold min-w-[160px] print:min-w-0 print:py-1 print:px-1.5">Remarks</th>
              {showActions && (
                <th className="py-2.5 px-3 font-semibold text-center whitespace-nowrap print:hidden">Aksi</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {cases.length === 0 ? (
              <tr>
                <td colSpan={showActions ? 15 : 14} className="py-8 text-center text-slate-400">
                  Tidak ada data kasus yang sesuai dengan filter.
                </td>
              </tr>
            ) : (
              cases.map((item, idx) => {
                const rawArea = item.area_name || "-";
                const displayArea = rawArea.includes(" - ") ? rawArea.split(" - ")[0] : rawArea;
                const displayLocation =
                  item.location_name ||
                  (rawArea.includes(" - ") ? rawArea.split(" - ").slice(1).join(" - ") : "-");

                const prioStyle = PRIORITY_STYLE_MAP[item.priority] || {
                  bg: "#E2E8F0",
                  text: "#1E293B",
                  border: "#CBD5E1",
                };
                const statusStyle = STATUS_STYLE_MAP[item.status] || {
                  bg: "#E2E8F0",
                  text: "#1E293B",
                  border: "#CBD5E1",
                };

                return (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  {/* 1. No */}
                  <td className="py-2.5 px-3 text-center text-slate-700 font-bold">{idx + 1}</td>

                  {/* 2. Case ID */}
                  <td className="py-2.5 px-3 font-bold text-slate-800 whitespace-nowrap">
                    {item.case_id}
                  </td>

                  {/* 3. Date Reported */}
                  <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                    {formatDateIndo(item.date_reported)}
                  </td>

                  {/* 4. Category */}
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${getCategoryBadgeStyle(
                        item.category_name || ""
                      )}`}
                    >
                      {item.category_name || "-"}
                    </span>
                  </td>

                  {/* 5. Case Title */}
                  <td className="py-2.5 px-3 font-medium text-slate-800 print:whitespace-normal print:break-words">
                    {item.case_title}
                  </td>

                  {/* 6. Area */}
                  <td className="py-2.5 px-3 text-slate-700 font-semibold whitespace-nowrap">
                    {displayArea}
                  </td>

                  {/* 7. Lokasi */}
                  <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                    {displayLocation}
                  </td>

                  {/* 8. Priority */}
                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold shadow-2xs ${getPriorityBadgeStyle(
                        item.priority
                      )}`}
                      style={{
                        backgroundColor: prioStyle.bg,
                        color: prioStyle.text,
                        border: `1px solid ${prioStyle.border}`,
                      }}
                    >
                      {item.priority || "-"}
                    </span>
                  </td>

                  {/* 9. PIC */}
                  <td className="py-2.5 px-3 text-slate-700 font-medium whitespace-nowrap">
                    {item.pic_name || "-"}
                  </td>

                  {/* 10. Target Date */}
                  <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                    {formatDateIndo(item.target_date)}
                  </td>

                  {/* 11. Status */}
                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold shadow-2xs ${getStatusBadgeStyle(
                        item.status
                      )}`}
                      style={{
                        backgroundColor: statusStyle.bg,
                        color: statusStyle.text,
                        border: `1px solid ${statusStyle.border}`,
                      }}
                    >
                      {item.status || "-"}
                    </span>
                  </td>

                  {/* 12. Progress */}
                  <td className="py-2.5 px-3 print:whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-slate-200 h-2 rounded-full overflow-hidden print:w-12">
                        <div
                          className={`h-full ${getProgressBarColor(item.progress)}`}
                          style={{ width: `${Math.min(100, Math.max(0, item.progress))}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-bold text-slate-700 w-8 print:text-[8px] print:w-auto">
                        {item.progress}%
                      </span>
                    </div>
                  </td>

                  {/* 13. Last Update */}
                  <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap text-[11px]">
                    {formatDateIndo(item.last_update)}
                  </td>

                  {/* 14. Remarks */}
                  <td className="py-2.5 px-3 text-slate-600 max-w-[200px] truncate print:max-w-none print:whitespace-normal print:overflow-visible print:break-words" title={item.remarks}>
                    {item.remarks || "-"}
                  </td>

                  {/* 14. Action buttons according to RBAC */}
                  {showActions && (
                    <td className="py-2.5 px-3 text-center whitespace-nowrap print:hidden">
                      <div className="flex items-center justify-center gap-1">
                        {/* View Action - Everyone can view */}
                        {onView && (
                          <button
                            onClick={() => onView(item)}
                            title="Lihat Detail"
                            className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Edit Action - Admin and Supervisor only */}
                        {onEdit && (user.role === "admin" || user.role === "supervisor") && (
                          <button
                            onClick={() => onEdit(item)}
                            title="Edit Kasus"
                            className="p-1 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Delete Action - Admin Only */}
                        {onDelete && user.role === "admin" && (
                          <button
                            onClick={() => onDelete(item.id)}
                            title="Hapus Kasus"
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
