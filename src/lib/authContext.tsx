"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { AppRole, UserProfile } from "./types";
import { createClient } from "./supabase/client";

interface AuthContextType {
  user: UserProfile;
  setUserProfile: (profile: UserProfile) => void;
  setRole: (role: AppRole) => void;
  login: (email: string, role?: AppRole, fullName?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const defaultUser: UserProfile = {
  id: "user-admin-1",
  full_name: "Admin Operasional",
  role: "admin",
  email: "admin@bat-tracker.com",
};

const AuthContext = createContext<AuthContextType>({
  user: defaultUser,
  setUserProfile: () => {},
  setRole: () => {},
  login: async () => true,
  logout: async () => {},
  isLoading: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile>(() => {
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("bat_active_user");
      if (savedUser) {
        try {
          return JSON.parse(savedUser);
        } catch {
          // ignore
        }
      }
      const savedRole = localStorage.getItem("bat_active_role") as AppRole;
      if (savedRole) {
        return {
          ...defaultUser,
          role: savedRole,
          full_name:
            savedRole === "admin"
              ? "Admin Operasional"
              : savedRole === "management"
              ? "Area Management"
              : "Field Supervisor",
        };
      }
    }
    return defaultUser;
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
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
              if (typeof window !== "undefined") {
                localStorage.setItem("bat_active_user", JSON.stringify(u));
              }
            }
          });
      }
    });
  }, []);

  const setUserProfile = (profile: UserProfile) => {
    setUser(profile);
    if (typeof window !== "undefined") {
      localStorage.setItem("bat_active_user", JSON.stringify(profile));
      localStorage.setItem("bat_active_role", profile.role);
    }
  };

  const setRole = (role: AppRole) => {
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

  const login = async (email: string, role: AppRole = "supervisor", fullName?: string) => {
    setIsLoading(true);
    try {
      const newUser: UserProfile = {
        id: `user-${Date.now()}`,
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
      localStorage.removeItem("bat_active_user");
    }
    setUser(defaultUser);
  };

  return (
    <AuthContext.Provider value={{ user, setUserProfile, setRole, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
