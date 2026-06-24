import { pbkdf2Sync, randomBytes, timingSafeEqual } from "crypto";
import { db } from "@/lib/db";

const PBKDF2_ITERATIONS = 100000;
const PBKDF2_KEYLEN = 64;
const PBKDF2_DIGEST = "sha512";

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const derivedKey = pbkdf2Sync(
    password,
    salt,
    PBKDF2_ITERATIONS,
    PBKDF2_KEYLEN,
    PBKDF2_DIGEST
  );
  return `${PBKDF2_ITERATIONS}:${salt.toString("hex")}:${derivedKey.toString("hex")}`;
}

export function verifyPassword(
  password: string,
  storedHash: string
): boolean {
  try {
    const parts = storedHash.split(":");
    if (parts.length !== 3) return false;

    const iterations = parseInt(parts[0], 10);
    const salt = Buffer.from(parts[1], "hex");
    const storedKey = Buffer.from(parts[2], "hex");

    const derivedKey = pbkdf2Sync(
      password,
      salt,
      iterations,
      PBKDF2_KEYLEN,
      PBKDF2_DIGEST
    );

    if (derivedKey.length !== storedKey.length) return false;

    return timingSafeEqual(derivedKey, storedKey);
  } catch {
    return false;
  }
}

export async function createSession(userId: string): Promise<string> {
  // Clean up expired sessions for this user
  await db.adminSession.deleteMany({
    where: {
      userId,
      expiresAt: { lt: new Date() },
    },
  });

  const token = randomBytes(48).toString("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await db.adminSession.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });

  return token;
}

export async function validateSession(
  token: string
): Promise<{ valid: boolean; user?: { id: string; username: string; role: string } }> {
  const session = await db.adminSession.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session) {
    return { valid: false };
  }

  if (session.expiresAt < new Date()) {
    await db.adminSession.delete({ where: { id: session.id } });
    return { valid: false };
  }

  // Refresh session expiry (rolling 24h window)
  await db.adminSession.update({
    where: { id: session.id },
    data: { expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) },
  });

  return {
    valid: true,
    user: {
      id: session.user.id,
      username: session.user.username,
      role: session.user.role,
    },
  };
}

export async function destroySession(token: string): Promise<void> {
  await db.adminSession.deleteMany({ where: { token } });
}

export async function destroyAllUserSessions(userId: string): Promise<void> {
  await db.adminSession.deleteMany({ where: { userId } });
}

export function getSessionToken(request: Request): string | null {
  // Check Authorization header first
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  // Check cookie
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(/(?:^|;\s*)admin_session=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}