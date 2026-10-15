"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/authContext";
import { createClient } from "@/lib/supabase/client";
import { AppRole } from "@/lib/types";
import { verifyUserCredentials } from "@/lib/userStore";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      // 1. Try Supabase Auth if connected
      const supabase = createClient();
      if (supabase && email && password) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (!error && data.user) {
          // Successfully logged in via Supabase Auth
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", data.user.id)
            .single();

          await login(
            data.user.email || email,
            (profile?.role as AppRole) || "supervisor",
            profile?.full_name || email.split("@")[0]
          );
          router.push("/dashboard");
          return;
        }
      }

      // 2. Authenticate against registered users in userStore
      const verification = verifyUserCredentials(email, password);
      if (!verification.success || !verification.user) {
        setErrorMsg(verification.message || "Email atau kata sandi tidak sesuai.");
        return;
      }

      await login(
        verification.user.email || email,
        verification.user.role,
        verification.user.full_name
      );
      router.push("/dashboard");
    } catch (err: any) {
      setErrorMsg(err?.message || "Gagal masuk. Silakan periksa kredensial Anda.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 bg-slate-900/90 border border-slate-800 px-4 py-2 rounded-2xl mb-4 shadow-xl">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center font-black text-slate-950 text-sm shadow">
              BAT
            </div>
            <div className="text-left">
              <span className="text-xs font-black tracking-widest text-white block">
                NAWAKARA
              </span>
              <span className="text-[9px] text-slate-400 font-semibold tracking-wider block">
                PERKASA NUSANTARA
              </span>
            </div>
          </div>

          <h1 className="text-2xl font-black text-white tracking-tight">
            PROJECT BAT PORTAL
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Operational Case Monitoring &amp; Follow-Up System
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-md">
          <form onSubmit={handleLogin} className="space-y-4">
            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 font-medium">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Alamat Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@bat-tracker.com"
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi..."
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 focus:outline-none"
                  title={showPassword ? "Sembunyikan sandi" : "Tampilkan sandi"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <span>{isLoading ? "Memproses..." : "Masuk ke Sistem"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Account Guidance Note */}
          <div className="mt-5 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold text-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
              <span>Informasi Kredensial Akun</span>
            </div>
            <p>
              Akun pengguna &amp; hak akses dikelola oleh Administrator di menu <strong>Master Data</strong>.
            </p>
            <div className="text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-800/80">
              Default Password Akun: <span className="text-amber-400 font-bold">Password123</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-[10px] text-slate-400 mt-6">
          &copy; {new Date().getFullYear()} Nawakara Perkasa Nusantara &amp; Project BAT. Hak cipta dilindungi.
        </p>
      </div>
    </div>
  );
}
