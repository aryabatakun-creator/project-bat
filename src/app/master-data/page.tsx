"use client";

import React, { useState, useEffect } from "react";
import { ShieldAlert, Database } from "lucide-react";
import { MasterTabs } from "@/components/master/MasterTabs";
import { MasterArea, MasterLocation, MasterCategory, MasterPic, UserProfile, AppRole } from "@/lib/types";
import { useAuth } from "@/lib/authContext";
import { createClient } from "@/lib/supabase/client";
import { getStoredUsers, saveStoredUsers, MAX_USERS_LIMIT } from "@/lib/userStore";
import {
  fetchAllAppData,
  getCachedData,
  createMasterArea,
  removeMasterArea,
  createMasterLocation,
  removeMasterLocation,
  createMasterCategory,
  removeMasterCategory,
  createMasterPic,
  removeMasterPic,
} from "@/lib/dataService";

export default function MasterDataPage() {
  const { user } = useAuth();
  const [areas, setAreas] = useState<MasterArea[]>(() => getCachedData().areas);
  const [locations, setLocations] = useState<MasterLocation[]>(
    () => getCachedData().locations
  );
  const [categories, setCategories] = useState<MasterCategory[]>(
    () => getCachedData().categories
  );
  const [pics, setPics] = useState<MasterPic[]>(() => getCachedData().pics);
  const [users, setUsers] = useState<UserProfile[]>(() => getStoredUsers());

  // Load from Supabase & local persistence
  useEffect(() => {
    fetchAllAppData().then((res) => {
      setAreas(res.areas);
      setLocations(res.locations);
      setCategories(res.categories);
      setPics(res.pics);
    });
    setUsers(getStoredUsers());
  }, []);

  // Handlers for Area
  const handleAddArea = async (name: string) => {
    const next = await createMasterArea(name, areas);
    setAreas(next);
  };

  const handleDeleteArea = async (id: string) => {
    if (confirm("Hapus area ini dari master data?")) {
      const next = await removeMasterArea(id, areas);
      setAreas(next);
    }
  };

  // Handlers for Location
  const handleAddLocation = async (areaId: string, name: string) => {
    const selectedArea = areas.find((a) => a.id === areaId) || areas[0];
    const next = await createMasterLocation(
      areaId,
      selectedArea?.name || "",
      name,
      locations
    );
    setLocations(next);
  };

  const handleDeleteLocation = async (id: string) => {
    if (confirm("Hapus lokasi ini dari master data?")) {
      const next = await removeMasterLocation(id, locations);
      setLocations(next);
    }
  };

  // Handlers for Category
  const handleAddCategory = async (name: string) => {
    const next = await createMasterCategory(name, categories);
    setCategories(next);
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm("Hapus kategori ini dari master data?")) {
      const next = await removeMasterCategory(id, categories);
      setCategories(next);
    }
  };

  // Handlers for PIC
  const handleAddPic = async (name: string, role: string, email: string) => {
    const next = await createMasterPic(name, role, email, pics);
    setPics(next);
  };

  const handleDeletePic = async (id: string) => {
    if (confirm("Hapus PIC ini dari master data?")) {
      const next = await removeMasterPic(id, pics);
      setPics(next);
    }
  };

  // Handlers for User Management
  const handleAddUser = async (name: string, email: string, role: AppRole, password?: string) => {
    if (users.length >= MAX_USERS_LIMIT) {
      alert(`Batas maksimal ${MAX_USERS_LIMIT} user telah tercapai. Sistem telah mengunci pembuatan user baru.`);
      return;
    }
    const cleanEmail = email.trim().toLowerCase();
    const isDuplicate = users.some((u) => (u.email || "").trim().toLowerCase() === cleanEmail);
    if (isDuplicate) {
      alert(`User dengan email "${email}" sudah terdaftar.`);
      return;
    }

    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      full_name: name,
      email: cleanEmail,
      role,
      password: password || "Password123",
    };
    const updated = [newUser, ...users];
    setUsers(updated);
    saveStoredUsers(updated);

    const supabase = createClient();
    if (supabase) {
      try {
        await supabase.auth.signUp({
          email,
          password: password || "Password123",
          options: {
            data: {
              full_name: name,
              role,
            },
          },
        });
      } catch (err) {
        console.warn("Auth signup notice:", err);
      }
      // Insert profile metadata
      await supabase.from("profiles").upsert({
        id: newUser.id,
        full_name: name,
        role,
      });
    }
  };

  const handleUpdatePassword = (id: string, newPassword: string) => {
    const updated = users.map((u) => (u.id === id ? { ...u, password: newPassword } : u));
    setUsers(updated);
    saveStoredUsers(updated);
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm("Hapus akun user ini dari sistem?")) {
      const updated = users.filter((u) => u.id !== id);
      setUsers(updated);
      saveStoredUsers(updated);
      const supabase = createClient();
      if (supabase) {
        await supabase.from("profiles").delete().eq("id", id);
      }
    }
  };

  // RBAC Guard: If not admin, block view
  if (user.role !== "admin") {
    return (
      <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center max-w-lg mx-auto my-12 shadow-sm">
        <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-1">
          Akses Dibatasi (Admin Only)
        </h2>
        <p className="text-xs text-slate-500 mb-6">
          Halaman Master Data hanya dapat dikonfigurasi oleh user dengan hak akses <strong>Admin</strong>. Sesi Anda saat ini masuk sebagai: <span className="capitalize font-bold text-slate-800">{user.role}</span>.
        </p>
        <p className="text-[11px] text-slate-400">
          Silakan keluar dan masuk kembali menggunakan akun berwenang Administrator jika perlu melakukan konfigurasi.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="bg-white p-4.5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-black text-slate-900 tracking-tight">
              Konfigurasi Master Data &amp; Akun User
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola Master Area, Master Lokasi, Kategori Kasus, Master PIC, dan Manajemen Akun Pengguna (Admin Only)
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Component */}
      <MasterTabs
        areas={areas}
        locations={locations}
        categories={categories}
        pics={pics}
        users={users}
        onAddArea={handleAddArea}
        onDeleteArea={handleDeleteArea}
        onAddLocation={handleAddLocation}
        onDeleteLocation={handleDeleteLocation}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
        onAddPic={handleAddPic}
        onDeletePic={handleDeletePic}
        onAddUser={handleAddUser}
        onDeleteUser={handleDeleteUser}
        onUpdatePassword={handleUpdatePassword}
      />
    </div>
  );
}
