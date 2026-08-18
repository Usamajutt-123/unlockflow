"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Background from "../Background";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
    // on success, onAuthStateChange will update the session automatically
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-night-950 px-5">
      <Background />
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-purple-600 shadow-glow">
            <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none">
              <path d="M13.19 4.39a3.36 3.36 0 0 1 4.75 0l1.67 1.67a3.36 3.36 0 0 1 0 4.75l-3.3 3.3a3.36 3.36 0 0 1-4.75 0M10.81 19.61a3.36 3.36 0 0 1-4.75 0l-1.67-1.67a3.36 3.36 0 0 1 0-4.75l3.3-3.3a3.36 3.36 0 0 1 4.75 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="mt-4 font-display text-3xl font-extrabold text-white">Admin</h1>
          <p className="mt-2 text-slate-400">Sign in to access the UNLOCKFLOW dashboard</p>
        </div>

        <div className="rounded-2xl border border-night-700 bg-night-900/80 p-7 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]">
          <form onSubmit={login} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                className="field"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="field"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full !py-3.5 disabled:opacity-60">
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Restricted area — authorized admins only.
        </p>
      </div>
    </div>
  );
}
