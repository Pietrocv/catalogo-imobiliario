import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import type { User, UserRole } from "../types";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => void;
};

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  realEstateId?: string;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState(() => localStorage.getItem("catalogo.token"));
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("catalogo.user");
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (!token) return;
    api<{ user: User }>("/me")
      .then((data) => setUser(data.user))
      .catch(() => logout());
  }, [token]);

  async function login(email: string, password: string) {
    const data = await api<{ token: string; user: User }>("/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
    persist(data.token, data.user);
    return data.user;
  }

  async function register(payload: RegisterPayload) {
    const data = await api<{ token: string; user: User }>("/register", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    persist(data.token, data.user);
    return data.user;
  }

  function persist(nextToken: string, nextUser: User) {
    localStorage.setItem("catalogo.token", nextToken);
    localStorage.setItem("catalogo.user", JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  }

  function logout() {
    localStorage.removeItem("catalogo.token");
    localStorage.removeItem("catalogo.user");
    setToken(null);
    setUser(null);
  }

  const value = useMemo(() => ({ user, token, login, register, logout }), [user, token]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return context;
}
