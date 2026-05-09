import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function ok(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function fail(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function zodFail(error: ZodError) {
  return NextResponse.json(
    { error: "Validation error", details: error.flatten() },
    { status: 422 }
  );
}
