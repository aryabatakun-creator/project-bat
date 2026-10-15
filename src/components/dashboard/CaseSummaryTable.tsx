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

export function CaseSummaryTable({
  cases,
  onView,
  onEdit,
  onDelete,
  showActions = true,
}: TableProps) {
  const { user } = useAuth();

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#1E293B] text-white">
              <th className="py-2.5 px-3 font-semibold text-center w-10">No.</th>
              <th className="py-2.5 px-3 font-semibold whitespace-nowrap">Case ID</th>
              <th className="py-2.5 px-3 font-semibold whitespace-nowrap">Date Reported</th>
              <th className="py-2.5 px-3 font-semibold whitespace-nowrap">Category</th>
              <th className="py-2.5 px-3 font-semibold min-w-[200px]">Case Title</th>
              <th className="py-2.5 px-3 font-semibold whitespace-nowrap">Location / Area</th>
              <th className="py-2.5 px-3 font-semibold text-center whitespace-nowrap">Priority</th>
              <th className="py-2.5 px-3 font-semibold whitespace-nowrap">PIC</th>
              <th className="py-2.5 px-3 font-semibold whitespace-nowrap">Target Date</th>
              <th className="py-2.5 px-3 font-semibold text-center whitespace-nowrap">Status</th>
              <th className="py-2.5 px-3 font-semibold min-w-[130px]">Progress</th>
              <th className="py-2.5 px-3 font-semibold whitespace-nowrap">Last Update</th>
              <th className="py-2.5 px-3 font-semibold min-w-[180px]">Remarks</th>
              {showActions && (
                <th className="py-2.5 px-3 font-semibold text-center whitespace-nowrap">Aksi</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {cases.length === 0 ? (
              <tr>
                <td colSpan={showActions ? 14 : 13} className="py-8 text-center text-slate-400">
                  Tidak ada data kasus yang sesuai dengan filter.
                </td>
              </tr>
            ) : (
              cases.map((item, idx) => (
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
                  <td className="py-2.5 px-3 font-medium text-slate-800">
                    {item.case_title}
                  </td>

                  {/* 6. Area */}
                  <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                    {item.area_name || "-"}
                  </td>

                  {/* 7. Priority */}
                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold ${getPriorityBadgeStyle(
                        item.priority
                      )}`}
                    >
                      {item.priority}
                    </span>
                  </td>

                  {/* 8. PIC */}
                  <td className="py-2.5 px-3 text-slate-700 font-medium whitespace-nowrap">
                    {item.pic_name || "-"}
                  </td>

                  {/* 9. Target Date */}
                  <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                    {formatDateIndo(item.target_date)}
                  </td>

                  {/* 10. Status */}
                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${getStatusBadgeStyle(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>
                  </td>

                  {/* 11. Progress */}
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getProgressBarColor(item.progress)}`}
                          style={{ width: `${Math.min(100, Math.max(0, item.progress))}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-bold text-slate-700 w-8">
                        {item.progress}%
                      </span>
                    </div>
                  </td>

                  {/* 12. Last Update */}
                  <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap text-[11px]">
                    {formatDateIndo(item.last_update)}
                  </td>

                  {/* 13. Remarks */}
                  <td className="py-2.5 px-3 text-slate-600 max-w-[200px] truncate" title={item.remarks}>
                    {item.remarks || "-"}
                  </td>

                  {/* 14. Action buttons according to RBAC */}
                  {showActions && (
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
