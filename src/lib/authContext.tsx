"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { AppRole, UserProfile } from "./types";
import { createClient } from "./supabase/client";

interface AuthContextType {
  user: UserProfile;
  setRole: (role: AppRole) => void;
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
  setRole: () => {},
  isLoading: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile>(() => {
    if (typeof window !== "undefined") {
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
              setUser({
                id: authUser.id,
                full_name: profile.full_name || authUser.email || "User",
                role: profile.role || "supervisor",
                email: authUser.email,
              });
            }
          });
      }
    });
  }, []);

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
    setUser(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("bat_active_role", role);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setRole, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
