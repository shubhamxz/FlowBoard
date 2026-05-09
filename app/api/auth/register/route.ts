import { NextRequest, NextResponse } from "next/server";
import { fail, zodFail } from "@/lib/api";
import { hashPassword } from "@/lib/auth";
import { db } from "@/lib/db";
import { registerSchema } from "@/lib/validators";
import { ZodError } from "zod";

export async function POST(req: NextRequest) {
  try {
    const body = registerSchema.parse(await req.json());
    const passwordHash = await hashPassword(body.password);

    const user = db.userCreate({
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email.toLowerCase(),
      phone: body.phone,
      password_hash: passwordHash,
      role: body.role ?? "member",
      attendance: body.attendance ?? false,
      timesheet: body.timesheet ?? false,
    });

    return NextResponse.json(
      { user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role } },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ZodError) return zodFail(error);
    if ((error as any).code === "23505") return fail("Email already exists", 409);
    return fail("Could not register user", 500);
  }
}
