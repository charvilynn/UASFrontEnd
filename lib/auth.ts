import "server-only";
import crypto from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "./db";

export const SESSION_COOKIE_NAME = "charv_session";
export const RESET_TOKEN_COOKIE_NAME = "charv_reset_token";

export function hashOtpCode(code: string): string {
  return crypto.createHash("sha256").update(`${code.trim()}:charv_otp_salt`).digest("hex");
}

export async function setResetPasswordTokenCookie(email: string, otpId: number): Promise<void> {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  const jwt = await new SignJWT({
    email: email.toLowerCase(),
    otpId,
    purpose: "password_reset_verified",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(getSecretKey());

  const cookieStore = await cookies();
  cookieStore.set(RESET_TOKEN_COOKIE_NAME, jwt, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function verifyAndConsumeResetPasswordTokenCookie(): Promise<{
  email: string;
  otpId: number;
} | null> {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get(RESET_TOKEN_COOKIE_NAME)?.value;
    if (!raw) return null;

    const { payload } = await jwtVerify(raw, getSecretKey());
    if (
      payload.purpose !== "password_reset_verified" ||
      typeof payload.email !== "string" ||
      typeof payload.otpId !== "number"
    ) {
      return null;
    }

    cookieStore.delete(RESET_TOKEN_COOKIE_NAME);
    return { email: payload.email, otpId: payload.otpId };
  } catch {
    return null;
  }
}

function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "SESSION_SECRET wajib dikonfigurasi pada file .env.local (minimal 16 karakter).",
      );
    }
    const g = globalThis as unknown as { __charvDevSessionSecret?: string };
    if (!g.__charvDevSessionSecret) {
      g.__charvDevSessionSecret = crypto.randomBytes(32).toString("hex");
    }
    return new TextEncoder().encode(g.__charvDevSessionSecret);
  }
  return new TextEncoder().encode(secret);
}

export interface SessionUser {
  id: number;
  name: string;
  email: string;
  role: "member" | "admin";
  memberCode: string;
  faculty: string | null;
  phone: string | null;
  bio: string | null;
  avatarColor: string;
  isVerified: boolean;
  onboardingDone: boolean;
  sessionToken: string;
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function createSession(
  userId: number,
  userAgent = "Browser Client",
  ipAddress = "127.0.0.1",
): Promise<string> {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const rawToken = `${userId}-${crypto.randomBytes(16).toString("hex")}`;

  await prisma.userSession.create({
    data: {
      token: rawToken,
      userId,
      userAgent,
      ipAddress,
      expiresAt,
    },
  });

  const jwt = await new SignJWT({ userId, sessionToken: rawToken })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecretKey());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, jwt, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return rawToken;
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (tokenCookie) {
    try {
      const { payload } = await jwtVerify(tokenCookie, getSecretKey());
      if (typeof payload.sessionToken === "string") {
        await prisma.userSession.deleteMany({
          where: { token: payload.sessionToken },
        });
      }
    } catch {}
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!tokenCookie) return null;

    const { payload } = await jwtVerify(tokenCookie, getSecretKey());
    const sessionToken = payload.sessionToken as string | undefined;
    if (!sessionToken) return null;

    const sessionRecord = await prisma.userSession.findUnique({
      where: { token: sessionToken },
      include: { user: true },
    });

    if (!sessionRecord || sessionRecord.expiresAt < new Date()) {
      return null;
    }

    const u = sessionRecord.user;
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role === "admin" ? "admin" : "member",
      memberCode: u.memberCode,
      faculty: u.faculty,
      phone: u.phone,
      bio: u.bio,
      avatarColor: u.avatarColor,
      isVerified: u.isVerified,
      onboardingDone: u.onboardingDone,
      sessionToken,
    };
  } catch {
    return null;
  }
}

export async function requireAuth(nextPath: string): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }
  return user;
}
