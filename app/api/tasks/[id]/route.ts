import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { fail, zodFail } from "@/lib/api";
import { db } from "@/lib/db";
import { updateTaskStatusSchema } from "@/lib/validators";
import { ZodError } from "zod";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser();
  if (!user) return fail("Not authenticated", 401);

  const id = parseInt(params.id);
  if (isNaN(id)) return fail("Invalid task ID", 400);

  const task = db.taskFindById(id);
  if (!task) return fail("Task not found", 404);

  if (!db.isProjectMember(task.project_id, user.id)) {
    return fail("You are not a member of this project", 403);
  }

  try {
    const body = updateTaskStatusSchema.parse(await req.json());
    const updated = db.taskUpdate(id, { status: body.status });
    return NextResponse.json({ task: updated });
  } catch (error) {
    if (error instanceof ZodError) return zodFail(error);
    return fail("Could not update task", 500);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser();
  if (!user) return fail("Not authenticated", 401);

  const id = parseInt(params.id);
  if (isNaN(id)) return fail("Invalid task ID", 400);

  const task = db.taskFindById(id);
  if (!task) return fail("Task not found", 404);

  if (user.role !== "admin" && task.created_by !== user.id) {
    return fail("Only admins or the task creator can delete tasks", 403);
  }

  db.taskDelete(id);
  return NextResponse.json({ ok: true });
}
