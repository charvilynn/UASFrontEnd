import Link from "next/link";
import { CheckCircle2, History, Laptop, Shield, Sliders, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revokeOtherSessionsAction, revokeSessionAction } from "@/features/auth/actions";

interface AccountSessionsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AccountSessionsPage({ searchParams }: AccountSessionsPageProps) {
  const user = await requireAuth("/account/sessions");
  const params = await searchParams;
  const updatedParam = typeof params.updated === "string" ? params.updated : null;

  const activeSessions = await prisma.userSession.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  const otherSessionCount = activeSessions.filter((s) => s.token !== user.sessionToken).length;

  return (
    <div className="min-h-screen pb-16">
      <PageHeader
        title="Sesi & Perangkat Aktif"
        subtitle={`Pantau perangkat yang sedang masuk ke akun ${user.name} dan cabut akses dari jarak jauh kapan saja.`}
        fallbackHref="/account/security"
        breadcrumbLabel="Sesi & Perangkat Aktif"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/account/security"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3.5 py-2 text-xs font-semibold text-[var(--fg)] transition hover:border-[#8A3B12]"
            >
              <Shield className="h-3.5 w-3.5" />
              Keamanan Akun
            </Link>
            <Link
              href="/account/login-history"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3.5 py-2 text-xs font-semibold text-[var(--fg)] transition hover:border-[#8A3B12]"
            >
              <History className="h-3.5 w-3.5" />
              Riwayat Login
            </Link>
            <Link
              href="/account/preferences"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3.5 py-2 text-xs font-semibold text-[var(--fg)] transition hover:border-[#8A3B12]"
            >
              <Sliders className="h-3.5 w-3.5" />
              Preferensi
            </Link>
          </div>
        }
      />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {updatedParam && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-600/30 bg-emerald-500/10 px-4 py-3.5 text-sm text-emerald-900 dark:text-emerald-200">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
            <span>
              {updatedParam === "all_other"
                ? "Seluruh sesi perangkat lain berhasil dicabut."
                : "Sesi perangkat berhasil dihentikan."}
            </span>
          </div>
        )}

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
            <div>
              <h2 className="font-serif text-lg font-semibold text-[var(--fg)]">
                Perangkat yang Sedang Masuk ({activeSessions.length})
              </h2>
              <p className="mt-0.5 text-xs text-[var(--fg-muted)]">
                Setiap sesi berlaku selama 7 hari sejak waktu masuk terakhir.
              </p>
            </div>

            {otherSessionCount > 0 && (
              <form action={revokeOtherSessionsAction}>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-red-600/30 bg-red-500/10 px-3.5 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-500/20"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Cabut {otherSessionCount} Sesi Lainnya
                </button>
              </form>
            )}
          </div>

          <div className="space-y-3.5">
            {activeSessions.map((sess) => {
              const isCurrentSession = sess.token === user.sessionToken;
              return (
                <div
                  key={sess.id}
                  className={`flex flex-col justify-between gap-4 rounded-xl border p-4 sm:flex-row sm:items-center ${
                    isCurrentSession
                      ? "border-[#8A3B12]/40 bg-[#8A3B12]/5"
                      : "border-[var(--border)] bg-[var(--bg)]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#8A3B12]/15 text-[#8A3B12]">
                      <Laptop className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-[var(--fg)]">
                          {sess.userAgent || "Peramban Web Charvlibrary"}
                        </p>
                        {isCurrentSession && (
                          <span className="rounded-full bg-[#2E4A36]/15 px-2.5 py-0.5 text-[11px] font-semibold text-[#2E4A36]">
                            Perangkat Saat Ini
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-[var(--fg-muted)]">
                        IP: {sess.ipAddress || "127.0.0.1"} · Masuk:{" "}
                        {new Date(sess.createdAt).toLocaleString("id-ID", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    </div>
                  </div>

                  <form action={revokeSessionAction} className="shrink-0">
                    <input type="hidden" name="sessionId" value={sess.id} />
                    <input type="hidden" name="returnTo" value="/account/sessions" />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-red-600/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-500/20"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {isCurrentSession ? "Keluar Perangkat Ini" : "Cabut Akses"}
                    </button>
                  </form>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
