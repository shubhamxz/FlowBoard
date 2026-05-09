"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface User { id: number; email: string; role: string; }
interface Member { id: number; email: string; role: string; firstName?: string; lastName?: string; }
interface Task {
  id: number; title: string; description: string; status: string;
  priority: string; assigned_to: number; due_date: string | null;
  due_time: string | null; recurring: boolean; created_by: number;
}
interface Project { id: number; name: string; description: string; created_by: number; }

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

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [allUsers, setAllUsers] = useState<{ id: number; email: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskAssignee, setTaskAssignee] = useState<number>(0);
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskDueTime, setTaskDueTime] = useState("");
  const [taskPriority, setTaskPriority] = useState<"low" | "medium" | "high">("medium");
  const [taskRecurring, setTaskRecurring] = useState(false);
  const [taskError, setTaskError] = useState("");

  const [showMemberForm, setShowMemberForm] = useState(false);
  const [newMemberId, setNewMemberId] = useState<number>(0);

  const load = async () => {
    try {
      const [meRes, projRes, usersRes] = await Promise.all([
        fetch("/api/auth/me").then((r) => r.json()),
        fetch(`/api/projects/${projectId}`).then((r) => r.json()),
        fetch("/api/users").then((r) => r.json()),
      ]);
      setUser(meRes.user);
      if (projRes.error) { setError(projRes.error); }
      else {
        setProject(projRes.project);
        setMembers(projRes.members || []);
        setTasks(projRes.tasks || []);
      }
      setAllUsers(usersRes.users || []);
    } catch { setError("Failed to load project"); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [projectId]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setTaskError("");
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: parseInt(projectId),
          title: taskTitle, description: taskDesc,
          assignedTo: taskAssignee,
          dueDate: taskDueDate || null, dueTime: taskDueTime || null,
          priority: taskPriority, recurring: taskRecurring,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTaskTitle(""); setTaskDesc(""); setTaskDueDate(""); setTaskDueTime("");
      setTaskPriority("medium"); setTaskRecurring(false);
      setShowTaskForm(false);
      load();
    } catch (err: any) { setTaskError(err.message); }
  };

  const handleStatusChange = async (taskId: number, status: string) => {
    await fetch(`/api/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  };

  const handleDeleteTask = async (taskId: number) => {
    await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
    load();
  };

  const handleAddMember = async () => {
    if (!newMemberId) return;
    await fetch(`/api/projects/${projectId}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: newMemberId }),
    });
    setShowMemberForm(false); setNewMemberId(0);
    load();
  };

  const handleRemoveMember = async (userId: number) => {
    await fetch(`/api/projects/${projectId}/members`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    load();
  };

  const getMemberEmail = (id: number) => {
    const m = members.find((m) => m.id === id);
    return m ? m.email.split("@")[0] : "—";
  };

  const isOverdue = (t: Task) => {
    if (!t.due_date || t.status === "done") return false;
    return new Date(t.due_date) < new Date();
  };

  if (loading) return (
    <main className="flex min-h-screen items-center justify-center">
      <p className="section-title">Loading project</p>
    </main>
  );

  if (error || !project) return (
    <main className="flex min-h-screen items-center justify-center flex-col gap-4">
      <p className="text-sm text-gray-500">{error || "Project not found"}</p>
      <Link href="/projects" className="btn-ghost">← Back to Projects</Link>
    </main>
  );

  const todo = tasks.filter((t) => t.status === "todo");
  const doing = tasks.filter((t) => t.status === "doing");
  const done = tasks.filter((t) => t.status === "done");
  const nonMembers = allUsers.filter((u) => !members.find((m) => m.id === u.id));

  const statusActions: Record<string, { label: string; to: string }[]> = {
    todo: [{ label: "Start →", to: "doing" }],
    doing: [{ label: "← Back", to: "todo" }, { label: "Complete ✓", to: "done" }],
    done: [{ label: "← Reopen", to: "doing" }],
  };

  const priorityBadge = (p: string) => {
    const cls = p === "high" ? "badge-high" : p === "medium" ? "badge-medium" : "badge-low";
    return <span className={`badge ${cls}`}>{p}</span>;
  };

  const getTaskBorderStyle = (task: Task) => {
    if (task.status === "done") return "border-green-400 bg-green-50/50 border-l-4";
    if (isOverdue(task)) return "border-red-400 bg-red-50/50 border-l-4";
    return "border-gray-200 hover:border-gray-400";
  };

  const TaskCard = ({ task }: { task: Task }) => (
    <div className={`border bg-white p-4 mb-2 group transition-colors ${getTaskBorderStyle(task)}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className={`text-[13px] font-medium leading-snug ${task.status === "done" ? "text-green-700 line-through" : "text-gray-900"}`}>
          {task.title}
        </h4>
        {(user?.role === "admin" || task.created_by === user?.id) && (
          <button onClick={() => handleDeleteTask(task.id)}
            className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-black text-xs transition-opacity">✕</button>
        )}
      </div>
      {task.description && <p className="text-[11px] text-gray-400 mb-3 leading-relaxed">{task.description}</p>}
      <div className="flex items-center justify-between text-[11px] mb-3">
        <span className="text-gray-400">→ {getMemberEmail(task.assigned_to)}</span>
        <div className="flex items-center gap-2">
          {priorityBadge(task.priority)}
          {task.recurring && <span className="badge badge-low">↻</span>}
        </div>
      </div>
      {task.due_date && (
        <div className={`text-[11px] mb-3 ${isOverdue(task) ? "text-red-600 font-semibold" : task.status === "done" ? "text-green-600" : "text-gray-400"}`}>
          {isOverdue(task) && "⚠ "}{task.status === "done" ? "✓ " : ""}Due {task.due_date}{task.due_time ? ` at ${task.due_time}` : ""}
        </div>
      )}
      <div className="flex gap-1.5">
        {statusActions[task.status]?.map((action) => (
          <button key={action.to} onClick={() => handleStatusChange(task.id, action.to)}
            className="btn-ghost text-[10px] py-1 px-2">{action.label}</button>
        ))}
      </div>
    </div>
  );

  const ColumnHeader = ({ title, count, status }: { title: string; count: number; status: string }) => (
    <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 ${status === "todo" ? "bg-gray-400" : status === "doing" ? "bg-black" : "bg-gray-300"}`} />
        <span className="section-title">{title}</span>
      </div>
      <span className="text-[11px] text-gray-300 tabular-nums">{count}</span>
    </div>
  );

  return (
    <main className="min-h-screen">
      <nav className="border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-lg font-bold tracking-tighter text-black">FLOWBOARD</Link>
            <div className="hidden sm:flex items-center gap-1">
              <Link href="/dashboard" className="px-3 py-1.5 text-[11px] uppercase tracking-wider font-medium text-gray-500 hover:text-black">Dashboard</Link>
              <Link href="/projects" className="px-3 py-1.5 text-[11px] uppercase tracking-wider font-medium text-gray-500 hover:text-black">Projects</Link>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowTaskForm(!showTaskForm)} className="btn-ghost">
              {showTaskForm ? "Cancel" : "+ Task"}
            </button>
            {user?.role === "admin" && (
              <button onClick={() => setShowMemberForm(!showMemberForm)} className="btn-ghost">
                {showMemberForm ? "Cancel" : "+ Member"}
              </button>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8 animate-in">
          <Link href="/projects" className="section-title hover:text-black block mb-4">← Back</Link>
          <h2 className="text-2xl font-bold tracking-tighter text-black uppercase">{project.name}</h2>
          {project.description && <p className="text-xs text-gray-500 mt-1">{project.description}</p>}
        </div>

        <div className="card-elevated p-6 mb-6 animate-in">
          <div className="flex items-center justify-between mb-3">
            <span className="section-title">Project Progress</span>
            <span className="text-xs text-gray-500 tabular-nums">{done.length}/{tasks.length} completed</span>
          </div>
          <ProgressBar done={done.length} total={tasks.length} size="lg" />
          <div className="grid grid-cols-3 gap-4 mt-5">
            <div className="bg-white border border-gray-200 px-4 py-3 text-center">
              <p className="text-lg font-bold text-gray-500 tabular-nums">{todo.length}</p>
              <p className="text-[10px] uppercase tracking-widest text-gray-400">To Do</p>
            </div>
            <div className="bg-white border border-gray-200 px-4 py-3 text-center">
              <p className="text-lg font-bold text-black tabular-nums">{doing.length}</p>
              <p className="text-[10px] uppercase tracking-widest text-gray-400">Active</p>
            </div>
            <div className="bg-white border border-gray-200 px-4 py-3 text-center">
              <p className="text-lg font-bold text-gray-400 tabular-nums">{done.length}</p>
              <p className="text-[10px] uppercase tracking-widest text-gray-400">Done</p>
            </div>
          </div>
        </div>

        <div className="mb-6 animate-in">
          <span className="section-title block mb-3">Team ({members.length})</span>
          <div className="flex flex-wrap gap-2">
            {members.map((m) => (
              <div key={m.id} className="member-tag">
                <span className="w-1.5 h-1.5 bg-gray-400" />
                <span>{m.email}</span>
                <span className="role-label">{m.role}</span>
                {user?.role === "admin" && m.id !== project.created_by && (
                  <button onClick={() => handleRemoveMember(m.id)} className="text-gray-300 hover:text-black text-[10px] ml-1">✕</button>
                )}
              </div>
            ))}
          </div>
          {showMemberForm && nonMembers.length > 0 && (
            <div className="mt-3 flex gap-2 max-w-md">
              <select value={newMemberId} onChange={(e) => setNewMemberId(parseInt(e.target.value))}>
                <option value={0}>Select user to add...</option>
                {nonMembers.map((u) => <option key={u.id} value={u.id}>{u.email}</option>)}
              </select>
              <button onClick={handleAddMember} className="btn-ghost flex-shrink-0">Add</button>
            </div>
          )}
          {showMemberForm && nonMembers.length === 0 && (
            <p className="text-[11px] text-gray-400 mt-2">All registered users are already members</p>
          )}
        </div>

        {showTaskForm && (
          <div className="card-elevated p-6 mb-6 animate-in">
            <div className="text-center mb-6">
              <h3 className="text-sm font-bold tracking-tighter text-black uppercase">Add Task</h3>
              <div className="w-full h-px bg-gray-200 mt-3 relative">
                <div className="absolute left-0 top-0 w-1/3 h-px bg-black" />
              </div>
            </div>
            {taskError && <div className="alert-error mb-4">✕ {taskError}</div>}
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <input value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} required placeholder="Task Name" />
                </div>
                <div>
                  <select value={taskAssignee} onChange={(e) => setTaskAssignee(parseInt(e.target.value))} required>
                    <option value={0}>Assign To</option>
                    {members.map((m) => <option key={m.id} value={m.id}>{m.email}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <input type="date" value={taskDueDate} onChange={(e) => setTaskDueDate(e.target.value)} placeholder="Due Date" />
                </div>
                <div>
                  <input type="time" value={taskDueTime} onChange={(e) => setTaskDueTime(e.target.value)} placeholder="Due Time" />
                </div>
                <div>
                  <select disabled>
                    <option>Tag Member For Notification</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">Priority</span>
                  <div className="radio-group">
                    <label>
                      <input type="radio" name="priority" checked={taskPriority === "low"} onChange={() => setTaskPriority("low")} />
                      <span>Low</span>
                    </label>
                    <label>
                      <input type="radio" name="priority" checked={taskPriority === "medium"} onChange={() => setTaskPriority("medium")} />
                      <span>Medium</span>
                    </label>
                    <label>
                      <input type="radio" name="priority" checked={taskPriority === "high"} onChange={() => setTaskPriority("high")} />
                      <span>High</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">Recurring Task</span>
                  <div className="radio-group">
                    <label>
                      <input type="radio" name="recurring" checked={taskRecurring} onChange={() => setTaskRecurring(true)} />
                      <span>Yes</span>
                    </label>
                    <label>
                      <input type="radio" name="recurring" checked={!taskRecurring} onChange={() => setTaskRecurring(false)} />
                      <span>No</span>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <textarea
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  placeholder="Description"
                  rows={3}
                  className="resize-none"
                  style={{ background: 'white', color: 'black', border: '1px solid #d4d4d4', padding: '0.625rem 0.75rem', width: '100%', fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', outline: 'none', borderRadius: 0 }}
                />
              </div>

              <div className="text-center pt-2">
                <button type="submit" className="btn-primary px-10">Save</button>
              </div>
            </form>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-5 animate-in">
          <div>
            <ColumnHeader title="To Do" count={todo.length} status="todo" />
            {todo.map((t) => <TaskCard key={t.id} task={t} />)}
            {todo.length === 0 && <p className="text-[11px] text-gray-300 py-4">No tasks</p>}
          </div>
          <div>
            <ColumnHeader title="In Progress" count={doing.length} status="doing" />
            {doing.map((t) => <TaskCard key={t.id} task={t} />)}
            {doing.length === 0 && <p className="text-[11px] text-gray-300 py-4">No tasks</p>}
          </div>
          <div>
            <ColumnHeader title="Done" count={done.length} status="done" />
            {done.map((t) => <TaskCard key={t.id} task={t} />)}
            {done.length === 0 && <p className="text-[11px] text-gray-300 py-4">No tasks</p>}
          </div>
        </div>
      </div>
    </main>
  );
}
