import Link from "next/link";
import { History, Shield, CheckCircle2, XCircle, Monitor, Globe, Filter } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";

interface LoginHistoryPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function LoginHistoryPage({ searchParams }: LoginHistoryPageProps) {
  const user = await requireAuth("/account/login-history");
  const params = await searchParams;

  const statusFilter =
    params.status === "success" || params.status === "failed" ? params.status : "all";
  const scopeFilter = params.scope === "mine" ? "mine" : "all";

  const whereClause = {
    ...(scopeFilter === "mine"
      ? {
          OR: [{ userId: user.id }, { email: user.email }],
        }
      : {}),
    ...(statusFilter !== "all" ? { status: statusFilter } : {}),
  };

  const [historyRows, totalSuccess, totalFailed, myTotalCount] = await Promise.all([
    prisma.loginHistory.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: 40,
    }),
    prisma.loginHistory.count({ where: { status: "success" } }),
    prisma.loginHistory.count({ where: { status: "failed" } }),
    prisma.loginHistory.count({
      where: { OR: [{ userId: user.id }, { email: user.email }] },
    }),
  ]);

  return (
    <div className="min-h-screen pb-16">
      <PageHeader
        title="Riwayat Login & Log Audit Keamanan"
        subtitle="Rekam jejak autentikasi lengkap untuk memantau waktu akses, alamat IP, perangkat, dan status verifikasi."
        fallbackHref="/account/security"
        breadcrumbLabel="Riwayat Login"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/account/security"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#92400E] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[#78350F]"
            >
              <Shield className="h-3.5 w-3.5" />
              Kelola Keamanan & Sesi
            </Link>
          </div>
        }
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
              Autentikasi Berhasil
            </span>
            <p className="mt-2 font-heading text-2xl font-bold text-emerald-700 dark:text-emerald-400">
              {totalSuccess} Aktivitas
            </p>
            <p className="mt-1 text-xs text-[var(--fg-muted)]">
              Login kredensial, registrasi, dan pemulihan sandi
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
              Percobaan Gagal Ditolak
            </span>
            <p className="mt-2 font-heading text-2xl font-bold text-red-700 dark:text-red-400">
              {totalFailed} Percobaan
            </p>
            <p className="mt-1 text-xs text-[var(--fg-muted)]">
              Sandi tidak cocok atau email tidak terdaftar
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
              Log Akun Anda ({user.memberCode})
            </span>
            <p className="mt-2 font-heading text-2xl font-bold text-[#92400E] dark:text-amber-300">
              {myTotalCount} Catatan
            </p>
            <p className="mt-1 text-xs text-[var(--fg-muted)]">Email: {user.email}</p>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--fg-muted)]">
              <Filter className="h-3.5 w-3.5 text-[#92400E]" />
              Filter Status:
            </span>
            <Link
              href={`/account/login-history?scope=${scopeFilter}&status=all`}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                statusFilter === "all"
                  ? "bg-[#92400E] text-white"
                  : "border border-[var(--border)] bg-[var(--bg)] text-[var(--fg)] hover:border-[#92400E]"
              }`}
            >
              Semua Status
            </Link>
            <Link
              href={`/account/login-history?scope=${scopeFilter}&status=success`}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                statusFilter === "success"
                  ? "bg-emerald-700 text-white"
                  : "border border-[var(--border)] bg-[var(--bg)] text-[var(--fg)] hover:border-emerald-700"
              }`}
            >
              Berhasil ({totalSuccess})
            </Link>
            <Link
              href={`/account/login-history?scope=${scopeFilter}&status=failed`}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                statusFilter === "failed"
                  ? "bg-red-700 text-white"
                  : "border border-[var(--border)] bg-[var(--bg)] text-[var(--fg)] hover:border-red-700"
              }`}
            >
              Gagal ({totalFailed})
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/account/login-history?scope=all&status=${statusFilter}`}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                scopeFilter === "all"
                  ? "bg-[#D97706] text-white"
                  : "border border-[var(--border)] bg-[var(--bg)] text-[var(--fg)] hover:border-[#D97706]"
              }`}
            >
              Seluruh Log Sistem
            </Link>
            <Link
              href={`/account/login-history?scope=mine&status=${statusFilter}`}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                scopeFilter === "mine"
                  ? "bg-[#D97706] text-white"
                  : "border border-[var(--border)] bg-[var(--bg)] text-[var(--fg)] hover:border-[#D97706]"
              }`}
            >
              Hanya Akun Saya ({myTotalCount})
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-[#92400E] dark:text-amber-400" />
              <h2 className="font-heading text-base font-bold text-[var(--fg)]">
                Tabel Audit Aktivitas Login ({historyRows.length} Baris Ditampilkan)
              </h2>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface)] text-[11px] font-bold uppercase tracking-wider text-[var(--fg-muted)]">
                  <th className="px-5 py-3.5">Waktu Kejadian</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Akun Email</th>
                  <th className="px-5 py-3.5">Alamat IP & Perangkat</th>
                  <th className="px-5 py-3.5">Keterangan Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {historyRows.map((row) => {
                  const isSuccess = row.status === "success";
                  return (
                    <tr key={row.id} className="transition hover:bg-[var(--surface)]/60">
                      <td className="whitespace-nowrap px-5 py-3.5 font-mono text-xs text-[var(--fg-muted)]">
                        {new Date(row.createdAt).toLocaleString("id-ID", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5">
                        {isSuccess ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Berhasil
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2.5 py-0.5 text-xs font-bold text-red-800 dark:text-red-300">
                            <XCircle className="h-3.5 w-3.5" />
                            Gagal
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 font-medium text-[var(--fg)]">{row.email}</td>
                      <td className="px-5 py-3.5 text-xs text-[var(--fg-muted)]">
                        <div className="flex flex-col gap-0.5">
                          <span className="inline-flex items-center gap-1 font-mono text-[11px] text-[var(--fg)]">
                            <Globe className="h-3 w-3 text-[#D97706]" />
                            {row.ipAddress || "127.0.0.1"}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px]">
                            <Monitor className="h-3 w-3" />
                            {row.userAgent || "Browser Client"}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-[var(--fg)]">
                        {row.reason || "Aktivitas autentikasi sistem"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
