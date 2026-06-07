import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type UserRole = "patient" | "doctor";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  specialization?: string;
  avatar?: string;
}

interface StoredUser extends User {
  password: string;
}

export interface HistoryEntry {
  id: string;
  email: string;
  action: "signup" | "login" | "logout" | "failed-login";
  timestamp: string;
  detail?: string;
}

interface AuthResult {
  ok: boolean;
  error?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => AuthResult;
  signup: (name: string, email: string, password: string, role: UserRole) => AuthResult;
  logout: () => void;
  isAuthenticated: boolean;
  history: HistoryEntry[];
  validatePassword: (pw: string) => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_KEY = "medicare.users";
const SESSION_KEY = "medicare.session";
const HISTORY_KEY = "medicare.history";

// Common/weak passwords blocklist
const COMMON_PASSWORDS = new Set([
  "password", "password1", "password123", "12345678", "123456789", "qwerty",
  "qwerty123", "abc12345", "111111", "iloveyou", "admin", "admin123",
  "letmein", "welcome", "welcome1", "monkey", "dragon", "sunshine",
  "princess", "football", "baseball", "master", "shadow", "qwertyuiop",
  "asdfghjkl", "zxcvbnm", "00000000", "1q2w3e4r", "passw0rd", "test1234",
]);

function loadUsers(): Record<string, StoredUser> {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "{}");
  } catch {
    return {};
  }
}
function saveUsers(u: Record<string, StoredUser>) {
  localStorage.setItem(USERS_KEY, JSON.stringify(u));
}
function loadHistory(): HistoryEntry[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}

// Seed demo accounts if empty (cannot be re-created after deletion)
function seedDemoUsers() {
  const users = loadUsers();
  if (Object.keys(users).length === 0) {
    users["patient@demo.com"] = {
      id: "p1", name: "Sarah Johnson", email: "patient@demo.com",
      role: "patient", password: "Demo@Pass1",
    };
    users["doctor@demo.com"] = {
      id: "d1", name: "Dr. James Wilson", email: "doctor@demo.com",
      role: "doctor", specialization: "Cardiology", password: "Demo@Pass1",
    };
    saveUsers(users);
  }
}

function validatePassword(pw: string): string | null {
  if (pw.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Z]/.test(pw)) return "Add at least one uppercase letter";
  if (!/[a-z]/.test(pw)) return "Add at least one lowercase letter";
  if (!/[0-9]/.test(pw)) return "Add at least one number";
  if (!/[^A-Za-z0-9]/.test(pw)) return "Add at least one symbol";
  if (COMMON_PASSWORDS.has(pw.toLowerCase())) return "This password is too common";
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    seedDemoUsers();
    setHistory(loadHistory());
    try {
      const s = localStorage.getItem(SESSION_KEY);
      if (s) setUser(JSON.parse(s));
    } catch {}
  }, []);

  const pushHistory = (entry: Omit<HistoryEntry, "id" | "timestamp">) => {
    const next: HistoryEntry = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };
    const updated = [next, ...loadHistory()].slice(0, 100);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    setHistory(updated);
  };

  const signup = (name: string, email: string, password: string, role: UserRole): AuthResult => {
    const key = email.trim().toLowerCase();
    if (!name.trim() || !key) return { ok: false, error: "Name and email are required" };
    const users = loadUsers();
    if (users[key]) {
      return { ok: false, error: "Account already exists. Accounts can only be created once." };
    }
    const pwError = validatePassword(password);
    if (pwError) return { ok: false, error: pwError };

    const newUser: StoredUser = {
      id: `${role[0]}-${Date.now()}`,
      name: name.trim(),
      email: key,
      role,
      password,
      specialization: role === "doctor" ? "General Medicine" : undefined,
    };
    users[key] = newUser;
    saveUsers(users);
    const { password: _, ...publicUser } = newUser;
    setUser(publicUser);
    localStorage.setItem(SESSION_KEY, JSON.stringify(publicUser));
    pushHistory({ email: key, action: "signup", detail: `${role} account created` });
    return { ok: true };
  };

  const login = (email: string, password: string, role: UserRole): AuthResult => {
    const key = email.trim().toLowerCase();
    const users = loadUsers();
    const found = users[key];
    if (!found) {
      pushHistory({ email: key, action: "failed-login", detail: "no such account" });
      return { ok: false, error: "No account found. Please sign up first." };
    }
    if (found.password !== password) {
      pushHistory({ email: key, action: "failed-login", detail: "wrong password" });
      return { ok: false, error: "Incorrect password" };
    }
    if (found.role !== role) {
      pushHistory({ email: key, action: "failed-login", detail: "wrong role" });
      return { ok: false, error: `This account is registered as ${found.role}` };
    }
    const { password: _, ...publicUser } = found;
    setUser(publicUser);
    localStorage.setItem(SESSION_KEY, JSON.stringify(publicUser));
    pushHistory({ email: key, action: "login", detail: `${role} signed in` });
    return { ok: true };
  };

  const logout = () => {
    if (user) pushHistory({ email: user.email, action: "logout" });
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, signup, logout, isAuthenticated: !!user, history, validatePassword }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
