
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password_hash: string;
  role: "admin" | "member";
  attendance: boolean;
  timesheet: boolean;
  created_at: Date;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  created_by: number;
  created_at: Date;
}

export interface ProjectMember {
  project_id: number;
  user_id: number;
  created_at: Date;
}

export interface Task {
  id: number;
  project_id: number;
  title: string;
  description: string;
  status: "todo" | "doing" | "done";
  priority: "low" | "medium" | "high";
  assigned_to: number;
  due_date: string | null;
  due_time: string | null;
  recurring: boolean;
  created_by: number;
  created_at: Date;
  updated_at: Date;
}

interface Store {
  users: User[];
  projects: Project[];
  projectMembers: ProjectMember[];
  tasks: Task[];
  _uid: number;
  _pid: number;
  _tid: number;
}

declare global {
  var __flowboard_db: Store | undefined;
}

function getStore(): Store {
  if (!globalThis.__flowboard_db) {
    globalThis.__flowboard_db = {
      users: [],
      projects: [],
      projectMembers: [],
      tasks: [],
      _uid: 1,
      _pid: 1,
      _tid: 1,
    };
  }
  return globalThis.__flowboard_db;
}

export const db = {
  userCreate(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password_hash: string;
    role: "admin" | "member";
    attendance: boolean;
    timesheet: boolean;
  }): User {
    const s = getStore();
    const existing = s.users.find((u) => u.email === data.email);
    if (existing) {
      const err: any = new Error("Email already exists");
      err.code = "23505";
      throw err;
    }
    const user: User = {
      id: s._uid++,
      ...data,
      created_at: new Date(),
    };
    s.users.push(user);
    return user;
  },

  userFindByEmail(email: string): User | undefined {
    return getStore().users.find((u) => u.email === email);
  },

  userFindById(id: number): User | undefined {
    return getStore().users.find((u) => u.id === id);
  },

  userList(): Omit<User, "password_hash">[] {
    return getStore().users.map(({ password_hash, ...u }) => u);
  },

  projectCreate(name: string, description: string, created_by: number): Project {
    const s = getStore();
    const project: Project = {
      id: s._pid++,
      name,
      description,
      created_at: new Date(),
      created_by,
    };
    s.projects.push(project);
    s.projectMembers.push({ project_id: project.id, user_id: created_by, created_at: new Date() });
    return project;
  },

  projectFindById(id: number): Project | undefined {
    return getStore().projects.find((p) => p.id === id);
  },

  projectDelete(id: number): boolean {
    const s = getStore();
    const idx = s.projects.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    s.projects.splice(idx, 1);
    s.projectMembers = s.projectMembers.filter((m) => m.project_id !== id);
    s.tasks = s.tasks.filter((t) => t.project_id !== id);
    return true;
  },

  projectsForUser(userId: number): Project[] {
    const s = getStore();
    const memberOf = s.projectMembers.filter((m) => m.user_id === userId).map((m) => m.project_id);
    return s.projects.filter((p) => memberOf.includes(p.id));
  },

  memberAdd(project_id: number, user_id: number): boolean {
    const s = getStore();
    const exists = s.projectMembers.find((m) => m.project_id === project_id && m.user_id === user_id);
    if (exists) return false;
    s.projectMembers.push({ project_id, user_id, created_at: new Date() });
    return true;
  },

  memberRemove(project_id: number, user_id: number): boolean {
    const s = getStore();
    const idx = s.projectMembers.findIndex((m) => m.project_id === project_id && m.user_id === user_id);
    if (idx === -1) return false;
    s.projectMembers.splice(idx, 1);
    return true;
  },

  membersOfProject(project_id: number): Omit<User, "password_hash">[] {
    const s = getStore();
    const userIds = s.projectMembers.filter((m) => m.project_id === project_id).map((m) => m.user_id);
    return s.users.filter((u) => userIds.includes(u.id)).map(({ password_hash, ...u }) => u);
  },

  isProjectMember(project_id: number, user_id: number): boolean {
    return !!getStore().projectMembers.find((m) => m.project_id === project_id && m.user_id === user_id);
  },

  taskCreate(data: {
    project_id: number;
    title: string;
    description: string;
    assigned_to: number;
    due_date: string | null;
    due_time: string | null;
    priority: "low" | "medium" | "high";
    recurring: boolean;
    created_by: number;
  }): Task {
    const s = getStore();
    const task: Task = {
      id: s._tid++,
      ...data,
      status: "todo",
      created_at: new Date(),
      updated_at: new Date(),
    };
    s.tasks.push(task);
    return task;
  },

  taskFindById(id: number): Task | undefined {
    return getStore().tasks.find((t) => t.id === id);
  },

  taskUpdate(id: number, updates: Partial<Pick<Task, "status" | "title" | "description" | "assigned_to" | "due_date" | "priority">>): Task | undefined {
    const s = getStore();
    const task = s.tasks.find((t) => t.id === id);
    if (!task) return undefined;
    Object.assign(task, updates, { updated_at: new Date() });
    return task;
  },

  taskDelete(id: number): boolean {
    const s = getStore();
    const idx = s.tasks.findIndex((t) => t.id === id);
    if (idx === -1) return false;
    s.tasks.splice(idx, 1);
    return true;
  },

  tasksForProject(project_id: number): Task[] {
    return getStore().tasks.filter((t) => t.project_id === project_id);
  },

  tasksForUser(user_id: number): Task[] {
    return getStore().tasks.filter((t) => t.assigned_to === user_id);
  },

  allTasksForUserProjects(user_id: number): Task[] {
    const projectIds = this.projectsForUser(user_id).map((p) => p.id);
    return getStore().tasks.filter((t) => projectIds.includes(t.project_id));
  },
};
