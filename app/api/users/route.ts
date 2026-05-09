import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { fail } from "@/lib/api";
import { db } from "@/lib/db";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return fail("Not authenticated", 401);
  return NextResponse.json({ users: db.userList() });
}
