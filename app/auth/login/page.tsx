"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center border-r border-gray-200 relative bg-gray-50">
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} />
        <div className="text-center relative z-10">
          <h1 className="text-5xl font-bold tracking-tighter text-black mb-1">FLOW</h1>
          <h1 className="text-5xl font-bold tracking-tighter" style={{ WebkitTextStroke: '1.5px black', color: 'transparent' }}>BOARD</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mt-6">Task Management System</p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center px-6">
        <div className="w-full max-w-sm animate-in">
          <Link href="/" className="section-title hover:text-black block mb-10">← Home</Link>
          <h1 className="text-3xl font-bold tracking-tighter text-black mb-1">Sign In</h1>
          <p className="text-xs text-gray-500 mb-8">Enter your credentials to continue</p>

          {error && <div className="alert-error mb-6">✕ {error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email</label>
              <input type="email" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="divider my-8" />
          <p className="text-xs text-gray-500 text-center">
            No account?{" "}
            <Link href="/auth/register" className="text-black underline underline-offset-4 hover:no-underline">Create one</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
