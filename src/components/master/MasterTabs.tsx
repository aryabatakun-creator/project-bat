"use client";

import React, { useState } from "react";
import { Plus, Trash2, MapPin, Tag, Users, Check } from "lucide-react";
import { MasterArea, MasterCategory, MasterPic } from "@/lib/types";

interface MasterTabsProps {
  areas: MasterArea[];
  categories: MasterCategory[];
  pics: MasterPic[];
  onAddArea: (name: string) => void;
  onDeleteArea: (id: string) => void;
  onAddCategory: (name: string) => void;
  onDeleteCategory: (id: string) => void;
  onAddPic: (name: string, role: string, email: string) => void;
  onDeletePic: (id: string) => void;
}

export function MasterTabs({
  areas,
  categories,
  pics,
  onAddArea,
  onDeleteArea,
  onAddCategory,
  onDeleteCategory,
  onAddPic,
  onDeletePic,
}: MasterTabsProps) {
  const [activeTab, setActiveTab] = useState<"area" | "category" | "pic">("area");

  // Local form states
  const [newAreaName, setNewAreaName] = useState("");
  const [newCatName, setNewCatName] = useState("");
  const [newPicName, setNewPicName] = useState("");
  const [newPicRole, setNewPicRole] = useState("");
  const [newPicEmail, setNewPicEmail] = useState("");

  const handleAddArea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAreaName.trim()) return;
    onAddArea(newAreaName.trim());
    setNewAreaName("");
  };

  const handleAddCat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    onAddCategory(newCatName.trim());
    setNewCatName("");
  };

  const handleAddPic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPicName.trim()) return;
    onAddPic(newPicName.trim(), newPicRole.trim(), newPicEmail.trim());
    setNewPicName("");
    setNewPicRole("");
    setNewPicEmail("");
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
      {/* Tabs Header */}
      <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-3 gap-2">
        <button
          onClick={() => setActiveTab("area")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-xs font-bold transition-all border-b-2 ${
            activeTab === "area"
              ? "bg-white text-amber-600 border-amber-500 shadow-xs"
              : "text-slate-500 border-transparent hover:text-slate-800"
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Master Area / Lokasi ({areas.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("category")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-xs font-bold transition-all border-b-2 ${
            activeTab === "category"
              ? "bg-white text-amber-600 border-amber-500 shadow-xs"
              : "text-slate-500 border-transparent hover:text-slate-800"
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          <span>Master Kategori ({categories.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("pic")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-xs font-bold transition-all border-b-2 ${
            activeTab === "pic"
              ? "bg-white text-amber-600 border-amber-500 shadow-xs"
              : "text-slate-500 border-transparent hover:text-slate-800"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Master PIC Person In Charge ({pics.length})</span>
        </button>
      </div>

      {/* Tab 1: Area */}
      {activeTab === "area" && (
        <div className="p-5 space-y-4">
          <form onSubmit={handleAddArea} className="flex gap-2">
            <input
              type="text"
              required
              placeholder="Nama Area Baru (contoh: Malang Timur)..."
              value={newAreaName}
              onChange={(e) => setNewAreaName(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 text-amber-400 font-bold rounded-lg text-xs flex items-center gap-1.5 hover:bg-slate-800 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Area</span>
            </button>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2">
            {areas.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50"
              >
                <span className="text-xs font-semibold text-slate-800">{a.name}</span>
                <button
                  onClick={() => onDeleteArea(a.id)}
                  className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                  title="Hapus Area"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Category */}
      {activeTab === "category" && (
        <div className="p-5 space-y-4">
          <form onSubmit={handleAddCat} className="flex gap-2">
            <input
              type="text"
              required
              placeholder="Nama Kategori Baru (contoh: Procurement & Asset)..."
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 text-amber-400 font-bold rounded-lg text-xs flex items-center gap-1.5 hover:bg-slate-800 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Kategori</span>
            </button>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2">
            {categories.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50"
              >
                <span className="text-xs font-semibold text-slate-800">{c.name}</span>
                <button
                  onClick={() => onDeleteCategory(c.id)}
                  className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                  title="Hapus Kategori"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: PIC */}
      {activeTab === "pic" && (
        <div className="p-5 space-y-4">
          <form onSubmit={handleAddPic} className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <input
              type="text"
              required
              placeholder="Nama PIC..."
              value={newPicName}
              onChange={(e) => setNewPicName(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <input
              type="text"
              placeholder="Jabatan / Divisi..."
              value={newPicRole}
              onChange={(e) => setNewPicRole(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <input
              type="email"
              placeholder="Email..."
              value={newPicEmail}
              onChange={(e) => setNewPicEmail(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 text-amber-400 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 hover:bg-slate-800 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah PIC</span>
            </button>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2">
            {pics.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50"
              >
                <div>
                  <div className="text-xs font-bold text-slate-800">{p.name}</div>
                  <div className="text-[10px] text-slate-500">{p.role || "Staff Operasional"}</div>
                </div>
                <button
                  onClick={() => onDeletePic(p.id)}
                  className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                  title="Hapus PIC"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
