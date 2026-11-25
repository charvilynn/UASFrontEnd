import Link from "next/link";
import {
  BookOpen,
  Users,
  AlertTriangle,
  PlusCircle,
  BookMarked,
  Tags,
  UsersRound,
  ArrowRight,
  Clock,
  Layers,
  RotateCcw,
  Bell,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { ForbiddenView } from "@/components/auth/ForbiddenView";
import { adminReturnLoanAction } from "@/features/admin/actions";

export default async function AdminDashboardPage() {
  const user = await requireAuth("/admin");
  if (user.role !== "admin") {
    return <ForbiddenView requestedPath="/admin" userName={user.name} />;
  }

  const [
    totalBooks,
    availableBooksCount,
    unavailableBooksCount,
    totalUsers,
    activeLoansCount,
    overdueLoansCount,
    openTicketsCount,
    activeLoans,
    unreadNotifCount,
    recentNotifications,
  ] = await Promise.all([
    prisma.book.count(),
    prisma.book.count({
      where: { stockAvailable: { gt: 0 } },
    }),
    prisma.book.count({
      where: { stockAvailable: { lte: 0 } },
    }),
    prisma.user.count(),
    prisma.loan.count({
      where: { status: { in: ["borrowed", "overdue"] } },
    }),
    prisma.loan.count({
      where: { status: "overdue" },
    }),
    prisma.contactMessage.count({
      where: { status: "open" },
    }),
    prisma.loan.findMany({
      where: { status: { in: ["borrowed", "overdue"] } },
      orderBy: [{ status: "desc" }, { borrowedAt: "desc" }],
      include: {
        user: true,
        book: true,
      },
    }),
    prisma.notification.count({
      where: { userId: user.id, isRead: false },
    }),
    prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return (
    <div className="pb-16">
      <PageHeader
        title="Dasbor Analitik Pustakawan"
        subtitle={`Selamat bertugas, ${user.name}. Pantau kesehatan koleksi, daftar buku yang sedang dipinjam beserta peminjamnya, dan tiket anggota secara real-time.`}
        fallbackHref="/"
        actions={
          <>
            <Link
              href="/books/new"
              className="inline-flex items-center gap-2 rounded-lg bg-[#92400E] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#78350F]"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Tambah Buku Baru</span>
            </Link>
            <Link
              href="/admin/books"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-xs font-semibold text-[var(--fg)] transition-colors hover:border-[#92400E]"
            >
              <BookMarked className="h-4 w-4 text-[#92400E] dark:text-amber-400" />
              <span>Kelola Katalog</span>
            </Link>
            <Link
              href="/account/notifications"
              data-testid="admin-dashboard-notifications-link"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-xs font-semibold text-[var(--fg)] transition-colors hover:border-[#92400E]"
            >
              <Bell className="h-4 w-4 text-[#92400E] dark:text-amber-400" />
              <span>Notifikasi</span>
              {unreadNotifCount > 0 && (
                <span className="inline-flex min-w-[20px] items-center justify-center rounded-full bg-[#92400E] px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                  {unreadNotifCount > 99 ? "99+" : unreadNotifCount}
                </span>
              )}
            </Link>
          </>
        }
      />

      <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
        <section aria-label="Pintasan Modul Admin">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/books/new"
              className="group flex items-start justify-between rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm transition-all hover:border-[#92400E]"
            >
              <div>
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#92400E]/15 text-[#92400E] dark:text-amber-300">
                  <PlusCircle className="h-5 w-5" />
                </div>
                <h2 className="font-heading text-base font-bold text-[var(--fg)] group-hover:text-[#92400E] dark:group-hover:text-amber-300">
                  Tambah Buku Baru
                </h2>
                <p className="mt-1 text-xs text-[var(--fg-muted)]">
                  Input buku manual beserta sampul JPG/PNG/WebP
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-[var(--fg-muted)] transition-transform group-hover:translate-x-1 group-hover:text-[#92400E]" />
            </Link>

            <Link
              href="/admin/books"
              className="group flex items-start justify-between rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm transition-all hover:border-[#92400E]"
            >
              <div>
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#92400E]/15 text-[#92400E] dark:text-amber-300">
                  <BookMarked className="h-5 w-5" />
                </div>
                <h2 className="font-heading text-base font-bold text-[var(--fg)] group-hover:text-[#92400E] dark:group-hover:text-amber-300">
                  Kelola Katalog Buku
                </h2>
                <p className="mt-1 text-xs text-[var(--fg-muted)]">
                  Pantau status ketersediaan, peminjam, edit, atau hapus buku
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-[var(--fg-muted)] transition-transform group-hover:translate-x-1 group-hover:text-[#92400E]" />
            </Link>

            <Link
              href="/admin/taxonomies"
              className="group flex items-start justify-between rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm transition-all hover:border-[#92400E]"
            >
              <div>
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#92400E]/15 text-[#92400E] dark:text-amber-300">
                  <Tags className="h-5 w-5" />
                </div>
                <h2 className="font-heading text-base font-bold text-[var(--fg)] group-hover:text-[#92400E] dark:group-hover:text-amber-300">
                  Master Taksonomi
                </h2>
                <p className="mt-1 text-xs text-[var(--fg-muted)]">
                  Kelola daftar Kategori, Penulis, dan Penerbit
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-[var(--fg-muted)] transition-transform group-hover:translate-x-1 group-hover:text-[#92400E]" />
            </Link>

            <Link
              href="/admin/users"
              className="group flex items-start justify-between rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm transition-all hover:border-[#92400E]"
            >
              <div>
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#92400E]/15 text-[#92400E] dark:text-amber-300">
                  <UsersRound className="h-5 w-5" />
                </div>
                <h2 className="font-heading text-base font-bold text-[var(--fg)] group-hover:text-[#92400E] dark:group-hover:text-amber-300">
                  Anggota & Tiket ({openTicketsCount} Aktif)
                </h2>
                <p className="mt-1 text-xs text-[var(--fg-muted)]">
                  Atur peran akses pengguna & balas tiket bantuan
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-[var(--fg-muted)] transition-transform group-hover:translate-x-1 group-hover:text-[#92400E]" />
            </Link>
          </div>
        </section>

        <section aria-label="Metrik Sirkulasi Perpustakaan">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
              <div className="flex items-center justify-between text-xs font-semibold text-[var(--fg-muted)]">
                <span>Total Judul Buku</span>
                <BookOpen className="h-4 w-4 text-[#92400E] dark:text-amber-400" />
              </div>
              <p className="font-heading mt-2 text-3xl font-bold text-[var(--fg)]">
                {totalBooks}
              </p>
              <p className="mt-1 text-xs text-[var(--fg-muted)]">
                Judul buku terindeks di katalog
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
              <div className="flex items-center justify-between text-xs font-semibold text-[var(--fg-muted)]">
                <span>Tersedia vs Dipinjam</span>
                <Layers className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
              </div>
              <p className="font-heading mt-2 text-3xl font-bold text-emerald-700 dark:text-emerald-400">
                {availableBooksCount}{" "}
                <span className="text-base font-normal text-rose-700 dark:text-rose-400">
                  / {unavailableBooksCount} dipinjam
                </span>
              </p>
              <p className="mt-1 text-xs text-[var(--fg-muted)]">
                {activeLoansCount} buku berstatus Tidak Tersedia
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
              <div className="flex items-center justify-between text-xs font-semibold text-[var(--fg-muted)]">
                <span>Total Anggota</span>
                <Users className="h-4 w-4 text-[#92400E] dark:text-amber-400" />
              </div>
              <p className="font-heading mt-2 text-3xl font-bold text-[var(--fg)]">
                {totalUsers}
              </p>
              <p className="mt-1 text-xs text-[var(--fg-muted)]">
                Sivitas akademika & pustakawan
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
              <div className="flex items-center justify-between text-xs font-semibold text-[var(--fg-muted)]">
                <span>Pinjaman Terlambat</span>
                <AlertTriangle className="h-4 w-4 text-amber-600" />
              </div>
              <p className="font-heading mt-2 text-3xl font-bold text-amber-700 dark:text-amber-400">
                {overdueLoansCount}
              </p>
              <p className="mt-1 text-xs text-[var(--fg-muted)]">
                Melewati batas jatuh tempo
              </p>
            </div>
          </div>
        </section>

        <section
          aria-label="Notifikasi Sirkulasi Terbaru"
          data-testid="admin-notifications-section"
          className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm"
        >
          <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-[#92400E] dark:bg-amber-950/60 dark:text-amber-300">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-heading text-lg font-bold text-[var(--fg)]">
                    Notifikasi Peminjaman & Sirkulasi Terbaru
                  </h2>
                  {unreadNotifCount > 0 && (
                    <span className="rounded-full bg-[#92400E] px-2.5 py-0.5 text-[11px] font-bold text-white">
                      {unreadNotifCount} belum dibaca
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-[var(--fg-muted)]">
                  Pemberitahuan otomatis setiap kali anggota meminjam atau mengembalikan buku perpustakaan.
                </p>
              </div>
            </div>

            <Link
              href="/account/notifications"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 text-xs font-semibold text-[#92400E] hover:border-[#92400E] dark:text-amber-300"
            >
              <span>Buka Kotak Masuk Notifikasi</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {recentNotifications.length === 0 ? (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)]/50 p-5 text-center text-xs text-[var(--fg-muted)]">
              Belum ada notifikasi sirkulasi anggota terbaru.
            </div>
          ) : (
            <div className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-[var(--surface)]/30">
              {recentNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className="flex flex-col justify-between gap-2 px-4 py-3 sm:flex-row sm:items-center"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {!notif.isRead && (
                        <span
                          aria-label="Belum dibaca"
                          className="inline-block h-2 w-2 shrink-0 rounded-full bg-[#92400E]"
                        />
                      )}
                      <p className="truncate text-sm font-bold text-[var(--fg)]">
                        {notif.title}
                      </p>
                      <span className="shrink-0 text-[11px] text-[var(--fg-muted)]">
                        {new Date(notif.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-xs text-[var(--fg-muted)]">
                      {notif.message}
                    </p>
                  </div>

                  {notif.actionHref && (
                    <Link
                      href={notif.actionHref}
                      className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-xs font-semibold text-[#92400E] hover:border-[#92400E] dark:text-amber-300"
                    >
                      <span>Tinjau</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <section
          aria-label="Daftar Buku yang Sedang Dipinjam"
          data-testid="admin-borrowed-books-section"
          className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm"
        >
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-heading text-xl font-bold text-[var(--fg)]">
                Daftar Buku yang Sedang Dipinjam & Peminjamnya ({activeLoans.length} Buku)
              </h2>
              <p className="mt-0.5 text-xs text-[var(--fg-muted)]">
                Buku di bawah ini berstatus <strong>Tidak Tersedia</strong> di katalog sampai dikembalikan oleh peminjam atau ditandai kembali oleh Pustakawan.
              </p>
            </div>
            <Link
              href="/admin/books?status=borrowed"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 text-xs font-semibold text-[#92400E] hover:border-[#92400E] dark:text-amber-300"
            >
              <span>Filter Buku Dipinjam di Katalog</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {activeLoans.length === 0 ? (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)]/50 p-6 text-center text-sm text-[var(--fg-muted)]">
              Seluruh buku saat ini berstatus Tersedia di rak perpustakaan. Tidak ada pinjaman aktif.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--surface)] text-xs font-bold tracking-wider uppercase text-[var(--fg-muted)]">
                    <th className="px-4 py-3">Buku yang Dipinjam</th>
                    <th className="px-4 py-3">Dipinjam Oleh (Peminjam)</th>
                    <th className="px-4 py-3">Kode & Tanggal Pinjam</th>
                    <th className="px-4 py-3">Jatuh Tempo</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Aksi Pustakawan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {activeLoans.map((loan) => {
                    const isOverdue = loan.status === "overdue";
                    return (
                      <tr
                        key={loan.id}
                        className="transition-colors hover:bg-[var(--surface)]/50"
                      >
                        <td className="px-4 py-3.5 align-top">
                          <Link
                            href={`/books/${loan.book.id}`}
                            className="font-heading font-bold text-[var(--fg)] hover:text-[#92400E] dark:hover:text-amber-300"
                          >
                            {loan.book.title}
                          </Link>
                          <p className="mt-0.5 font-mono text-xs text-[var(--fg-muted)]">
                            ISBN: {loan.book.isbn}
                          </p>
                        </td>

                        <td className="px-4 py-3.5 align-top">
                          <p className="font-semibold text-[var(--fg)]">
                            {loan.user.name}
                          </p>
                          <p className="mt-0.5 text-xs text-[var(--fg-muted)]">
                            {loan.user.email}
                          </p>
                          <span className="mt-1 inline-block rounded bg-[var(--surface)] px-2 py-0.5 font-mono text-[11px] font-semibold text-[#92400E] dark:text-amber-300">
                            {loan.user.memberCode}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 align-top">
                          <span className="font-mono text-xs font-bold text-[#92400E] dark:text-amber-300">
                            {loan.loanCode}
                          </span>
                          <p className="mt-0.5 text-xs text-[var(--fg-muted)]">
                            {new Date(loan.borrowedAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </td>

                        <td className="px-4 py-3.5 align-top">
                          <p className="text-xs font-semibold text-[var(--fg)]">
                            {new Date(loan.dueDate).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </td>

                        <td className="px-4 py-3.5 align-top">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                              isOverdue
                                ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200"
                                : "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200"
                            }`}
                          >
                            <Clock className="h-3 w-3" />
                            <span>
                              {isOverdue ? "Terlambat" : "Sedang Dipinjam"}
                            </span>
                          </span>
                        </td>

                        <td className="px-4 py-3.5 text-right align-top">
                          <form action={adminReturnLoanAction}>
                            <input type="hidden" name="loanId" value={loan.id} />
                            <button
                              type="submit"
                              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-800"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                              <span>Tandai Dikembalikan</span>
                            </button>
                          </form>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}