"use client";

import React, { useState, useEffect } from "react";
import { X, Upload, Loader2, Trash2 } from "lucide-react";
import {
  CaseItem,
  CaseAttachment,
  MasterArea,
  MasterLocation,
  MasterCategory,
  MasterPic,
  PriorityLevel,
  CaseStatus,
} from "@/lib/types";
import imageCompression from "browser-image-compression";
import { fileToDataUrl } from "@/lib/dataService";

interface CaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (caseData: Partial<CaseItem>, photoFiles?: File[]) => Promise<void>;
  initialData?: CaseItem | null;
  areas: MasterArea[];
  locations?: MasterLocation[];
  categories: MasterCategory[];
  pics: MasterPic[];
}

export function CaseModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  areas,
  locations = [],
  categories,
  pics,
}: CaseModalProps) {
  const [title, setTitle] = useState("");
  const [dateReported, setDateReported] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [areaId, setAreaId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [priority, setPriority] = useState<PriorityLevel>("Medium");
  const [picId, setPicId] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [status, setStatus] = useState<CaseStatus>("Open");
  const [progress, setProgress] = useState(0);
  const [remarks, setRemarks] = useState("");

  const [existingAttachments, setExistingAttachments] = useState<
    CaseAttachment[]
  >([]);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Helper to get locations belonging to an area
  const getLocationsForArea = (targetAreaId: string) => {
    const selectedAreaObj = areas.find((a) => a.id === targetAreaId);
    const filtered = locations.filter(
      (l) =>
        l.area_id === targetAreaId ||
        (selectedAreaObj &&
          (l.area_name === selectedAreaObj.name ||
            selectedAreaObj.name.startsWith(l.area_name || "")))
    );
    return filtered.length > 0 ? filtered : locations;
  };

  // Only reset form when modal opens or initialData changes
  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      setTitle(initialData.case_title || "");
      setDateReported(
        initialData.date_reported || new Date().toISOString().split("T")[0]
      );
      setCategoryId(
        initialData.category_id ||
          categories.find((c) => c.name === initialData.category_name)?.id ||
          categories[0]?.id ||
          ""
      );
      const resolvedAreaId =
        initialData.area_id ||
        areas.find((a) => a.name === initialData.area_name)?.id ||
        areas[0]?.id ||
        "";
      setAreaId(resolvedAreaId);

      const areaLocs = getLocationsForArea(resolvedAreaId);
      const resolvedLocId =
        initialData.location_id ||
        locations.find((l) => l.name === initialData.location_name)?.id ||
        areaLocs[0]?.id ||
        "";
      setLocationId(resolvedLocId);

      setPriority(initialData.priority || "Medium");
      setPicId(
        initialData.pic_id ||
          pics.find((p) => p.name === initialData.pic_name)?.id ||
          pics[0]?.id ||
          ""
      );
      setTargetDate(initialData.target_date || "");
      setStatus(initialData.status || "Open");
      setProgress(initialData.progress || 0);
      setRemarks(initialData.remarks || "");
      setExistingAttachments(initialData.attachments || []);
    } else {
      setTitle("");
      setDateReported(new Date().toISOString().split("T")[0]);
      setCategoryId(categories[0]?.id || "");
      const defaultAreaId = areas[0]?.id || "";
      setAreaId(defaultAreaId);
      const areaLocs = getLocationsForArea(defaultAreaId);
      setLocationId(areaLocs[0]?.id || "");
      setPriority("Medium");
      setPicId(pics[0]?.id || "");
      setTargetDate(
        new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0]
      );
      setStatus("Open");
      setProgress(0);
      setRemarks("");
      setExistingAttachments([]);
    }
    setPhotoFiles([]);
    setPhotoPreviews([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const availableLocations = getLocationsForArea(areaId);

  const handleAreaChange = (newAreaId: string) => {
    setAreaId(newAreaId);
    const nextLocs = getLocationsForArea(newAreaId);
    setLocationId(nextLocs[0]?.id || "");
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const files = Array.from(e.target.files);
    setIsCompressing(true);

    try {
      const options = {
        maxSizeMB: 0.25,
        maxWidthOrHeight: 1280,
        useWebWorker: false,
        fileType: "image/webp",
      };

      const processedFiles: File[] = [];
      const previews: string[] = [];

      for (const file of files) {
        let finalFile = file;
        try {
          const compressedBlob = await imageCompression(file, options);
          finalFile = new File(
            [compressedBlob],
            file.name.replace(/\.[^/.]+$/, "") + ".webp",
            { type: "image/webp" }
          );
        } catch (compErr) {
          console.warn("Using original image file fallback:", compErr);
          finalFile = file;
        }

        const dataUrl = await fileToDataUrl(finalFile);
        processedFiles.push(finalFile);
        previews.push(dataUrl);
      }

      setPhotoFiles((prev) => [...prev, ...processedFiles]);
      setPhotoPreviews((prev) => [...prev, ...previews]);
    } catch (err) {
      console.error("Photo selection error:", err);
    } finally {
      setIsCompressing(false);
      e.target.value = "";
    }
  };

  const handleRemoveNewPhoto = (index: number) => {
    setPhotoFiles((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingAttachment = (attId: string) => {
    setExistingAttachments((prev) => prev.filter((a) => a.id !== attId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const selectedCat =
        categories.find((c) => c.id === categoryId) || categories[0];
      const selectedArea = areas.find((a) => a.id === areaId) || areas[0];
      const selectedLocation =
        locations.find((l) => l.id === locationId) || availableLocations[0];
      const selectedPic = pics.find((p) => p.id === picId) || pics[0];

      await onSave(
        {
          case_title: title,
          date_reported: dateReported,
          category_id: selectedCat?.id || categoryId,
          category_name: selectedCat?.name || "",
          area_id: selectedArea?.id || areaId,
          area_name: selectedArea?.name || "",
          location_id: selectedLocation?.id || locationId,
          location_name: selectedLocation?.name || "",
          priority,
          pic_id: selectedPic?.id || picId,
          pic_name: selectedPic?.name || "",
          target_date: targetDate,
          status,
          progress,
          remarks,
          attachments: existingAttachments,
        },
        photoFiles
      );
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-3 sm:my-8 flex flex-col max-h-[calc(100vh-1.5rem)] sm:max-h-[calc(100vh-4rem)]">
        {/* Header - Sticky & Always Visible */}
        <div className="bg-[#1E293B] text-white px-6 py-4 flex items-center justify-between shrink-0 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold">
              {initialData
                ? `Edit Kasus: ${initialData.case_id}`
                : "Input Kasus Baru"}
            </h2>
            <p className="text-xs text-slate-400">
              {initialData
                ? "Perbarui status, progress & tindak lanjut"
                : "Pencatatan masalah operasional baru"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body - Scrollable */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Judul Kasus */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Case Title / Nama Masalah *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Penggantian HT Operasional"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Area */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Area *
              </label>
              <select
                value={areaId}
                onChange={(e) => handleAreaChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
              >
                {areas.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Lokasi (Multi Lokasi per Area) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Lokasi *
              </label>
              <select
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
              >
                {availableLocations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Kategori */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Kategori *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Prioritas *
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            {/* PIC */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                PIC (Person in Charge) *
              </label>
              <select
                value={picId}
                onChange={(e) => setPicId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
              >
                {pics.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.role ? `(${p.role})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Target Date *
              </label>
              <input
                type="date"
                required
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Status *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as CaseStatus)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
              >
                <option value="Open">Open</option>
                <option value="On Progress">On Progress</option>
                <option value="Pending">Pending</option>
                <option value="Escalated">Escalated</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>

          {/* Progress Slider */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Progress Penyelesaian:
              </label>
              <span className="text-sm font-extrabold text-amber-600">
                {progress}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Remarks / Tindak Lanjut Terkini
            </label>
            <textarea
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Catatan update progress atau kendala di lapangan..."
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Photo Attachments */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Lampiran Foto Bukti ({existingAttachments.length + photoPreviews.length} Foto)
            </label>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-3 bg-slate-50 text-center hover:bg-slate-100/70 transition-colors">
              <input
                type="file"
                id="photo-upload"
                multiple
                accept="image/*"
                onChange={handlePhotoSelect}
                className="hidden"
              />
              <label
                htmlFor="photo-upload"
                className="cursor-pointer flex flex-col items-center justify-center gap-1"
              >
                <Upload className="w-6 h-6 text-slate-400" />
                <span className="text-xs font-semibold text-slate-700">
                  {isCompressing
                    ? "Memproses gambar..."
                    : "Klik untuk pilih foto bukti"}
                </span>
                <span className="text-[10px] text-slate-400">
                  Foto otomatis dioptimasi sebelum disimpan
                </span>
              </label>
            </div>

            {/* Photo Previews (Existing + Newly Added) */}
            {(existingAttachments.length > 0 || photoPreviews.length > 0) && (
              <div className="flex items-center gap-2.5 mt-2.5 overflow-x-auto py-1">
                {existingAttachments.map((att) => (
                  <div
                    key={att.id}
                    className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-300 shrink-0 group shadow-2xs"
                  >
                    <img
                      src={att.file_url}
                      alt={att.file_name}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingAttachment(att.id)}
                      className="absolute top-1 right-1 bg-slate-900/80 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      title="Hapus foto"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {photoPreviews.map((src, i) => (
                  <div
                    key={`new-${i}`}
                    className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-amber-400 shrink-0 group shadow-2xs"
                  >
                    <img
                      src={src}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveNewPhoto(i)}
                      className="absolute top-1 right-1 bg-slate-900/80 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      title="Batal pilih foto"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions - Sticky bottom */}
          <div className="flex items-center justify-end gap-3 pt-3 pb-1 border-t border-slate-100 sticky bottom-0 bg-white/95 backdrop-blur-xs shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving || isCompressing}
              className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{initialData ? "Simpan Perubahan" : "Simpan Kasus"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
