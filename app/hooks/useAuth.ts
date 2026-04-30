"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { authApi, ApiError, type AuthResponse } from "@/app/lib/api-client";

export type AuthState = {
  email: string;
  role: "USER" | "ADMIN";
} | null;

export function useAuth() {
  const [auth, setAuth] = useState<AuthState>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Sync from localStorage
  const syncAuth = useCallback(() => {
    try {
      const stored = localStorage.getItem("sb_auth");
      setAuth(stored ? JSON.parse(stored) : null);
    } catch {
      setAuth(null);
    }
  }, []);

  useEffect(() => {
    syncAuth();
    window.addEventListener("sb_auth_change", syncAuth);
    return () => window.removeEventListener("sb_auth_change", syncAuth);
  }, [syncAuth]);

  const persistAuth = (data: AuthResponse) => {
    localStorage.setItem("sb_token", data.token);
    localStorage.setItem("sb_auth", JSON.stringify({ email: data.email, role: data.role }));
    window.dispatchEvent(new Event("sb_auth_change"));
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authApi.login(email, password);
      persistAuth(data);
      router.push(data.role === "ADMIN" ? "/admin" : "/dashboard");
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Błąd logowania.";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await authApi.register(email, password);
      const data = await authApi.login(email, password);
      persistAuth(data);
      router.push("/dashboard");
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Błąd rejestracji.";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("sb_token");
    localStorage.removeItem("sb_auth");
    window.dispatchEvent(new Event("sb_auth_change"));
    router.push("/");
  };

  return { auth, loading, error, login, register, logout, isAdmin: auth?.role === "ADMIN" };
}
