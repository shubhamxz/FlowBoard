import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { fail, zodFail } from "@/lib/api";
import { db } from "@/lib/db";
import { createProjectSchema } from "@/lib/validators";
import { ZodError } from "zod";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return fail("Not authenticated", 401);

  const projects = db.projectsForUser(user.id);
  return NextResponse.json({ projects });
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return fail("Not authenticated", 401);
  if (user.role !== "admin") return fail("Only admins can create projects", 403);

  try {
    const body = createProjectSchema.parse(await req.json());
    const project = db.projectCreate(body.name, body.description ?? "", user.id);

    if (body.memberIds && body.memberIds.length > 0) {
      for (const uid of body.memberIds) {
        if (db.userFindById(uid)) {
          db.memberAdd(project.id, uid);
        }
      }
    }

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) return zodFail(error);
    return fail("Could not create project", 500);
  }
}
