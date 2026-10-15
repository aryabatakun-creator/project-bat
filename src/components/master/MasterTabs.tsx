"use client";

import React, { useState } from "react";
import { Plus, Trash2, MapPin, Tag, Users, UserPlus, Shield, Key } from "lucide-react";
import { MasterArea, MasterCategory, MasterPic, UserProfile, AppRole } from "@/lib/types";

interface MasterTabsProps {
  areas: MasterArea[];
  categories: MasterCategory[];
  pics: MasterPic[];
  users?: UserProfile[];
  onAddArea: (name: string) => void;
  onDeleteArea: (id: string) => void;
  onAddCategory: (name: string) => void;
  onDeleteCategory: (id: string) => void;
  onAddPic: (name: string, role: string, email: string) => void;
  onDeletePic: (id: string) => void;
  onAddUser?: (name: string, email: string, role: AppRole, password?: string) => void;
  onDeleteUser?: (id: string) => void;
}

export function MasterTabs({
  areas,
  categories,
  pics,
  users = [],
  onAddArea,
  onDeleteArea,
  onAddCategory,
  onDeleteCategory,
  onAddPic,
  onDeletePic,
  onAddUser,
  onDeleteUser,
}: MasterTabsProps) {
  const [activeTab, setActiveTab] = useState<"area" | "category" | "pic" | "users">("area");

  // Local form states
  const [newAreaName, setNewAreaName] = useState("");
  const [newCatName, setNewCatName] = useState("");
  const [newPicName, setNewPicName] = useState("");
  const [newPicRole, setNewPicRole] = useState("");
  const [newPicEmail, setNewPicEmail] = useState("");

  // User form states
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState<AppRole>("supervisor");
  const [newUserPassword, setNewUserPassword] = useState("");

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

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;
    if (onAddUser) {
      onAddUser(newUserName.trim(), newUserEmail.trim(), newUserRole, newUserPassword.trim());
    }
    setNewUserName("");
    setNewUserEmail("");
    setNewUserPassword("");
    setNewUserRole("supervisor");
  };

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
      {/* Tabs Header */}
      <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-3 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("area")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
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
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
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
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
            activeTab === "pic"
              ? "bg-white text-amber-600 border-amber-500 shadow-xs"
              : "text-slate-500 border-transparent hover:text-slate-800"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Master PIC ({pics.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
            activeTab === "users"
              ? "bg-white text-amber-600 border-amber-500 shadow-xs"
              : "text-slate-500 border-transparent hover:text-slate-800"
          }`}
        >
          <Shield className="w-3.5 h-3.5 text-amber-500" />
          <span>Kelola Akun User ({users.length})</span>
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
              className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 text-amber-400 font-bold rounded-xl text-xs flex items-center gap-1.5 hover:bg-slate-800 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Area</span>
            </button>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2">
            {areas.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                <span className="text-xs font-bold text-slate-800">{a.name}</span>
                <button
                  onClick={() => onDeleteArea(a.id)}
                  className="p-1 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
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
              className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 text-amber-400 font-bold rounded-xl text-xs flex items-center gap-1.5 hover:bg-slate-800 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Kategori</span>
            </button>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2">
            {categories.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                <span className="text-xs font-bold text-slate-800">{c.name}</span>
                <button
                  onClick={() => onDeleteCategory(c.id)}
                  className="p-1 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
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
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <input
              type="text"
              placeholder="Jabatan / Divisi..."
              value={newPicRole}
              onChange={(e) => setNewPicRole(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <input
              type="email"
              placeholder="Email..."
              value={newPicEmail}
              onChange={(e) => setNewPicEmail(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 text-amber-400 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 hover:bg-slate-800 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah PIC</span>
            </button>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2">
            {pics.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                <div>
                  <div className="text-xs font-bold text-slate-800">{p.name}</div>
                  <div className="text-[10px] text-slate-500">{p.role || "Staff Operasional"}</div>
                  {p.email && <div className="text-[10px] text-slate-400">{p.email}</div>}
                </div>
                <button
                  onClick={() => onDeletePic(p.id)}
                  className="p-1 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                  title="Hapus PIC"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Kelola Akun User (Admin Setup) */}
      {activeTab === "users" && (
        <div className="p-5 space-y-5">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3.5 text-xs text-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Pengaturan Hak Akses (RBAC)</strong>: Akun yang didaftarkan di sini dapat langsung masuk melalui halaman Login.
              </span>
            </div>
            <span className="text-[10px] font-bold uppercase text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
              Admin Control
            </span>
          </div>

          {/* Form Tambah Akun Baru */}
          <form onSubmit={handleAddUserSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-2.5">
            <input
              type="text"
              required
              placeholder="Nama Lengkap User..."
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <input
              type="email"
              required
              placeholder="Email Login..."
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <select
              value={newUserRole}
              onChange={(e) => setNewUserRole(e.target.value as AppRole)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
            >
              <option value="supervisor">Field Supervisor (Input/Update)</option>
              <option value="management">Management (Read-Only KPI)</option>
              <option value="admin">Admin Operasional (Full Access)</option>
            </select>
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 text-amber-400 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 hover:bg-slate-800 shadow-xs transition-colors cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Buat Akun User</span>
            </button>
          </form>

          {/* User Account List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {users.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors shadow-2xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-slate-800 text-amber-400 font-black text-xs flex items-center justify-center shrink-0">
                    {u.full_name ? u.full_name.slice(0, 2).toUpperCase() : "US"}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-800 truncate">{u.full_name}</div>
                    <div className="text-[10px] text-slate-500 truncate">{u.email || "-"}</div>
                    <div className="mt-1">
                      <span
                        className={`inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          u.role === "admin"
                            ? "bg-amber-100 text-amber-800"
                            : u.role === "management"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-sky-100 text-sky-800"
                        }`}
                      >
                        {u.role}
                      </span>
                    </div>
                  </div>
                </div>
                {onDeleteUser && (
                  <button
                    onClick={() => onDeleteUser(u.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                    title="Hapus Akun"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
