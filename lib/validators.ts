import { z } from "zod";

export const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  email: z.string().email().max(200),
  phone: z.string().min(4, "Please enter a valid phone number").max(20),
  password: z.string().min(6, "Password must be at least 6 characters").max(100),
  role: z.enum(["admin", "member"]).default("member"),
  attendance: z.boolean().default(false),
  timesheet: z.boolean().default(false),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const createProjectSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().max(500).default(""),
  memberIds: z.array(z.number().int().positive()).default([]),
});

export const addMemberSchema = z.object({
  userId: z.number().int().positive(),
});

export const createTaskSchema = z.object({
  projectId: z.number().int().positive(),
  title: z.string().min(2).max(200),
  description: z.string().max(1000).default(""),
  assignedTo: z.number().int().positive(),
  dueDate: z.string().nullable().optional(),
  dueTime: z.string().nullable().optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  recurring: z.boolean().default(false),
});

export const updateTaskStatusSchema = z.object({
  status: z.enum(["todo", "doing", "done"]),
});
