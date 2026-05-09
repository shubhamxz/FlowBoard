"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface User { id: number; email: string; role: string; }
interface Project { id: number; name: string; description: string; created_by: number; }

export default function ProjectsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<{ id: number; email: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [memberIds, setMemberIds] = useState<number[]>([]);
  const [formError, setFormError] = useState("");

  const load = () => {
    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/projects").then((r) => r.json()),
      fetch("/api/users").then((r) => r.json()),
    ]).then(([me, p, u]) => {
      setUser(me.user);
      setProjects(p.projects || []);
      setUsers(u.users || []);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description: desc, memberIds }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setName(""); setDesc(""); setMemberIds([]); setShowForm(false);
      load();
    } catch (err: any) {
      setFormError(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this project and all its tasks?")) return;
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    load();
  };

  const toggleMember = (uid: number) => {
    setMemberIds((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
    );
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="section-title">Loading projects</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <nav className="border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-lg font-bold tracking-tighter text-black">FLOWBOARD</Link>
            <div className="hidden sm:flex items-center gap-1">
              <Link href="/dashboard" className="px-3 py-1.5 text-[11px] uppercase tracking-wider font-medium text-gray-500 hover:text-black">Dashboard</Link>
              <Link href="/projects" className="px-3 py-1.5 text-[11px] uppercase tracking-wider font-medium text-black bg-black/5 border border-gray-200">Projects</Link>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-gray-400 uppercase tracking-wider hidden sm:block">{user?.role}</span>
            {user?.role === "admin" && (
              <button onClick={() => setShowForm(!showForm)} className="btn-ghost">
                {showForm ? "Cancel" : "+ New Project"}
              </button>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-8 animate-in">
          <h2 className="text-2xl font-bold tracking-tighter text-black">Projects</h2>
          <p className="text-xs text-gray-500 mt-1">{projects.length} project{projects.length !== 1 ? "s" : ""}</p>
        </div>

        {showForm && (
          <div className="card-elevated p-6 mb-8 animate-in">
            <h3 className="section-title mb-5">New Project</h3>
            {formError && <div className="alert-error mb-4">✕ {formError}</div>}
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Project Name</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Website Redesign" />
                </div>
                <div>
                  <label className="label">Description</label>
                  <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Optional description" />
                </div>
              </div>
              <div>
                <label className="label">Team Members</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {users.filter((u) => u.id !== user?.id).map((u) => (
                    <button key={u.id} type="button" onClick={() => toggleMember(u.id)}
                      className={`px-3 py-1.5 text-[11px] border transition-colors ${
                        memberIds.includes(u.id)
                          ? "bg-black text-white border-black font-semibold"
                          : "border-gray-300 text-gray-500 hover:border-gray-500"
                      }`}>
                      {u.email}
                    </button>
                  ))}
                  {users.filter((u) => u.id !== user?.id).length === 0 && (
                    <p className="text-[11px] text-gray-400">No other users registered yet</p>
                  )}
                </div>
              </div>
              <button type="submit" className="btn-primary">Create Project</button>
            </form>
          </div>
        )}

        {projects.length === 0 ? (
          <div className="card text-center py-16 animate-in">
            <p className="text-sm text-gray-500 mb-1">No projects yet</p>
            <p className="text-[11px] text-gray-400 mb-6">
              {user?.role === "admin" ? "Create your first project to get started" : "Ask an admin to add you to a project"}
            </p>
            {user?.role === "admin" && <button onClick={() => setShowForm(true)} className="btn-primary">Create Project</button>}
          </div>
        ) : (
          <div className="space-y-3 animate-in">
            {projects.map((p, i) => (
              <div key={p.id} className="card flex items-center justify-between group">
                <Link href={`/projects/${p.id}`} className="flex-1 min-w-0">
                  <div className="flex items-center gap-4">
                    <span className="text-[11px] text-gray-300 tabular-nums w-6">{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-800 group-hover:text-black uppercase tracking-wide">{p.name}</h3>
                      <p className="text-[11px] text-gray-400 mt-0.5">{p.description || "No description"}</p>
                    </div>
                  </div>
                </Link>
                <div className="flex items-center gap-2 ml-4">
                  <Link href={`/projects/${p.id}`} className="btn-ghost">Open</Link>
                  {user?.role === "admin" && (
                    <button onClick={() => handleDelete(p.id)} className="btn-danger">Delete</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
