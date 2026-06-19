"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "login") {
        await auth.login(email, password);
      } else {
        await auth.signup(username, email, password);
      }
      router.push("/admin/workflows");
    } catch (err: any) {
      setError(err?.message ?? "Auth failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-br from-zinc-50 to-white">
      <div className="w-full max-w-xl p-8">
        <div className="rounded-2xl bg-white p-8 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">{mode === "login" ? "Sign in" : "Create account"}</h2>
            <div className="text-sm text-zinc-500">Secure access to your workflows</div>
          </div>

          <div className="mb-6 flex gap-2">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 rounded-md px-4 py-2 ${mode === "login" ? "bg-zinc-900 text-white" : "border"}`}
            >
              Sign in
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`flex-1 rounded-md px-4 py-2 ${mode === "signup" ? "bg-zinc-900 text-white" : "border"}`}
            >
              Sign up
            </button>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-sm text-zinc-600 mb-1">Username</label>
                <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full rounded-md border px-3 py-2" />
              </div>
            )}

            <div>
              <label className="block text-sm text-zinc-600 mb-1">Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-md border px-3 py-2" />
            </div>

            <div>
              <label className="block text-sm text-zinc-600 mb-1">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-md border px-3 py-2" />
            </div>

            {error && <div className="text-sm text-red-600">{error}</div>}

            <div className="flex items-center justify-between gap-4">
              <button type="submit" disabled={loading} className="rounded-md bg-zinc-900 px-4 py-2 text-white">
                {loading ? "Working…" : mode === "login" ? "Sign in" : "Create account"}
              </button>
              <div className="text-sm text-zinc-600">By continuing you accept terms.</div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
