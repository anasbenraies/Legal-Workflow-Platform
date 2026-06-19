"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type User = { id: string; username: string; email: string } | null;

type AuthContext = {
  user: User;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const ctx = createContext<AuthContext | null>(null);

export function useAuth() {
  const c = useContext(ctx);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("lf_auth");
      if (raw) {
        const parsed = JSON.parse(raw);
        setToken(parsed.token ?? null);
        setUser(parsed.user ?? null);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  async function persist(t: string | null, u: User | null) {
    setToken(t);
    setUser(u);
    if (t && u) {
      localStorage.setItem("lf_auth", JSON.stringify({ token: t, user: u }));
    } else {
      localStorage.removeItem("lf_auth");
    }
  }

  async function login(email: string, password: string) {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Login failed");
    await persist(json.token, json.user);
  }

  async function signup(username: string, email: string, password: string) {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Signup failed");
    await persist(json.token, json.user);
  }

  function logout() {
    persist(null, null);
  }

  return (
    <ctx.Provider value={{ user, token, login, signup, logout }}>{children}</ctx.Provider>
  );
}

export default AuthProvider;
