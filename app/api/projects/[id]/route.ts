import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { fail } from "@/lib/api";
import { db } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser();
  if (!user) return fail("Not authenticated", 401);

  const id = parseInt(params.id);
  if (isNaN(id)) return fail("Invalid project ID", 400);

  const project = db.projectFindById(id);
  if (!project) return fail("Project not found", 404);

  if (!db.isProjectMember(id, user.id)) {
    return fail("You are not a member of this project", 403);
  }

  const members = db.membersOfProject(id);
  const tasks = db.tasksForProject(id);

  return NextResponse.json({ project, members, tasks });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser();
  if (!user) return fail("Not authenticated", 401);
  if (user.role !== "admin") return fail("Only admins can delete projects", 403);

  const id = parseInt(params.id);
  if (isNaN(id)) return fail("Invalid project ID", 400);

  const deleted = db.projectDelete(id);
  if (!deleted) return fail("Project not found", 404);

  return NextResponse.json({ ok: true });
}
