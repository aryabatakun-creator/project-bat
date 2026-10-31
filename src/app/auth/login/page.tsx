"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/lib/authContext";
import { createClient } from "@/lib/supabase/client";
import { AppRole } from "@/lib/types";
import { verifyUserCredentials, fetchRemoteUsers } from "@/lib/userStore";

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
      // 1. Try Supabase Auth if connected (with 2.5s timeout to prevent hanging)
      const supabase = createClient();
      if (supabase && email && password) {
        try {
          const authPromise = supabase.auth.signInWithPassword({
            email,
            password,
          });
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("Auth timeout")), 2500)
          );
          const { data, error } = await Promise.race([authPromise, timeoutPromise]);

          if (!error && data?.user) {
            // Successfully logged in via Supabase Auth
            const { data: profile } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", data.user.id)
              .single();

            await login(
              data.user.email || email,
              (profile?.role as AppRole) || (data.user.user_metadata?.role as AppRole) || "supervisor",
              profile?.full_name || (data.user.user_metadata?.full_name as string) || email.split("@")[0],
              data.user.id
            );
            router.push("/dashboard");
            return;
          }
        } catch {
          // Timeout or connection notice, proceed directly to app_users verification
        }
      }

      // 2. Authenticate against registered users in userStore (refresh from remote first if available)
      await fetchRemoteUsers();
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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 bg-white border border-slate-200/90 px-4 py-2 rounded-2xl mb-4 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-[#0B1026] border border-slate-200/80 p-0.5 flex items-center justify-center shadow-xs overflow-hidden shrink-0">
              <img
                src="/images/satpam-logo.png"
                alt="Logo Satpam NPN"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="text-left">
              <span className="text-xs font-black tracking-widest text-slate-900 block">
                NPN - PROJECT BAT
              </span>
              <span className="text-[9px] text-slate-500 font-semibold tracking-wider block">
                MONITORING &amp; FOLLOW UP TRACKER
              </span>
            </div>
          </div>

          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            NPN - PROJECT BAT PORTAL
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Operational Monitoring &amp; Follow Up Tracker
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-200/70">
          <form onSubmit={handleLogin} className="space-y-4">
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Alamat Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@bat-tracker.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                  title={showPassword ? "Sembunyikan sandi" : "Tampilkan sandi"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 hover:shadow-lg hover:shadow-amber-500/30 transition-all cursor-pointer disabled:opacity-50"
            >
              <span>{isLoading ? "Memproses..." : "Masuk ke Sistem"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Footer info */}
        <div className="text-center mt-6">
          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
            <span>Supported by</span>
            <img
              src="/images/orstedlabs-logo-light.png"
              alt="OrstedLabs"
              className="h-4 w-auto object-contain inline-block"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
