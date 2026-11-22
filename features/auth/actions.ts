"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  createSession,
  hashOtpCode,
  hashPassword,
  requireAuth,
  setResetPasswordTokenCookie,
  verifyAndConsumeResetPasswordTokenCookie,
  verifyPassword,
} from "@/lib/auth";

export async function loginUserAction(formData: FormData): Promise<void> {
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") || "");
  const nextRaw = String(formData.get("next") || "").trim();
  const nextPath = nextRaw.startsWith("/") ? nextRaw : "/";

  if (!email || !password) {
    const errParams = new URLSearchParams({
      error: "Email dan kata sandi wajib diisi.",
    });
    if (nextRaw.startsWith("/")) errParams.set("next", nextRaw);
    redirect(`/login?${errParams.toString()}`);
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    await prisma.loginHistory.create({
      data: {
        userId: null,
        email,
        status: "failed",
        ipAddress: "127.0.0.1",
        userAgent: "Charvlibrary Web Auth (Next.js 16)",
        reason: "Gagal masuk: alamat email belum terdaftar di pangkalan data",
      },
    });
    const errParams = new URLSearchParams({
      error: "Akun dengan alamat email tersebut tidak ditemukan.",
    });
    if (nextRaw.startsWith("/")) errParams.set("next", nextRaw);
    redirect(`/login?${errParams.toString()}`);
  }

  const isPasswordValid = await verifyPassword(password, user.passwordHash);
  if (!isPasswordValid) {
    await prisma.loginHistory.create({
      data: {
        userId: user.id,
        email: user.email,
        status: "failed",
        ipAddress: "127.0.0.1",
        userAgent: "Charvlibrary Web Auth (Next.js 16)",
        reason: "Gagal masuk: kata sandi tidak cocok dengan kredensial akun",
      },
    });
    const errParams = new URLSearchParams({
      error: "Kata sandi yang Anda masukkan salah. Silakan coba kembali.",
    });
    if (nextRaw.startsWith("/")) errParams.set("next", nextRaw);
    redirect(`/login?${errParams.toString()}`);
  }

  await createSession(user.id, "Charvlibrary Web Browser (Sesi Kredensial)", "127.0.0.1");

  await prisma.loginHistory.create({
    data: {
      userId: user.id,
      email: user.email,
      status: "success",
      ipAddress: "127.0.0.1",
      userAgent: "Charvlibrary Web Browser (Sesi Kredensial)",
      reason: "Autentikasi email dan kata sandi berhasil",
    },
  });

  revalidatePath("/", "layout");
  redirect(nextPath);
}

export async function registerUserAction(formData: FormData): Promise<void> {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const faculty = String(formData.get("faculty") || "").trim() || "Fakultas Ilmu Komputer";
  const phone = String(formData.get("phone") || "").trim() || null;
  const bio =
    String(formData.get("bio") || "").trim() || "Anggota aktif perpustakaan akademik Charvlibrary.";
  const password = String(formData.get("password") || "");
  const avatarColor = String(formData.get("avatarColor") || "").trim() || "#92400E";

  if (!name || !email || !password) {
    redirect(
      "/register?error=" +
        encodeURIComponent("Nama lengkap, email kampus, dan kata sandi wajib diisi."),
    );
  }

  if (password.length < 8) {
    redirect(
      "/register?error=" + encodeURIComponent("Kata sandi minimal harus terdiri dari 8 karakter."),
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    redirect(
      "/register?error=" +
        encodeURIComponent("Alamat email sudah terdaftar. Silakan masuk menggunakan akun Anda."),
    );
  }

  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  let memberCode = `CHV-2026-${randomDigits}`;
  const codeExists = await prisma.user.findUnique({
    where: { memberCode },
  });
  if (codeExists) {
    memberCode = `CHV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  }

  const passwordHash = await hashPassword(password);

  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: "member",
      memberCode,
      faculty,
      phone,
      bio,
      avatarColor,
      isVerified: true,
      onboardingDone: false,
    },
  });

  await prisma.readingGoal.upsert({
    where: {
      userId_year: {
        userId: newUser.id,
        year: 2026,
      },
    },
    update: {},
    create: {
      userId: newUser.id,
      year: 2026,
      targetBooks: 12,
      targetPages: 3600,
      currentBooks: 0,
      currentPages: 0,
    },
  });

  await prisma.loginHistory.create({
    data: {
      userId: newUser.id,
      email: newUser.email,
      status: "success",
      ipAddress: "127.0.0.1",
      userAgent: "Charvlibrary Member Registration",
      reason: `Registrasi anggota baru berhasil (${memberCode})`,
    },
  });

  await createSession(newUser.id, "Charvlibrary Member Registration", "127.0.0.1");

  revalidatePath("/", "layout");
  redirect("/onboarding");
}

export interface RequestResetOtpResult {
  ok: boolean;
  message?: string;
  error?: string;
  simulationCode?: string;
  expiresInMinutes?: number;
}

export async function requestPasswordResetOtpAction(
  rawEmail: string,
): Promise<RequestResetOtpResult> {
  const email = String(rawEmail || "")
    .trim()
    .toLowerCase();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return {
      ok: false,
      error: "Masukkan alamat email yang valid.",
    };
  }

  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
  const recentRequests = await prisma.otpCode.count({
    where: {
      email,
      purpose: "password_reset",
      createdAt: { gte: fifteenMinutesAgo },
    },
  });

  if (recentRequests >= 3) {
    return {
      ok: false,
      error:
        "Batas permintaan kode tercapai (maksimal 3 kali per 15 menit). Silakan tunggu sebentar sebelum meminta kode baru.",
    };
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  const rawCode = crypto.randomInt(100000, 1000000).toString();
  const codeHash = hashOtpCode(rawCode);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.otpCode.create({
    data: {
      userId: user ? user.id : null,
      email,
      codeHash,
      purpose: "password_reset",
      attempts: 0,
      expiresAt,
      ipAddress: "127.0.0.1",
    },
  });

  const isSimulation = process.env.OTP_SIMULATION !== "false";

  return {
    ok: true,
    message: "Jika email terdaftar, kode sudah dikirim.",
    simulationCode: isSimulation ? rawCode : undefined,
    expiresInMinutes: 10,
  };
}

export interface VerifyResetOtpResult {
  ok: boolean;
  error?: string;
}

export async function verifyPasswordResetOtpAction(
  rawEmail: string,
  rawCode: string,
): Promise<VerifyResetOtpResult> {
  const email = String(rawEmail || "")
    .trim()
    .toLowerCase();
  const code = String(rawCode || "")
    .replace(/\D+/g, "")
    .trim();

  if (!email || code.length !== 6) {
    return {
      ok: false,
      error: "Masukkan 6 digit angka kode verifikasi secara lengkap.",
    };
  }

  const latestOtp = await prisma.otpCode.findFirst({
    where: {
      email,
      purpose: "password_reset",
      consumedAt: null,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!latestOtp || latestOtp.expiresAt < new Date()) {
    return {
      ok: false,
      error:
        "Kode OTP tidak ditemukan atau sudah kedaluwarsa (berlaku 10 menit). Silakan minta kode baru.",
    };
  }

  if (latestOtp.attempts >= 5) {
    return {
      ok: false,
      error:
        "Kode OTP ini telah hangus karena salah dimasukkan 5 kali. Silakan kirim ulang kode baru.",
    };
  }

  const candidateHash = hashOtpCode(code);
  if (candidateHash !== latestOtp.codeHash) {
    const nextAttempts = latestOtp.attempts + 1;
    await prisma.otpCode.update({
      where: { id: latestOtp.id },
      data: {
        attempts: nextAttempts,
        ...(nextAttempts >= 5 ? { expiresAt: new Date(0) } : {}),
      },
    });

    const remaining = Math.max(0, 5 - nextAttempts);
    return {
      ok: false,
      error:
        remaining > 0
          ? `Kode OTP tidak sesuai. Sisa kesempatan percobaan: ${remaining} kali.`
          : "Kode OTP telah hangus setelah 5 kali percobaan gagal. Silakan minta kode baru.",
    };
  }

  await prisma.otpCode.update({
    where: { id: latestOtp.id },
    data: {
      consumedAt: new Date(),
    },
  });

  await setResetPasswordTokenCookie(email, latestOtp.id);

  return { ok: true };
}

export interface CompletePasswordResetResult {
  ok: boolean;
  error?: string;
  redirectTo?: string;
}

export async function completePasswordResetAction(
  newPassword: string,
  confirmPassword: string,
): Promise<CompletePasswordResetResult> {
  if (!newPassword || newPassword.length < 8) {
    return {
      ok: false,
      error: "Password baru minimal harus terdiri dari 8 karakter.",
    };
  }

  if (newPassword !== confirmPassword) {
    return {
      ok: false,
      error: "Konfirmasi password baru tidak cocok.",
    };
  }

  const tokenData = await verifyAndConsumeResetPasswordTokenCookie();
  if (!tokenData) {
    return {
      ok: false,
      error:
        "Sesi verifikasi OTP tidak ditemukan atau telah kedaluwarsa. Silakan ulangi proses dari langkah pertama.",
    };
  }

  const otpRecord = await prisma.otpCode.findUnique({
    where: { id: tokenData.otpId },
  });

  if (!otpRecord || otpRecord.email !== tokenData.email || !otpRecord.consumedAt) {
    return {
      ok: false,
      error: "Token verifikasi OTP tidak sah. Silakan minta kode baru.",
    };
  }

  const user = await prisma.user.findUnique({
    where: { email: tokenData.email },
  });

  if (user) {
    const newHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    });

    await prisma.userSession.deleteMany({
      where: { userId: user.id },
    });

    await prisma.loginHistory.create({
      data: {
        userId: user.id,
        email: user.email,
        status: "success",
        ipAddress: "127.0.0.1",
        userAgent: "Charvlibrary Reset Password (OTP Verified)",
        reason: "Password berhasil diperbarui melalui alur Reset Password 3 langkah",
      },
    });
  }

  await prisma.otpCode.deleteMany({
    where: { email: tokenData.email },
  });

  revalidatePath("/", "layout");
  return {
    ok: true,
    redirectTo: "/login?reset=1",
  };
}

export async function saveOnboardingAction(formData: FormData): Promise<void> {
  const user = await requireAuth("/onboarding");

  const rawCategoryIds = formData.getAll("categoryIds");
  const categoryIds = rawCategoryIds
    .map((val) => Number(val))
    .filter((id) => Number.isInteger(id) && id > 0);

  const targetBooksRaw = Number(formData.get("targetBooks") || 12);
  const targetBooks =
    Number.isFinite(targetBooksRaw) && targetBooksRaw > 0
      ? Math.min(Math.max(Math.round(targetBooksRaw), 1), 200)
      : 12;

  const targetPagesRaw = Number(formData.get("targetPages") || targetBooks * 300);
  const targetPages =
    Number.isFinite(targetPagesRaw) && targetPagesRaw >= 100
      ? Math.round(targetPagesRaw)
      : targetBooks * 300;

  await prisma.userPreference.deleteMany({
    where: { userId: user.id },
  });

  if (categoryIds.length > 0) {
    const uniqueCategoryIds = Array.from(new Set(categoryIds));
    await prisma.userPreference.createMany({
      data: uniqueCategoryIds.map((categoryId) => ({
        userId: user.id,
        categoryId,
      })),
    });
  }

  await prisma.readingGoal.upsert({
    where: {
      userId_year: {
        userId: user.id,
        year: 2026,
      },
    },
    update: {
      targetBooks,
      targetPages,
    },
    create: {
      userId: user.id,
      year: 2026,
      targetBooks,
      targetPages,
      currentBooks: 0,
      currentPages: 0,
    },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { onboardingDone: true },
  });

  revalidatePath("/", "layout");
  revalidatePath("/onboarding");
  revalidatePath("/recommendations");
  redirect("/");
}

export async function changePasswordAction(formData: FormData): Promise<void> {
  const sessionUser = await requireAuth("/account/security");

  const currentPassword = String(formData.get("currentPassword") || "");
  const newPassword = String(formData.get("newPassword") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");

  if (!currentPassword || !newPassword) {
    redirect(
      "/account/security?error=" +
        encodeURIComponent("Kata sandi saat ini dan kata sandi baru wajib diisi."),
    );
  }

  if (newPassword.length < 8) {
    redirect(
      "/account/security?error=" +
        encodeURIComponent("Kata sandi baru minimal terdiri dari 8 karakter."),
    );
  }

  if (confirmPassword && newPassword !== confirmPassword) {
    redirect(
      "/account/security?error=" + encodeURIComponent("Konfirmasi kata sandi baru tidak cocok."),
    );
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: sessionUser.id },
  });

  if (!dbUser) {
    redirect("/login");
  }

  const isCurrentValid = await verifyPassword(currentPassword, dbUser.passwordHash);

  if (!isCurrentValid) {
    await prisma.loginHistory.create({
      data: {
        userId: dbUser.id,
        email: dbUser.email,
        status: "failed",
        ipAddress: "127.0.0.1",
        userAgent: "Pengaturan Keamanan Akun",
        reason: "Gagal mengubah kata sandi: kata sandi lama tidak sesuai",
      },
    });
    redirect(
      "/account/security?error=" +
        encodeURIComponent("Kata sandi saat ini yang Anda masukkan tidak sesuai."),
    );
  }

  const newHash = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: dbUser.id },
    data: { passwordHash: newHash },
  });

  await prisma.userSession.deleteMany({
    where: {
      userId: dbUser.id,
      token: { not: sessionUser.sessionToken },
    },
  });

  await prisma.loginHistory.create({
    data: {
      userId: dbUser.id,
      email: dbUser.email,
      status: "success",
      ipAddress: "127.0.0.1",
      userAgent: "Pengaturan Keamanan Akun",
      reason: "Kata sandi akun berhasil diperbarui oleh pengguna",
    },
  });

  revalidatePath("/account/security");
  revalidatePath("/account/sessions");
  revalidatePath("/account/login-history");
  redirect("/account/security?updated=password");
}

export async function revokeSessionAction(formData: FormData): Promise<void> {
  const sessionUser = await requireAuth("/account/sessions");
  const sessionId = Number(formData.get("sessionId") || 0);
  const returnTo = String(formData.get("returnTo") || "/account/sessions");

  if (sessionId > 0) {
    await prisma.userSession.deleteMany({
      where: {
        id: sessionId,
        userId: sessionUser.id,
      },
    });
  }

  revalidatePath("/account/security");
  revalidatePath("/account/sessions");
  redirect(`${returnTo.startsWith("/account/") ? returnTo : "/account/sessions"}?updated=session`);
}

export async function revokeOtherSessionsAction(): Promise<void> {
  const sessionUser = await requireAuth("/account/sessions");

  await prisma.userSession.deleteMany({
    where: {
      userId: sessionUser.id,
      token: { not: sessionUser.sessionToken },
    },
  });

  revalidatePath("/account/security");
  revalidatePath("/account/sessions");
  redirect("/account/sessions?updated=all_other");
}

export async function saveUserPreferencesAction(formData: FormData): Promise<void> {
  const sessionUser = await requireAuth("/account/preferences");

  const rawCategoryIds = formData.getAll("categoryIds");
  const categoryIds = rawCategoryIds
    .map((val) => Number(val))
    .filter((id) => Number.isInteger(id) && id > 0);

  const avatarColor = String(formData.get("avatarColor") || "").trim() || sessionUser.avatarColor;

  await prisma.userPreference.deleteMany({
    where: { userId: sessionUser.id },
  });

  if (categoryIds.length > 0) {
    const uniqueIds = Array.from(new Set(categoryIds));
    await prisma.userPreference.createMany({
      data: uniqueIds.map((categoryId) => ({
        userId: sessionUser.id,
        categoryId,
      })),
    });
  }

  await prisma.user.update({
    where: { id: sessionUser.id },
    data: { avatarColor },
  });

  revalidatePath("/", "layout");
  revalidatePath("/account/preferences");
  revalidatePath("/recommendations");
  redirect("/account/preferences?saved=1");
}
