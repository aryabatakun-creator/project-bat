import { UserProfile } from "./types";

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
