import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { fail, zodFail } from "@/lib/api";
import { db } from "@/lib/db";
import { createTaskSchema } from "@/lib/validators";
import { ZodError } from "zod";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return fail("Not authenticated", 401);
  const tasks = db.allTasksForUserProjects(user.id);
  return NextResponse.json({ tasks });
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return fail("Not authenticated", 401);

  try {
    const body = createTaskSchema.parse(await req.json());

    const project = db.projectFindById(body.projectId);
    if (!project) return fail("Project not found", 404);

    if (!db.isProjectMember(body.projectId, user.id)) {
      return fail("You are not a member of this project", 403);
    }

    if (!db.isProjectMember(body.projectId, body.assignedTo)) {
      return fail("Assigned user is not a project member", 400);
    }

    const task = db.taskCreate({
      project_id: body.projectId,
      title: body.title,
      description: body.description ?? "",
      assigned_to: body.assignedTo,
      due_date: body.dueDate ?? null,
      due_time: body.dueTime ?? null,
      priority: body.priority ?? "medium",
      recurring: body.recurring ?? false,
      created_by: user.id,
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) return zodFail(error);
    return fail("Could not create task", 500);
  }
}
