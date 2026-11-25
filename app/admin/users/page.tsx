import React from "react";
import Link from "next/link";
import {
  UsersRound,
  ShieldCheck,
  UserCheck,
  Mail,
  Send,
  CheckCircle2,
  MessageSquare,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { ForbiddenView } from "@/components/auth/ForbiddenView";
import {
  toggleUserRoleAdminAction,
  replyContactTicketAction,
} from "@/features/admin/actions";

interface AdminUsersPageProps {
  searchParams: Promise<{
    replied?: string;
    error?: string;
  }>;
}

export default async function AdminUsersPage({
  searchParams,
}: AdminUsersPageProps) {
  const currentUser = await requireAuth("/admin/users");
  if (currentUser.role !== "admin") {
    return (
      <ForbiddenView
        requestedPath="/admin/users"
        userName={currentUser.name}
      />
    );
  }

  const resolvedParams = await searchParams;
  const repliedTicket = resolvedParams.replied;
  const errorMessage = resolvedParams.error;

  const [users, tickets] = await Promise.all([
    prisma.user.findMany({
      orderBy: [{ role: "asc" }, { id: "asc" }],
      include: {
        _count: {
          select: {
            loans: true,
            reviews: true,
            fines: true,
          },
        },
      },
    }),
    prisma.contactMessage.findMany({
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    }),
  ]);

  return (
    <div className="pb-16">
      <PageHeader
        title="Kelola Anggota & Tiket Bantuan"
        subtitle="Atur hak akses peran pengguna (Anggota / Pustakawan Admin) dan tanggapi tiket pesan bantuan serta usulan buku."
        fallbackHref="/admin"
        actions={
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3.5 py-2 text-xs font-semibold text-[var(--fg)] hover:border-[#92400E]"
          >
            <Mail className="h-4 w-4 text-[#92400E] dark:text-amber-400" />
            <span>Halaman Hubungi Pustakawan</span>
          </Link>
        }
      />

      <div className="mx-auto max-w-7xl space-y-10 px-4 sm:px-6 lg:px-8">
        {repliedTicket && (
          <div className="flex items-center gap-2.5 rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm font-medium text-emerald-900 dark:border-emerald-800/60 dark:bg-emerald-950/50 dark:text-emerald-200">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
            <span>
              Balasan untuk tiket <strong>{repliedTicket}</strong> berhasil disimpan dan dikirim ke notifikasi pengguna.
            </span>
          </div>
        )}

        {errorMessage && (
          <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm font-medium text-red-900 dark:border-red-800/60 dark:bg-red-950/50 dark:text-red-200">
            {errorMessage}
          </div>
        )}

        <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <UsersRound className="h-5 w-5 text-[#92400E] dark:text-amber-400" />
              <div>
                <h2 className="font-heading text-lg font-bold text-[var(--fg)]">
                  Daftar Akun Anggota & Pustakawan ({users.length})
                </h2>
                <p className="text-xs text-[var(--fg-muted)]">
                  Ubah peran akses antara Member Reguler dan Admin Pustakawan secara langsung
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface)] text-xs font-bold tracking-wider uppercase text-[var(--fg-muted)]">
                  <th className="px-4 py-3">Kode & Nama Anggota</th>
                  <th className="px-4 py-3">Email & Fakultas</th>
                  <th className="px-4 py-3">Aktivitas Sirkulasi</th>
                  <th className="px-4 py-3">Peran Saat Ini</th>
                  <th className="px-4 py-3 text-right">Ubah Hak Akses</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {users.map((u) => {
                  const isAdmin = u.role === "admin";
                  const isSelf = u.id === currentUser.id;
                  const nextRole = isAdmin ? "member" : "admin";

                  return (
                    <tr
                      key={u.id}
                      className="transition-colors hover:bg-[var(--surface)]/50"
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                            style={{ backgroundColor: u.avatarColor }}
                          >
                            {u.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-[var(--fg)]">
                              {u.name}{" "}
                              {isSelf && (
                                <span className="ml-1 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-900 dark:bg-amber-950 dark:text-amber-200">
                                  Sesi Anda
                                </span>
                              )}
                            </p>
                            <p className="font-mono text-xs text-[var(--fg-muted)]">
                              {u.memberCode}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <p className="font-medium text-[var(--fg)]">{u.email}</p>
                        <p className="text-xs text-[var(--fg-muted)]">
                          {u.faculty || "Sivitas Akademika"}
                        </p>
                      </td>

                      <td className="px-4 py-3.5 text-xs text-[var(--fg-muted)]">
                        <span>{u._count.loans} Pinjaman</span> •{" "}
                        <span>{u._count.reviews} Ulasan</span>
                      </td>

                      <td className="px-4 py-3.5">
                        {isAdmin ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-900 dark:bg-amber-950 dark:text-amber-200">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            <span>Admin Pustakawan</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--surface)] px-2.5 py-1 text-xs font-semibold text-[var(--fg-muted)]">
                            <UserCheck className="h-3.5 w-3.5" />
                            <span>Member Reguler</span>
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <form action={toggleUserRoleAdminAction}>
                          <input type="hidden" name="userId" value={u.id} />
                          <input
                            type="hidden"
                            name="nextRole"
                            value={nextRole}
                          />
                          <button
                            type="submit"
                            disabled={isSelf}
                            title={
                              isSelf
                                ? "Tidak dapat mengubah peran akun sendiri"
                                : `Ubah peran menjadi ${nextRole}`
                            }
                            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-[var(--fg)] transition-colors hover:border-[#92400E] hover:bg-[#92400E] hover:text-white disabled:cursor-not-allowed disabled:opacity-45"
                          >
                            {isAdmin
                              ? "Jadikan Member"
                              : "Angkat Jadi Admin"}
                          </button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <MessageSquare className="h-5 w-5 text-[#92400E] dark:text-amber-400" />
              <div>
                <h2 className="font-heading text-lg font-bold text-[var(--fg)]">
                  Tiket Bantuan & Usulan Pengadaan Buku ({tickets.length})
                </h2>
                <p className="text-xs text-[var(--fg-muted)]">
                  Pesan yang dikirim melalui formulir /contact oleh anggota perpustakaan
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {tickets.map((t) => {
              const isOpen = t.status === "open";
              return (
                <div
                  key={t.id}
                  className="flex flex-col justify-between rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm"
                >
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-[var(--surface)] px-2 py-0.5 font-mono text-xs font-bold text-[#92400E] dark:text-amber-300">
                          {t.ticketNumber}
                        </span>
                        <span className="rounded-full bg-[var(--surface)] px-2.5 py-0.5 text-xs font-medium text-[var(--fg-muted)]">
                          {t.category}
                        </span>
                      </div>

                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          isOpen
                            ? "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200"
                            : "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
                        }`}
                      >
                        {isOpen ? "Menunggu Balasan" : "Telah Dijawab"}
                      </span>
                    </div>

                    <h3 className="font-heading mt-3 text-base font-bold text-[var(--fg)]">
                      {t.subject}
                    </h3>
                    <p className="mt-0.5 text-xs text-[var(--fg-muted)]">
                      Dari: <strong>{t.name}</strong> ({t.email}) •{" "}
                      {new Date(t.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>

                    <div className="mt-3 rounded-xl bg-[var(--surface)]/80 p-3.5 text-sm text-[var(--fg)]">
                      {t.message}
                    </div>

                    {t.adminReply && (
                      <div className="mt-3 rounded-xl border border-emerald-300/70 bg-emerald-50/60 p-3.5 text-xs text-emerald-950 dark:border-emerald-800/50 dark:bg-emerald-950/30 dark:text-emerald-200">
                        <p className="font-bold">Balasan Pustakawan:</p>
                        <p className="mt-1">{t.adminReply}</p>
                      </div>
                    )}
                  </div>

                  <form
                    action={replyContactTicketAction}
                    className="mt-4 space-y-2.5 border-t border-[var(--border)] pt-3.5"
                  >
                    <input type="hidden" name="ticketId" value={t.id} />
                    <label
                      htmlFor={`reply-${t.id}`}
                      className="block text-xs font-semibold text-[var(--fg)]"
                    >
                      {t.adminReply
                        ? "Perbarui Balasan Pustakawan:"
                        : "Tulis Balasan Resmi Pustakawan:"}
                    </label>
                    <textarea
                      id={`reply-${t.id}`}
                      name="adminReply"
                      rows={2}
                      required
                      minLength={5}
                      defaultValue={t.adminReply || ""}
                      placeholder="Tuliskan tanggapan atau tindak lanjut pengadaan buku..."
                      className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--fg)]"
                    />
                    <div className="flex items-center justify-between gap-2">
                      <select
                        name="status"
                        defaultValue={t.status === "open" ? "replied" : t.status}
                        aria-label="Status Tiket"
                        className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-xs font-semibold text-[var(--fg)]"
                      >
                        <option value="replied">Status: Terjawab (Replied)</option>
                        <option value="resolved">Status: Selesai (Resolved)</option>
                      </select>

                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#92400E] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#78350F]"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>Kirim Balasan</span>
                      </button>
                    </div>
                  </form>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}