import { NextRequest, NextResponse } from "next/server";
import { fail, zodFail } from "@/lib/api";
import { signToken, setSessionCookie, verifyPassword } from "@/lib/auth";
import { db } from "@/lib/db";
import { loginSchema } from "@/lib/validators";
import { ZodError } from "zod";

export async function POST(req: NextRequest) {
  try {
    const body = loginSchema.parse(await req.json());

    const user = db.userFindByEmail(body.email.toLowerCase());
    if (!user) return fail("Invalid credentials", 401);

    const matched = await verifyPassword(body.password, user.password_hash);
    if (!matched) return fail("Invalid credentials", 401);

    const token = await signToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({
      user: { id: user.id, email: user.email, role: user.role },
    });
    setSessionCookie(response, token);
    return response;
  } catch (error) {
    if (error instanceof ZodError) return zodFail(error);
    return fail("Could not login", 500);
  }
}
