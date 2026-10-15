"use client";

import React, { useState, useEffect } from "react";
import { X, Upload, Image as ImageIcon, Loader2 } from "lucide-react";
import { CaseItem, MasterArea, MasterCategory, MasterPic, PriorityLevel, CaseStatus } from "@/lib/types";
import imageCompression from "browser-image-compression";

interface CaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (caseData: Partial<CaseItem>, photoFiles?: File[]) => Promise<void>;
  initialData?: CaseItem | null;
  areas: MasterArea[];
  categories: MasterCategory[];
  pics: MasterPic[];
}

export function CaseModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  areas,
  categories,
  pics,
}: CaseModalProps) {
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [areaId, setAreaId] = useState("");
  const [priority, setPriority] = useState<PriorityLevel>("Medium");
  const [picId, setPicId] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [status, setStatus] = useState<CaseStatus>("Open");
  const [progress, setProgress] = useState(0);
  const [remarks, setRemarks] = useState("");
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.case_title || "");
      setCategoryId(initialData.category_id || (categories.find(c => c.name === initialData.category_name)?.id || ""));
      setAreaId(initialData.area_id || (areas.find(a => a.name === initialData.area_name)?.id || ""));
      setPriority(initialData.priority || "Medium");
      setPicId(initialData.pic_id || (pics.find(p => p.name === initialData.pic_name)?.id || ""));
      setTargetDate(initialData.target_date || "");
      setStatus(initialData.status || "Open");
      setProgress(initialData.progress || 0);
      setRemarks(initialData.remarks || "");
    } else {
      setTitle("");
      setCategoryId(categories[0]?.id || "");
      setAreaId(areas[0]?.id || "");
      setPriority("Medium");
      setPicId(pics[0]?.id || "");
      setTargetDate(new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0]);
      setStatus("Open");
      setProgress(0);
      setRemarks("");
    }
    setPhotoFiles([]);
    setPhotoPreviews([]);
  }, [initialData, isOpen, areas, categories, pics]);

  if (!isOpen) return null;

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const files = Array.from(e.target.files);
    setIsCompressing(true);

    try {
      const options = {
        maxSizeMB: 0.3,
        maxWidthOrHeight: 1280,
        useWebWorker: true,
        fileType: "image/webp",
      };

      const compressedFiles: File[] = [];
      const previews: string[] = [];

      for (const file of files) {
        // Compress in browser
        const compressedBlob = await imageCompression(file, options);
        const compressedFile = new File(
          [compressedBlob],
          file.name.replace(/\.[^/.]+$/, "") + ".webp",
          { type: "image/webp" }
        );
        compressedFiles.push(compressedFile);
        previews.push(URL.createObjectURL(compressedFile));
      }

      setPhotoFiles((prev) => [...prev, ...compressedFiles]);
      setPhotoPreviews((prev) => [...prev, ...previews]);
    } catch (err) {
      console.error("Compression error:", err);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const selectedCat = categories.find((c) => c.id === categoryId);
      const selectedArea = areas.find((a) => a.id === areaId);
      const selectedPic = pics.find((p) => p.id === picId);

      await onSave(
        {
          case_title: title,
          category_id: categoryId,
          category_name: selectedCat?.name || "",
          area_id: areaId,
          area_name: selectedArea?.name || "",
          priority,
          pic_id: picId,
          pic_name: selectedPic?.name || "",
          target_date: targetDate,
          status,
          progress,
          remarks,
        },
        photoFiles
      );
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-[#1E293B] text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold">
              {initialData ? `Edit Kasus: ${initialData.case_id}` : "Input Kasus Baru"}
            </h2>
            <p className="text-xs text-slate-400">
              {initialData ? "Perbarui status, progress & tindak lanjut" : "Pencatatan masalah operasional baru"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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

            {/* Lokasi / Area */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Area / Lokasi *
              </label>
              <select
                value={areaId}
                onChange={(e) => setAreaId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
              >
                {areas.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
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
              <span className="text-sm font-extrabold text-amber-600">{progress}%</span>
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
              Lampiran Foto Bukti
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
                  {isCompressing ? "Mengompresi gambar..." : "Klik untuk pilih foto bukti"}
                </span>
                <span className="text-[10px] text-slate-400">
                  Foto otomatis dioptimasi hemat storage sebelum upload
                </span>
              </label>
            </div>

            {/* Photo Previews */}
            {photoPreviews.length > 0 && (
              <div className="flex items-center gap-2 mt-2 overflow-x-auto py-1">
                {photoPreviews.map((src, i) => (
                  <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-300 shrink-0">
                    <img src={src} alt="preview" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving || isCompressing}
              className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 rounded-lg shadow-sm transition-all flex items-center gap-2"
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
