import Link from "next/link";
import {
  Shield,
  Lock,
  History,
  Laptop,
  Trash2,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  User,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { changePasswordAction, revokeSessionAction } from "@/features/auth/actions";

interface AccountSecurityPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AccountSecurityPage({ searchParams }: AccountSecurityPageProps) {
  const user = await requireAuth("/account/security");
  const params = await searchParams;

  const updatedParam = typeof params.updated === "string" ? params.updated : null;
  const errorMsg = typeof params.error === "string" ? params.error : null;

  const [activeSessions, recentLoginCount] = await Promise.all([
    prisma.userSession.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.loginHistory.count({
      where: { userId: user.id },
    }),
  ]);

  return (
    <div className="min-h-screen pb-16">
      <PageHeader
        title="Keamanan Akun & Manajemen Sesi Perangkat"
        subtitle={`Kelola kata sandi terenkripsi dan awasi perangkat yang sedang aktif untuk akun ${user.name} (${user.memberCode}).`}
        fallbackHref="/account/profile"
        breadcrumbLabel="Keamanan & Sesi"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/account/login-history"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#92400E] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[#78350F]"
            >
              <History className="h-3.5 w-3.5" />
              Audit Riwayat Login ({recentLoginCount})
            </Link>
            <Link
              href="/account/profile"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3.5 py-2 text-xs font-semibold text-[var(--fg)] transition hover:border-[#92400E]"
            >
              <User className="h-3.5 w-3.5" />
              Profil Anggota
            </Link>
          </div>
        }
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {updatedParam === "password" && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-600/30 bg-emerald-500/10 px-4 py-3.5 text-sm text-emerald-900 dark:text-emerald-200">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
            <span>Kata sandi akun Anda berhasil diperbarui dan dicatat pada log keamanan.</span>
          </div>
        )}

        {updatedParam === "session" && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-600/30 bg-emerald-500/10 px-4 py-3.5 text-sm text-emerald-900 dark:text-emerald-200">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
            <span>Sesi perangkat berhasil dicabut.</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-600/30 bg-red-500/10 px-4 py-3.5 text-sm text-red-900 dark:text-red-200">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between border-b border-[var(--border)] pb-4">
                <div>
                  <h2 className="font-heading text-lg font-bold text-[var(--fg)]">
                    Perbarui Kata Sandi Akun
                  </h2>
                  <p className="mt-0.5 text-xs text-[var(--fg-muted)]">
                    Verifikasi kata sandi lama sebelum menyimpan kata sandi baru.
                  </p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#92400E]/10 text-[#92400E] dark:text-amber-400">
                  <Lock className="h-4 w-4" />
                </div>
              </div>

              <form action={changePasswordAction} className="space-y-4">
                <div>
                  <label
                    htmlFor="currentPassword"
                    className="mb-1.5 block text-xs font-semibold text-[var(--fg)]"
                  >
                    Kata Sandi Saat Ini
                  </label>
                  <input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    required
                    placeholder="Masukkan kata sandi saat ini"
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3.5 py-2.5 text-sm text-[var(--fg)] focus:border-[#92400E] focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="newPassword"
                    className="mb-1.5 block text-xs font-semibold text-[var(--fg)]"
                  >
                    Kata Sandi Baru (Minimal 8 Karakter)
                  </label>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    required
                    minLength={8}
                    placeholder="Masukkan kata sandi baru"
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3.5 py-2.5 text-sm text-[var(--fg)] focus:border-[#92400E] focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-1.5 block text-xs font-semibold text-[var(--fg)]"
                  >
                    Konfirmasi Kata Sandi Baru
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    minLength={8}
                    placeholder="Ketik ulang kata sandi baru"
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3.5 py-2.5 text-sm text-[var(--fg)] focus:border-[#92400E] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#92400E] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#78350F]"
                >
                  <Shield className="h-4 w-4" />
                  Simpan Perubahan Kata Sandi
                </button>
              </form>

              <div className="mt-5 border-t border-[var(--border)] pt-4 text-xs text-[var(--fg-muted)]">
                Lupa kata sandi saat ini? Gunakan jalur{" "}
                <Link
                  href="/forgot-password"
                  className="inline-flex items-center gap-1 font-semibold text-[#92400E] hover:underline dark:text-amber-400"
                >
                  <KeyRound className="h-3 w-3" />
                  Pemulihan Kode OTP 6 Digit
                </Link>
                .
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-4">
                <div>
                  <h2 className="font-heading text-lg font-bold text-[var(--fg)]">
                    Daftar Perangkat & Sesi Aktif ({activeSessions.length} Sesi)
                  </h2>
                  <p className="mt-0.5 text-xs text-[var(--fg-muted)]">
                    Kelola perangkat yang memiliki sesi aktif. Anda dapat mencabut sesi perangkat
                    kapan saja.
                  </p>
                </div>
                <Link
                  href="/account/login-history"
                  className="text-xs font-semibold text-[#92400E] hover:underline dark:text-amber-400"
                >
                  Lihat Riwayat Lengkap &rarr;
                </Link>
              </div>

              <div className="space-y-3.5">
                {activeSessions.map((sess) => {
                  const isCurrentSession = sess.token === user.sessionToken;
                  return (
                    <div
                      key={sess.id}
                      className={`flex flex-col justify-between gap-4 rounded-xl border p-4 sm:flex-row sm:items-center ${
                        isCurrentSession
                          ? "border-[#92400E]/50 bg-[#92400E]/5"
                          : "border-[var(--border)] bg-[var(--bg)]"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#92400E]/15 text-[#92400E] dark:text-amber-300">
                          <Laptop className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-bold text-[var(--fg)]">
                              {sess.userAgent || "Browser Akademik Charvlibrary"}
                            </p>
                            {isCurrentSession && (
                              <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                                Perangkat Saat Ini
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-[var(--fg-muted)]">
                            Alamat IP: {sess.ipAddress || "127.0.0.1"} | Token ID:{" "}
                            <code className="font-mono">
                              #{sess.id} ({sess.token.slice(0, 14)}...)
                            </code>
                          </p>
                          <p className="mt-0.5 text-[11px] text-[var(--fg-muted)]">
                            Masuk pada:{" "}
                            {new Date(sess.createdAt).toLocaleString("id-ID", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}{" "}
                            | Berlaku hingga:{" "}
                            {new Date(sess.expiresAt).toLocaleDateString("id-ID", {
                              dateStyle: "medium",
                            })}
                          </p>
                        </div>
                      </div>

                      <form action={revokeSessionAction} className="shrink-0">
                        <input type="hidden" name="sessionId" value={sess.id} />
                        <button
                          type="submit"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-600/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-500/20 dark:text-red-300"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          {isCurrentSession ? "Akhiri Sesi Ini" : "Cabut Sesi"}
                        </button>
                      </form>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
