import { NextResponse } from "next/server";

export class InvalidJsonError extends Error {}

export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new InvalidJsonError("Request body must be valid JSON.");
  }
}

export function invalidJsonResponse(error: unknown) {
  if (error instanceof InvalidJsonError) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return null;
}
