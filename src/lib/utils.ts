import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { CaseStatus, PriorityLevel } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isOverdue(
  targetDate: string,
  status: CaseStatus,
  targetTime?: string
): boolean {
  if (status === "Closed" || !targetDate) return false;
  const datePart = targetDate.slice(0, 10);
  const timeMatch = targetTime?.match(/^(\d{2}:\d{2})/);
  if (timeMatch) {
    const target = new Date(`${datePart}T${timeMatch[1]}:00`);
    if (!isNaN(target.getTime())) {
      return target < new Date();
    }
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(targetDate);
  return target < today;
}

export function getCurrentTimeHHMM(): string {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

export function formatDateIndo(dateStr: string): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export function formatDateReportedIndo(
  dateStr: string,
  createdAt?: string,
  reportedTime?: string
): string {
  if (!dateStr) return "-";
  const formattedDate = formatDateIndo(dateStr);
  let timePart = reportedTime?.match(/^(\d{2}:\d{2})/)?.[1] || "";

  if (!timePart && (dateStr.includes("T") || /\d{2}:\d{2}/.test(dateStr))) {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      timePart = `${String(d.getHours()).padStart(2, "0")}:${String(
        d.getMinutes()
      ).padStart(2, "0")}`;
    }
  }

  if (!timePart && createdAt) {
    const c = new Date(createdAt);
    if (!isNaN(c.getTime())) {
      timePart = `${String(c.getHours()).padStart(2, "0")}:${String(
        c.getMinutes()
      ).padStart(2, "0")}`;
    }
  }

  return timePart ? `${formattedDate} ${timePart}` : formattedDate;
}

export function formatTargetDateIndo(
  dateStr: string,
  targetTime?: string
): string {
  if (!dateStr) return "-";
  const formattedDate = formatDateIndo(dateStr);
  let timePart = targetTime?.match(/^(\d{2}:\d{2})/)?.[1] || "";

  if (!timePart && (dateStr.includes("T") || /\d{2}:\d{2}/.test(dateStr))) {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      timePart = `${String(d.getHours()).padStart(2, "0")}:${String(
        d.getMinutes()
      ).padStart(2, "0")}`;
    }
  }

  return timePart ? `${formattedDate} ${timePart}` : formattedDate;
}

export function formatRepairDateIndo(
  repairDate?: string,
  repairTime?: string
): string {
  if (!repairDate) return "-";
  const formattedDate = formatDateIndo(repairDate);
  let timePart = repairTime?.match(/^(\d{2}:\d{2})/)?.[1] || "";

  if (!timePart && (repairDate.includes("T") || /\d{2}:\d{2}/.test(repairDate))) {
    const d = new Date(repairDate);
    if (!isNaN(d.getTime())) {
      timePart = `${String(d.getHours()).padStart(2, "0")}:${String(
        d.getMinutes()
      ).padStart(2, "0")}`;
    }
  }
  return timePart ? `${formattedDate} ${timePart}` : formattedDate;
}

export function getRepairStatusComparison(
  repairDate?: string,
  targetDate?: string,
  targetTime?: string,
  repairTime?: string
): { label: string; style: string } | null {
  if (!repairDate || !targetDate) return null;
  const repairDay = repairDate.slice(0, 10);
  const targetDay = targetDate.slice(0, 10);

  let repairTimeValid = repairTime?.match(/^(\d{2}:\d{2})/)?.[1] || "";
  if (!repairTimeValid && (repairDate.includes("T") || /\d{2}:\d{2}/.test(repairDate))) {
    const d = new Date(repairDate);
    if (!isNaN(d.getTime())) {
      repairTimeValid = `${String(d.getHours()).padStart(2, "0")}:${String(
        d.getMinutes()
      ).padStart(2, "0")}`;
    }
  }

  let targetTimeValid = targetTime?.match(/^(\d{2}:\d{2})/)?.[1] || "";
  if (!targetTimeValid && (targetDate.includes("T") || /\d{2}:\d{2}/.test(targetDate))) {
    const d = new Date(targetDate);
    if (!isNaN(d.getTime())) {
      targetTimeValid = `${String(d.getHours()).padStart(2, "0")}:${String(
        d.getMinutes()
      ).padStart(2, "0")}`;
    }
  }

  if (repairTimeValid && targetTimeValid) {
    const rDate = new Date(`${repairDay}T${repairTimeValid}:00`);
    const tDate = new Date(`${targetDay}T${targetTimeValid}:00`);
    if (!isNaN(rDate.getTime()) && !isNaN(tDate.getTime())) {
      if (rDate < tDate) {
        return {
          label: "Lebih Cepat dari Target",
          style: "bg-emerald-100 text-emerald-800 border border-emerald-300",
        };
      }
      if (rDate.getTime() === tDate.getTime()) {
        return {
          label: "Tepat Waktu (Sesuai Target)",
          style: "bg-sky-100 text-sky-800 border border-sky-300",
        };
      }
      return {
        label: "Melewati Target Date",
        style: "bg-rose-100 text-rose-800 border border-rose-300",
      };
    }
  }

  if (repairDay < targetDay) {
    return {
      label: "Lebih Cepat dari Target",
      style: "bg-emerald-100 text-emerald-800 border border-emerald-300",
    };
  }
  if (repairDay === targetDay) {
    return {
      label: "Tepat Waktu (Sesuai Target)",
      style: "bg-sky-100 text-sky-800 border border-sky-300",
    };
  }
  return {
    label: "Melewati Target Date",
    style: "bg-rose-100 text-rose-800 border border-rose-300",
  };
}

export function getStatusBadgeStyle(status: CaseStatus | string): string {
  const normalized = (status || "").trim();
  switch (normalized) {
    case "Open":
      return "bg-red-100 text-red-700 border border-red-300";
    case "On Progress":
      return "bg-amber-100 text-amber-800 border border-amber-300";
    case "Pending":
      return "bg-slate-200 text-slate-700 border border-slate-300";
    case "Escalated":
      return "bg-orange-100 text-orange-800 border border-orange-300";
    case "Closed":
      return "bg-emerald-100 text-emerald-800 border border-emerald-300";
    default:
      return "bg-slate-100 text-slate-800 border border-slate-300";
  }
}

export function getPriorityBadgeStyle(priority: PriorityLevel | string): string {
  const normalized = (priority || "").trim();
  switch (normalized) {
    case "Critical":
      return "bg-red-600 text-white border border-red-700 shadow-2xs";
    case "High":
      return "bg-rose-100 text-rose-800 border border-rose-300";
    case "Medium":
      return "bg-amber-100 text-amber-800 border border-amber-300";
    case "Low":
      return "bg-emerald-100 text-emerald-800 border border-emerald-300";
    default:
      return "bg-slate-100 text-slate-800 border border-slate-300";
  }
}

export function getCategoryBadgeStyle(category: string): string {
  switch ((category || "").trim()) {
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

/**
 * Transforms a Supabase Storage photo URL into an auto-download URL.
 * When clicked in a browser or spreadsheet, the `?download=` query parameter
 * instructs Supabase Storage to send `Content-Disposition: attachment; filename="..."`,
 * triggering an immediate file download rather than opening an inline preview.
 */
export function getAutoDownloadUrl(fileUrl?: string, fileName?: string): string {
  if (!fileUrl) return "";
  // Do not export Base64 DataURLs into CSV to prevent cell truncation and corruption
  if (fileUrl.startsWith("data:")) return "";

  const cleanFileName = (fileName || "").replace(/["'\r\n]/g, "").trim();

  let absoluteUrl = fileUrl;
  if (!absoluteUrl.startsWith("http://") && !absoluteUrl.startsWith("https://")) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    if (supabaseUrl) {
      const cleanPath = absoluteUrl.replace(/^\/+/, "");
      if (cleanPath.startsWith("storage/v1/object/public/")) {
        absoluteUrl = `${supabaseUrl.replace(/\/+$/, "")}/${cleanPath}`;
      } else {
        absoluteUrl = `${supabaseUrl.replace(/\/+$/, "")}/storage/v1/object/public/case-photos/${cleanPath}`;
      }
    } else {
      return "";
    }
  }

  try {
    const url = new URL(absoluteUrl);
    if (!url.searchParams.has("download")) {
      url.searchParams.set("download", cleanFileName || "");
    }
    return url.toString();
  } catch {
    const sep = absoluteUrl.includes("?") ? "&" : "?";
    return cleanFileName
      ? `${absoluteUrl}${sep}download=${encodeURIComponent(cleanFileName)}`
      : `${absoluteUrl}${sep}download=`;
  }
}

