import { NextRequest, NextResponse } from "next/server";
import { getSessionToken, validateSession } from "@/lib/auth";

export async function requireAdminAuth(
  request: NextRequest
): Promise<{ authorized: true; user: { id: string; username: string; role: string } } | NextResponse> {
  const token = getSessionToken(request);

  if (!token) {
    return NextResponse.json(
      { error: "Authentication required. Please log in." },
      { status: 401 }
    );
  }

  const result = await validateSession(token);

  if (!result.valid || !result.user) {
    return NextResponse.json(
      { error: "Session expired. Please log in again." },
      { status: 401 }
    );
  }

  return { authorized: true, user: result.user };
}