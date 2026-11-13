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

const SESSION_KEY = "bat_auth_session_v2";

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
    let restored = false;
    if (typeof window !== "undefined") {
      const savedSession = localStorage.getItem(SESSION_KEY);
      if (savedSession) {
        try {
          const parsed = JSON.parse(savedSession) as UserProfile;
          if (parsed && parsed.email && parsed.role) {
            setUser(parsed);
            setIsAuthenticated(true);
            restored = true;
          }
        } catch {
          localStorage.removeItem(SESSION_KEY);
        }
      }
      if (!restored) {
        // Clear legacy auto-admin fallback keys so unauthenticated users must login first
        localStorage.removeItem("bat_active_user");
        localStorage.removeItem("bat_active_role");
      }
    }
    setIsHydrated(true);

    const supabase = createClient();
    if (!supabase) return;

    supabase.auth.getUser().then(({ data: { user: authUser } }) => {
      if (authUser) {
        supabase
          .from("profiles")
          .select("*")
          .eq("id", authUser.id)
          .single()
          .then(({ data: profile }) => {
            if (profile) {
              const u: UserProfile = {
                id: authUser.id,
                full_name: profile.full_name || authUser.email || "User",
                role: profile.role || "supervisor",
                email: authUser.email,
              };
              setUser(u);
              setIsAuthenticated(true);
              if (typeof window !== "undefined") {
                localStorage.setItem(SESSION_KEY, JSON.stringify(u));
                localStorage.setItem("bat_active_user", JSON.stringify(u));
              }
            }
          });
      }
    });
  }, []);

  const setUserProfile = (profile: UserProfile) => {
    setUser(profile);
    setIsAuthenticated(true);
    if (typeof window !== "undefined") {
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
      await supabase.auth.signOut();
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem("bat_active_user");
      localStorage.removeItem("bat_active_role");
    }
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
