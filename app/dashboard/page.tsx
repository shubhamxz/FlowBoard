"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface User { id: number; email: string; role: string; firstName?: string; lastName?: string; }
interface Task {
  id: number; title: string; status: string; priority: string;
  project_id: number; assigned_to: number;
  due_date: string | null; due_time: string | null;
  recurring: boolean; created_at: string;
}
interface Project { id: number; name: string; description: string; }

function ProgressBar({ done, total, size = "sm" }: { done: number; total: number; size?: "sm" | "lg" }) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return (
    <div className="flex items-center gap-3">
      <div className={size === "lg" ? "progress-track-lg flex-1" : "progress-track flex-1"}>
        <div className={size === "lg" ? "progress-fill-lg" : "progress-fill"} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[11px] text-gray-500 font-medium tabular-nums w-10 text-right">{pct}%</span>
    </div>
  );
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/tasks").then((r) => r.json()),
      fetch("/api/projects").then((r) => r.json()),
    ]).then(([me, t, p]) => {
      setUser(me.user);
      setTasks(t.tasks || []);
      setProjects(p.projects || []);
      setLoading(false);
    });
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/me", { method: "DELETE" });
    window.location.href = "/";
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-center animate-in">
          <div className="progress-track w-32 mx-auto mb-4">
            <div className="progress-fill" style={{ width: "60%" }} />
          </div>
          <p className="section-title">Loading dashboard</p>
        </div>
      </main>
    );
  }

  const todo = tasks.filter((t) => t.status === "todo");
  const doing = tasks.filter((t) => t.status === "doing");
  const done = tasks.filter((t) => t.status === "done");
  const highPriority = tasks.filter((t) => t.priority === "high" && t.status !== "done");
  const overdue = tasks.filter((t) => {
    if (!t.due_date || t.status === "done") return false;
    return new Date(t.due_date) < new Date();
  });

  const projectTasks = (pid: number) => tasks.filter((t) => t.project_id === pid);
  const projectDone = (pid: number) => tasks.filter((t) => t.project_id === pid && t.status === "done");

  const priorityBadge = (p: string) => {
    const cls = p === "high" ? "badge-high" : p === "medium" ? "badge-medium" : "badge-low";
    return <span className={`badge ${cls}`}>{p}</span>;
  };

  return (
    <main className="min-h-screen">
      <nav className="border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-lg font-bold tracking-tighter text-black">FLOWBOARD</h1>
            <div className="hidden sm:flex items-center gap-1">
              <Link href="/dashboard" className="px-3 py-1.5 text-[11px] uppercase tracking-wider font-medium text-black bg-black/5 border border-gray-200">
                Dashboard
              </Link>
              <Link href="/projects" className="px-3 py-1.5 text-[11px] uppercase tracking-wider font-medium text-gray-500 hover:text-black">
                Projects
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-gray-700">{user?.email}</p>
              <p className="text-[10px] uppercase tracking-widest text-gray-400">{user?.role}</p>
            </div>
            <button onClick={handleLogout} className="btn-ghost">Logout</button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8 animate-in">
          <h2 className="text-2xl font-bold tracking-tighter text-black">Dashboard</h2>
          <p className="text-xs text-gray-500 mt-1">Overview of all your projects and tasks</p>
        </div>

        <div className="card-elevated p-6 mb-8 animate-in">
          <div className="flex items-center justify-between mb-3">
            <span className="section-title">Overall Progress</span>
            <span className="text-xs text-gray-500">{done.length} of {tasks.length} tasks completed</span>
          </div>
          <ProgressBar done={done.length} total={tasks.length} size="lg" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8 animate-in">
          <div className="bg-white border border-gray-200 p-5">
            <p className="section-title mb-3">Total</p>
            <p className="text-3xl font-bold text-black tabular-nums">{tasks.length}</p>
          </div>
          <div className="bg-white border border-gray-200 p-5">
            <p className="section-title mb-3">To Do</p>
            <p className="text-3xl font-bold text-gray-500 tabular-nums">{todo.length}</p>
          </div>
          <div className="bg-white border border-gray-200 p-5">
            <p className="section-title mb-3">In Progress</p>
            <p className="text-3xl font-bold text-black tabular-nums">{doing.length}</p>
          </div>
          <div className="bg-white border border-gray-200 p-5">
            <p className="section-title mb-3">Completed</p>
            <p className="text-3xl font-bold text-gray-400 tabular-nums">{done.length}</p>
          </div>
          <div className="bg-white border border-gray-200 p-5">
            <p className="section-title mb-3">High Priority</p>
            <p className="text-3xl font-bold text-black tabular-nums">{highPriority.length}</p>
          </div>
        </div>

        {overdue.length > 0 && (
          <div className="border border-gray-300 bg-gray-50 p-5 mb-8 animate-in">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-black text-sm">⚠</span>
              <span className="section-title text-black">Overdue Tasks ({overdue.length})</span>
            </div>
            <div className="space-y-2">
              {overdue.map((t) => (
                <div key={t.id} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 bg-black" />
                    <span className="text-sm text-gray-800">{t.title}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {priorityBadge(t.priority)}
                    <span className="text-[11px] text-gray-500">Due {t.due_date}</span>
                    <span className="badge badge-doing">{t.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="animate-in">
            <div className="flex items-center justify-between mb-4">
              <span className="section-title">Projects ({projects.length})</span>
              <Link href="/projects" className="section-title hover:text-black">View All →</Link>
            </div>
            {projects.length === 0 ? (
              <div className="card text-center py-10">
                <p className="text-sm text-gray-400 mb-4">No projects yet</p>
                {user?.role === "admin" && <Link href="/projects" className="btn-ghost">Create Project</Link>}
              </div>
            ) : (
              <div className="space-y-3">
                {projects.slice(0, 5).map((p) => {
                  const pt = projectTasks(p.id);
                  const pd = projectDone(p.id);
                  return (
                    <Link key={p.id} href={`/projects/${p.id}`} className="card block group">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-sm font-semibold text-gray-800 group-hover:text-black uppercase tracking-wide">{p.name}</h3>
                          <p className="text-[11px] text-gray-400 mt-0.5">{pt.length} tasks · {pd.length} done</p>
                        </div>
                        <span className="text-[11px] text-gray-300 group-hover:text-gray-600">→</span>
                      </div>
                      <ProgressBar done={pd.length} total={pt.length} />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <div className="animate-in">
            <span className="section-title block mb-4">Recent Tasks</span>
            {tasks.length === 0 ? (
              <div className="card text-center py-10">
                <p className="text-sm text-gray-400">No tasks yet</p>
              </div>
            ) : (
              <div className="border border-gray-200">
                {tasks.slice(0, 8).map((t, i) => {
                  const taskOverdue = t.due_date && t.status !== "done" && new Date(t.due_date) < new Date();
                  const borderLeft = t.status === "done" ? "border-l-4 border-l-green-400" : taskOverdue ? "border-l-4 border-l-red-400" : "";
                  return (
                    <div key={t.id} className={`flex items-center justify-between px-4 py-3 ${borderLeft} ${i < Math.min(tasks.length, 8) - 1 ? "border-b border-gray-200" : ""}`}>
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`w-1.5 h-1.5 flex-shrink-0 ${
                          t.status === "done" ? "bg-green-400" : taskOverdue ? "bg-red-400" : t.status === "doing" ? "bg-black" : "bg-gray-400"
                        }`} />
                        <span className={`text-sm truncate ${t.status === "done" ? "text-green-700 line-through" : taskOverdue ? "text-red-700" : "text-gray-800"}`}>
                          {t.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                        {priorityBadge(t.priority)}
                        <span className={`badge ${
                          t.status === "todo" ? "badge-todo" : t.status === "doing" ? "badge-doing" : "badge-done"
                        }`}>{t.status}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
