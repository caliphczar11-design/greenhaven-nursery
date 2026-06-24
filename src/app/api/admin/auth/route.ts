import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword, createSession, destroySession, getSessionToken, validateSession, hashPassword, destroyAllUserSessions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    const user = await db.adminUser.findUnique({
      where: { username },
    });

    if (!user) {
      // Intentionally slow to prevent timing attacks
      await new Promise((r) => setTimeout(r, 500));
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    const valid = verifyPassword(password, user.passwordHash);

    if (!valid) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    const token = await createSession(user.id);

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, username: user.username, role: user.role },
    });

    // Set HTTP-only cookie
    response.cookies.set("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60, // 24 hours
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = getSessionToken(request);

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const result = await validateSession(token);

    if (!result.valid || !result.user) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user: result.user,
    });
  } catch (error) {
    console.error("Session check error:", error);
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = getSessionToken(request);

    if (token) {
      await destroySession(token);
    }

    const response = NextResponse.json({ success: true });

    // Clear cookie
    response.cookies.set("admin_session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}

// Change password endpoint
export async function PUT(request: NextRequest) {
  try {
    const token = getSessionToken(request);

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const session = await validateSession(token);
    if (!session.valid || !session.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current password and new password are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const user = await db.adminUser.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const valid = await verifyPassword(currentPassword, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 401 }
      );
    }

    const newHash = await hashPassword(newPassword);
    await db.adminUser.update({
      where: { id: session.user.id },
      data: { passwordHash: newHash },
    });

    // Invalidate all other sessions
    await destroyAllUserSessions(session.user.id);

    // Create new session with same token
    await db.adminSession.create({
      data: {
        token,
        userId: session.user.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    return NextResponse.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error("Password change error:", error);
    return NextResponse.json({ error: "Failed to change password" }, { status: 500 });
  }
}