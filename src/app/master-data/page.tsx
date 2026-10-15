"use client";

import React, { useState, useEffect } from "react";
import { ShieldAlert, Database } from "lucide-react";
import { MasterTabs } from "@/components/master/MasterTabs";
import { 
  initialAreas, 
  initialCategories, 
  initialPics 
} from "@/lib/mockData";
import { MasterArea, MasterCategory, MasterPic } from "@/lib/types";
import { useAuth } from "@/lib/authContext";
import { createClient } from "@/lib/supabase/client";

export default function MasterDataPage() {
  const { user } = useAuth();
  const [areas, setAreas] = useState<MasterArea[]>(initialAreas);
  const [categories, setCategories] = useState<MasterCategory[]>(initialCategories);
  const [pics, setPics] = useState<MasterPic[]>(initialPics);

  // Load from Supabase if available
  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    Promise.all([
      supabase.from("master_areas").select("*"),
      supabase.from("master_categories").select("*"),
      supabase.from("master_pics").select("*"),
    ]).then(([resAreas, resCats, resPics]) => {
      if (resAreas.data && resAreas.data.length > 0) setAreas(resAreas.data);
      if (resCats.data && resCats.data.length > 0) setCategories(resCats.data);
      if (resPics.data && resPics.data.length > 0) setPics(resPics.data);
    });
  }, []);

  // Handlers for Area
  const handleAddArea = async (name: string) => {
    const newArea: MasterArea = { id: `area-${Date.now()}`, name };
    setAreas((prev) => [...prev, newArea]);
    const supabase = createClient();
    if (supabase) {
      await supabase.from("master_areas").insert({ name });
    }
  };

  const handleDeleteArea = async (id: string) => {
    if (confirm("Hapus area ini dari master data?")) {
      setAreas((prev) => prev.filter((a) => a.id !== id));
      const supabase = createClient();
      if (supabase) {
        await supabase.from("master_areas").delete().eq("id", id);
      }
    }
  };

  // Handlers for Category
  const handleAddCategory = async (name: string) => {
    const newCat: MasterCategory = { id: `cat-${Date.now()}`, name };
    setCategories((prev) => [...prev, newCat]);
    const supabase = createClient();
    if (supabase) {
      await supabase.from("master_categories").insert({ name });
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm("Hapus kategori ini dari master data?")) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      const supabase = createClient();
      if (supabase) {
        await supabase.from("master_categories").delete().eq("id", id);
      }
    }
  };

  // Handlers for PIC
  const handleAddPic = async (name: string, role: string, email: string) => {
    const newPic: MasterPic = { id: `pic-${Date.now()}`, name, role, email };
    setPics((prev) => [...prev, newPic]);
    const supabase = createClient();
    if (supabase) {
      await supabase.from("master_pics").insert({ name, role, email });
    }
  };

  const handleDeletePic = async (id: string) => {
    if (confirm("Hapus PIC ini dari master data?")) {
      setPics((prev) => prev.filter((p) => p.id !== id));
      const supabase = createClient();
      if (supabase) {
        await supabase.from("master_pics").delete().eq("id", id);
      }
    }
  };

  // RBAC Guard: If not admin, block view
  if (user.role !== "admin") {
    return (
      <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center max-w-lg mx-auto my-12 shadow-sm">
        <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-1">
          Akses Dibatasi (Admin Only)
        </h2>
        <p className="text-xs text-slate-500 mb-6">
          Halaman Master Data hanya dapat dikonfigurasi oleh user dengan hak akses <strong>Admin</strong>. Sesi Anda saat ini login sebagai role: <span className="capitalize font-bold text-slate-800">{user.role}</span>.
        </p>
        <p className="text-[11px] text-slate-400">
          Gunakan pill <em>&quot;POV Role: Admin&quot;</em> di pojok kanan atas header untuk menguji akses sebagai Admin.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600">
          <Database className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-base font-bold text-slate-900 tracking-tight">
            Konfigurasi Master Data Operasional
          </h1>
          <p className="text-xs text-slate-500">
            Kelola Area / Lokasi, Kategori Kasus, dan Master PIC (Khusus Administrator)
          </p>
        </div>
      </div>

      {/* Tabs Component */}
      <MasterTabs
        areas={areas}
        categories={categories}
        pics={pics}
        onAddArea={handleAddArea}
        onDeleteArea={handleDeleteArea}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
        onAddPic={handleAddPic}
        onDeletePic={handleDeletePic}
      />
    </div>
  );
}
