import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { fail, zodFail } from "@/lib/api";
import { db } from "@/lib/db";
import { addMemberSchema } from "@/lib/validators";
import { ZodError } from "zod";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser();
  if (!user) return fail("Not authenticated", 401);
  if (user.role !== "admin") return fail("Only admins can manage members", 403);

  const projectId = parseInt(params.id);
  if (isNaN(projectId)) return fail("Invalid project ID", 400);

  const project = db.projectFindById(projectId);
  if (!project) return fail("Project not found", 404);

  try {
    const body = addMemberSchema.parse(await req.json());
    const targetUser = db.userFindById(body.userId);
    if (!targetUser) return fail("User not found", 404);

    const added = db.memberAdd(projectId, body.userId);
    if (!added) return fail("User is already a member", 409);

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) return zodFail(error);
    return fail("Could not add member", 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser();
  if (!user) return fail("Not authenticated", 401);
  if (user.role !== "admin") return fail("Only admins can manage members", 403);

  const projectId = parseInt(params.id);
  if (isNaN(projectId)) return fail("Invalid project ID", 400);

  try {
    const body = await req.json();
    const userId = parseInt(body.userId);
    if (isNaN(userId)) return fail("Invalid user ID", 400);

    const removed = db.memberRemove(projectId, userId);
    if (!removed) return fail("User is not a member", 404);

    return NextResponse.json({ ok: true });
  } catch {
    return fail("Could not remove member", 500);
  }
}
