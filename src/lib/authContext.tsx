"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { AppRole, UserProfile } from "./types";
import { createClient } from "./supabase/client";

interface AuthContextType {
  user: UserProfile;
  isAuthenticated: boolean;
  isHydrated: boolean;
  setUserProfile: (profile: UserProfile) => void;
  setRole: (role: AppRole) => void;
  login: (email: string, role?: AppRole, fullName?: string, userId?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const SESSION_KEY = "bat_auth_session_v3";
const AUTH_EPOCH_KEY = "bat_auth_reset_epoch";
const CURRENT_AUTH_EPOCH = "2026-11-13-force-relogin-v3";

function purgeAllAuthTokensAndCaches(keepEpoch: boolean = true) {
  if (typeof window === "undefined") return;
  try {
    localStorage.clear();
    if (keepEpoch) {
      localStorage.setItem(AUTH_EPOCH_KEY, CURRENT_AUTH_EPOCH);
    }
  } catch {}
  try {
    sessionStorage.clear();
  } catch {}
  try {
    if (document.cookie) {
      document.cookie.split(";").forEach((c) => {
        const eqIdx = c.indexOf("=");
        const name = (eqIdx > -1 ? c.slice(0, eqIdx) : c).trim();
        if (name) {
          document.cookie = `${name}=; Max-Age=0; path=/`;
        }
      });
    }
  } catch {}
  try {
    if ("caches" in window) {
      window.caches.keys().then((names) => {
        names.forEach((name) => {
          window.caches.delete(name);
        });
      });
    }
  } catch {}
}

const guestUser: UserProfile = {
  id: "",
  full_name: "",
  role: "supervisor",
  email: "",
};

const AuthContext = createContext<AuthContextType>({
  user: guestUser,
  isAuthenticated: false,
  isHydrated: false,
  setUserProfile: () => {},
  setRole: () => {},
  login: async () => true,
  logout: async () => {},
  isLoading: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile>(guestUser);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    if (typeof window !== "undefined") {
      const currentEpoch = localStorage.getItem(AUTH_EPOCH_KEY);
      if (currentEpoch !== CURRENT_AUTH_EPOCH) {
        purgeAllAuthTokensAndCaches(true);
        if (supabase) {
          supabase.auth.signOut().catch(() => {});
        }
        setUser(guestUser);
        setIsAuthenticated(false);
        setIsHydrated(true);
        return;
      }

      const savedSession = localStorage.getItem(SESSION_KEY);
      if (savedSession) {
        try {
          const parsed = JSON.parse(savedSession) as UserProfile;
          if (parsed && parsed.email && parsed.role) {
            setUser(parsed);
            setIsAuthenticated(true);
          }
        } catch {
          localStorage.removeItem(SESSION_KEY);
        }
      } else {
        localStorage.removeItem("bat_auth_session_v2");
        localStorage.removeItem("bat_active_user");
        localStorage.removeItem("bat_active_role");
      }
    }
    setIsHydrated(true);
  }, []);

  const setUserProfile = (profile: UserProfile) => {
    setUser(profile);
    setIsAuthenticated(true);
    if (typeof window !== "undefined") {
      localStorage.setItem(AUTH_EPOCH_KEY, CURRENT_AUTH_EPOCH);
      localStorage.setItem(SESSION_KEY, JSON.stringify(profile));
      localStorage.setItem("bat_active_user", JSON.stringify(profile));
      localStorage.setItem("bat_active_role", profile.role);
    }
  };

  const setRole = (role: AppRole) => {
    if (!isAuthenticated) return;
    const updated = {
      ...user,
      role,
      full_name:
        role === "admin"
          ? "Admin Operasional"
          : role === "management"
          ? "Area Management"
          : "Field Supervisor",
    };
    setUserProfile(updated);
  };

  const login = async (
    email: string,
    role: AppRole = "supervisor",
    fullName?: string,
    userId?: string
  ) => {
    setIsLoading(true);
    try {
      const newUser: UserProfile = {
        id: userId || user.id || `user-${Date.now()}`,
        full_name: fullName || (email.split("@")[0].toUpperCase()),
        role,
        email,
      };
      setUserProfile(newUser);
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    const supabase = createClient();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch {}
    }
    purgeAllAuthTokensAndCaches(true);
    setIsAuthenticated(false);
    setUser(guestUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isHydrated,
        setUserProfile,
        setRole,
        login,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
