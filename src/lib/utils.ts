import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { CaseStatus, PriorityLevel } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isOverdue(targetDate: string, status: CaseStatus): boolean {
  if (status === "Closed") return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(targetDate);
  return target < today;
}

export function formatDateIndo(dateStr: string): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export function getStatusBadgeStyle(status: CaseStatus): string {
  switch (status) {
    case "Open":
      return "bg-red-500 text-white";
    case "On Progress":
      return "bg-amber-400 text-slate-900";
    case "Pending":
      return "bg-slate-400 text-white";
    case "Escalated":
      return "bg-orange-500 text-white";
    case "Closed":
      return "bg-emerald-500 text-white";
    default:
      return "bg-slate-200 text-slate-800";
  }
}

export function getPriorityBadgeStyle(priority: PriorityLevel): string {
  switch (priority) {
    case "Critical":
      return "bg-red-800 text-white";
    case "High":
      return "bg-red-500 text-white";
    case "Medium":
      return "bg-amber-400 text-slate-900";
    case "Low":
      return "bg-emerald-500 text-white";
    default:
      return "bg-slate-300 text-slate-800";
  }
}

export function getCategoryBadgeStyle(category: string): string {
  switch (category) {
    case "Operasional":
      return "bg-sky-100 text-sky-800 border border-sky-300";
    case "Manpower":
      return "bg-blue-100 text-blue-800 border border-blue-300";
    case "Training & Competency":
      return "bg-purple-100 text-purple-800 border border-purple-300";
    case "Administrasi & Billing":
      return "bg-rose-100 text-rose-800 border border-rose-300";
    case "Equipment & Uniform":
      return "bg-amber-100 text-amber-800 border border-amber-300";
    case "HSE & Compliance":
      return "bg-emerald-100 text-emerald-800 border border-emerald-300";
    case "Facility & Infrastructure":
      return "bg-lime-100 text-lime-800 border border-lime-300";
    case "HR & Industrial Relation":
      return "bg-pink-100 text-pink-800 border border-pink-300";
    case "Client Request":
      return "bg-cyan-100 text-cyan-800 border border-cyan-300";
    default:
      return "bg-slate-100 text-slate-800 border border-slate-300";
  }
}

export function getProgressBarColor(progress: number): string {
  if (progress < 30) return "bg-red-500";
  if (progress <= 70) return "bg-amber-500";
  return "bg-emerald-500";
}
