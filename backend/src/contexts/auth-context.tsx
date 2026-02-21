"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "BARBEIRO" | "CLIENTE";
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // 1. Ao carregar a página, verifica se tem cookie salvo
    const token = Cookies.get("barber.token");
    const storedUser = Cookies.get("barber.user");

    if (token && storedUser) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  function login(token: string, userData: User) {
    // ⚠️ AQUI ESTÁ A CORREÇÃO: path: '/'
    Cookies.set("barber.token", token, { expires: 7, path: "/" });
    Cookies.set("barber.user", JSON.stringify(userData), {
      expires: 7,
      path: "/",
    });

    api.defaults.headers["Authorization"] = `Bearer ${token}`;
    setUser(userData);

    if (userData.role === "BARBEIRO") {
      router.push("/dashboard");
    } else {
      router.push("/");
    }
  }

  function logout() {
    // Também precisa do path para remover corretamente
    Cookies.remove("barber.token", { path: "/" });
    Cookies.remove("barber.user", { path: "/" });
    setUser(null);
    router.push("/login");
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, login, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
