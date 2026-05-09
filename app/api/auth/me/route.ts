import { NextResponse } from "next/server";
import { getAuthUser, clearSessionCookie } from "@/lib/auth";
import { fail } from "@/lib/api";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return fail("Not authenticated", 401);
  return NextResponse.json({ user });
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  clearSessionCookie(response);
  return response;
}
