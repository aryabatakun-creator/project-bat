import { UserProfile } from "./types";
import { createClient } from "./supabase/client";

export const MAX_USERS_LIMIT = 10;

export const DEFAULT_USERS: UserProfile[] = [
  {
    id: "usr-admin-1",
    full_name: "Admin Operasional",
    email: "admin@bat-tracker.com",
    role: "admin",
    password: "Password123",
  },
  {
    id: "usr-mgmt-1",
    full_name: "Area Management",
    email: "management@bat-tracker.com",
    role: "management",
    password: "Password123",
  },
  {
    id: "usr-spv-1",
    full_name: "Field Supervisor",
    email: "supervisor@bat-tracker.com",
    role: "supervisor",
    password: "Password123",
  },
];

const STORAGE_KEY = "bat_registered_users";

export function getStoredUsers(): UserProfile[] {
  if (typeof window === "undefined") return DEFAULT_USERS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Ensure all existing users have default password if missing
      return parsed.map((u: any) => ({
        ...u,
        password: u.password || "Password123",
      }));
    }
  } catch (err) {
    console.error("Failed to read stored users:", err);
  }
  return DEFAULT_USERS;
}

export function isUserLimitReached(usersCount: number): boolean {
  return usersCount >= MAX_USERS_LIMIT;
}

export function saveStoredUsers(users: UserProfile[]) {
  if (typeof window === "undefined") return;
  try {
    const capped = users.slice(0, MAX_USERS_LIMIT);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(capped));
  } catch (err) {
    console.error("Failed to save stored users:", err);
  }
}

/**
 * Fetches users from remote Supabase (app_users table) to synchronize across devices (iPhone, Android, Web).
 * Falls back to local storage cache if table does not exist or connection fails.
 */
export async function fetchRemoteUsers(): Promise<UserProfile[]> {
  const local = getStoredUsers();
  const supabase = createClient();
  if (!supabase) return local;

  try {
    const { data, error } = await supabase
      .from("app_users")
      .select("*")
      .order("created_at", { ascending: true });

    if (!error && data && data.length > 0) {
      const merged: UserProfile[] = data.map((u: any) => ({
        id: u.id,
        full_name: u.full_name,
        email: (u.email || "").toLowerCase().trim(),
        role: u.role,
        password: u.password || "Password123",
      }));
      saveStoredUsers(merged);
      return merged;
    }
  } catch (err) {
    console.warn("Notice: fetchRemoteUsers falling back to local cache:", err);
  }

  return local;
}

/**
 * Saves or updates a user in both local storage and remote Supabase (app_users table).
 */
export async function saveRemoteUser(user: UserProfile): Promise<boolean> {
  const current = getStoredUsers();
  const userEmail = (user.email || "").toLowerCase().trim();
  const exists = current.some(
    (u) =>
      u.id === user.id ||
      (u.email || "").toLowerCase().trim() === userEmail
  );
  const updated = exists
    ? current.map((u) =>
        u.id === user.id ||
        (u.email || "").toLowerCase().trim() === userEmail
          ? user
          : u
      )
    : [user, ...current];

  saveStoredUsers(updated);

  const supabase = createClient();
  if (supabase) {
    try {
      const { error } = await supabase.from("app_users").upsert({
        id: user.id,
        full_name: user.full_name,
        email: userEmail,
        role: user.role,
        password: user.password || "Password123",
      });

      if (error) {
        console.warn("Notice saving user to Supabase app_users:", error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn("Exception saving user to Supabase app_users:", err);
      return false;
    }
  }
  return true;
}

/**
 * Deletes a user from both local storage and remote Supabase (app_users table).
 */
export async function deleteRemoteUser(id: string): Promise<boolean> {
  const current = getStoredUsers();
  const updated = current.filter((u) => u.id !== id);
  saveStoredUsers(updated);

  const supabase = createClient();
  if (supabase) {
    try {
      await supabase.from("app_users").delete().eq("id", id);
      return true;
    } catch (err) {
      console.warn("Notice deleting user from Supabase app_users:", err);
      return false;
    }
  }
  return true;
}

/**
 * Updates a user's password in both local storage and remote Supabase.
 */
export async function updateRemoteUserPassword(id: string, newPassword: string): Promise<boolean> {
  const current = getStoredUsers();
  const updated = current.map((u) => (u.id === id ? { ...u, password: newPassword } : u));
  saveStoredUsers(updated);

  const supabase = createClient();
  if (supabase) {
    try {
      await supabase.from("app_users").update({ password: newPassword }).eq("id", id);
      return true;
    } catch (err) {
      console.warn("Notice updating password in Supabase app_users:", err);
      return false;
    }
  }
  return true;
}

export function verifyUserCredentials(
  email: string,
  pass: string
): { success: boolean; user?: UserProfile; message?: string } {
  const users = getStoredUsers();
  const trimmedEmail = email.trim().toLowerCase();
  const matched = users.find(
    (u) => (u.email || "").trim().toLowerCase() === trimmedEmail
  );

  if (!matched) {
    return {
      success: false,
      message: `Akun dengan email "${email}" tidak terdaftar. Hubungi Administrator untuk didaftarkan di Master Data.`,
    };
  }

  const expectedPassword = matched.password || "Password123";
  if (pass !== expectedPassword) {
    return {
      success: false,
      message: "Kata sandi salah. Silakan periksa kembali kata sandi Anda.",
    };
  }

  return {
    success: true,
    user: matched,
  };
}
