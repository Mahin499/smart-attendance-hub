import React, { createContext, useContext, useState, useCallback } from "react";

export type UserRole = "principal" | "faculty";

export interface User {
  id: string;
  username: string;
  role: UserRole;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Mock users for demo
const MOCK_USERS: (User & { password: string })[] = [
  { id: "1", username: "principal", password: "admin123", role: "principal", name: "Dr. Sarah Mitchell" },
  { id: "2", username: "faculty1", password: "faculty123", role: "faculty", name: "Prof. James Wilson" },
  { id: "3", username: "faculty2", password: "faculty123", role: "faculty", name: "Dr. Emily Chen" },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback(async (username: string, password: string) => {
    const found = MOCK_USERS.find(u => u.username === username && u.password === password);
    if (found) {
      const { password: _, ...userData } = found;
      setUser(userData);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => setUser(null), []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
