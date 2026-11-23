import React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  BookCheck,
  BookCopy,
  CalendarClock,
  CheckCircle2,
  Clock,
  RefreshCw,
  RotateCcw,
  ShoppingBag,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { GeneratedBookCover } from "@/components/books/GeneratedBookCover";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  extendLoanAction,
  returnBookAction,
} from "@/features/account/actions";

export const dynamic = "force-dynamic";

export default async function BorrowedBooksPage() {
  const sessionUser = await requireAuth("/account/borrowed");

  const loans = await prisma.loan.findMany({
    where: { userId: sessionUser.id },
    include: {
      book: {
        include: {
          authors: {
            include: { author: true },
          },
          categories: {
            include: { category: true },
          },
          publisher: true,
        },
      },
      fine: true,
    },
    orderBy: {
      dueDate: "asc",
    },
  });

  const nowMs = new Date().getTime();
  const activeLoans = loans.filter(
    (loan) => loan.status === "borrowed" || loan.status === "overdue"
  );
  const returnedLoans = loans.filter((loan) => loan.status === "returned");

  const overdueCount = activeLoans.filter((loan) => {
    const diffMs = loan.dueDate.getTime() - nowMs;
    return loan.status === "overdue" || diffMs < 0;
  }).length;

  return (
    <div className="min-h-screen pb-16">
      <PageHeader
        title="Buku Dipinjam & Sirkulasi Aktif"
        subtitle="Pantau hitung mundur tenggat pengembalian, perpanjang masa pinjam mandiri (+7 hari), atau kembalikan buku ke rak sirkulasi."
        fallbackHref="/account/profile"
        actions={
          <>
            <Link
              href="/cart"
              className="inline-flex items-center gap-2 rounded-lg bg-[#92400E] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#78350F]"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>Keranjang Pinjam</span>
            </Link>
            <Link
              href="/borrow/returns"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-xs font-semibold text-[var(--fg)] transition-colors hover:border-[#92400E]"
            >
              <RotateCcw className="h-3.5 w-3.5 text-[#92400E]" />
              <span>Layanan Pengembalian</span>
            </Link>
          </>
        }
      />

      <main className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider uppercase text-[var(--fg-muted)]">
                Pinjaman Berjalan
              </span>
              <BookCopy className="h-5 w-5 text-[#92400E]" />
            </div>
            <p className="font-heading mt-2 text-3xl font-bold text-[var(--fg)]">
              {activeLoans.length}{" "}
              <span className="text-sm font-normal text-[var(--fg-muted)]">
                / 5 kuota maks
              </span>
            </p>
            <p className="mt-1 text-xs text-[var(--fg-muted)]">
              Sisa kuota peminjaman simultan: {Math.max(0, 5 - activeLoans.length)} buku
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider uppercase text-[var(--fg-muted)]">
                Status Jatuh Tempo
              </span>
              <CalendarClock className="h-5 w-5 text-amber-600" />
            </div>
            <p className="font-heading mt-2 text-3xl font-bold text-[var(--fg)]">
              {overdueCount}
            </p>
            <p className="mt-1 text-xs text-[var(--fg-muted)]">
              {overdueCount > 0
                ? "Buku melewati tenggat pengembalian"
                : "Seluruh pinjaman aktif masih dalam batas waktu aman"}
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider uppercase text-[var(--fg-muted)]">
                Telah Dikembalikan
              </span>
              <BookCheck className="h-5 w-5 text-emerald-600" />
            </div>
            <p className="font-heading mt-2 text-3xl font-bold text-[var(--fg)]">
              {returnedLoans.length}
            </p>
            <p className="mt-1 text-xs text-[var(--fg-muted)]">
              Tercatat otomatis pada{" "}
              <Link
                href="/account/history"
                className="font-semibold text-[#92400E] hover:underline dark:text-amber-300"
              >
                Jurnal Riwayat Bacaan
              </Link>
            </p>
          </div>
        </section>

        <section aria-label="Daftar Pinjaman Aktif">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-heading text-xl font-bold text-[var(--fg)]">
                Daftar Pinjaman Aktif ({activeLoans.length})
              </h2>
              <p className="text-xs text-[var(--fg-muted)]">
                Setiap peminjaman dapat diperpanjang maksimal 2 kali (+7 hari per perpanjangan).
              </p>
            </div>
            <Link
              href="/borrow/returns"
              className="text-xs font-semibold text-[#92400E] hover:underline dark:text-amber-300"
            >
              Buka Layanan Pengembalian &rarr;
            </Link>
          </div>

          {activeLoans.length > 0 ? (
            <div className="space-y-4">
              {activeLoans.map((loan) => {
                const primaryAuthor =
                  loan.book.authors[0]?.author.name ?? "Penulis Charvlibrary";
                const primaryCategory =
                  loan.book.categories[0]?.category.name ?? "Literatur";
                const primaryColor =
                  loan.book.categories[0]?.category.accentColor ?? "#92400E";

                const diffMs = loan.dueDate.getTime() - nowMs;
                const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
                const isOverdue =
                  loan.status === "overdue" || daysRemaining < 0;
                const canExtend = loan.extendedCount < 2;

                const borrowedDateStr = loan.borrowedAt.toLocaleDateString(
                  "id-ID",
                  {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  }
                );
                const dueDateStr = loan.dueDate.toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });

                return (
                  <article
                    key={loan.id}
                    className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-xs transition-colors hover:border-[#92400E]/60 sm:p-6"
                  >
                    <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
                      <div className="flex items-start gap-4 sm:gap-5">
                        <div className="w-20 shrink-0 sm:w-24">
                          <GeneratedBookCover
                            title={loan.book.title}
                            author={primaryAuthor}
                            category={primaryCategory}
                            accentColor={primaryColor}
                            coverPath={loan.book.coverPath}
                            publishYear={loan.book.publishYear}
                            className="w-20 sm:w-24 aspect-[2/3]"
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-md bg-[#92400E]/15 px-2.5 py-0.5 font-mono text-xs font-bold text-[#92400E] dark:text-amber-300">
                              {loan.loanCode}
                            </span>
                            <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-2.5 py-0.5 text-[11px] font-medium text-[var(--fg-muted)]">
                              {primaryCategory}
                            </span>
                            <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-2.5 py-0.5 text-[11px] font-medium text-[var(--fg-muted)]">
                              Perpanjangan: {loan.extendedCount}/2
                            </span>
                          </div>

                          <Link
                            href={`/books/${loan.book.id}`}
                            className="font-heading block text-lg font-bold text-[var(--fg)] hover:text-[#92400E] sm:text-xl"
                          >
                            {loan.book.title}
                          </Link>

                          <p className="text-xs text-[var(--fg-muted)]">
                            Karya <span className="font-semibold text-[var(--fg)]">{primaryAuthor}</span>{" "}
                            &bull; {loan.book.publisher.name} ({loan.book.publishYear}) &bull;{" "}
                            {loan.book.pages} halaman
                          </p>

                          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-[var(--fg-muted)]">
                            <span>
                              Dipinjam:{" "}
                              <strong className="text-[var(--fg)]">
                                {borrowedDateStr}
                              </strong>
                            </span>
                            <span>
                              Tenggat Kembali:{" "}
                              <strong className="text-[var(--fg)]">
                                {dueDateStr}
                              </strong>
                            </span>
                          </div>

                          {loan.notes && (
                            <p className="rounded-lg bg-[var(--surface)] px-3 py-1.5 text-xs text-[var(--fg-muted)]">
                              Catatan: {loan.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col justify-between gap-4 border-t border-[var(--border)] pt-4 lg:w-72 lg: items-end lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6">
                        <div className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)]/70 p-3.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-semibold uppercase text-[var(--fg-muted)]">
                              Hitung Mundur Tenggat
                            </span>
                            {isOverdue ? (
                              <AlertTriangle className="h-4 w-4 text-red-600" />
                            ) : (
                              <Clock className="h-4 w-4 text-emerald-600" />
                            )}
                          </div>
                          <p
                            className={`mt-1 text-base font-bold ${
                              isOverdue
                                ? "text-red-700 dark:text-red-400"
                                : daysRemaining <= 3
                                  ? "text-amber-700 dark:text-amber-300"
                                  : "text-emerald-700 dark:text-emerald-300"
                            }`}
                          >
                            {isOverdue
                              ? `Terlambat ${Math.abs(daysRemaining)} Hari`
                              : daysRemaining === 0
                                ? "Jatuh Tempo Hari Ini"
                                : `${daysRemaining} Hari Tersisa`}
                          </p>
                          {isOverdue && (
                            <p className="mt-0.5 text-[11px] text-red-600 dark:text-red-300">
                              Harap segera kembalikan buku ke perpustakaan
                            </p>
                          )}
                        </div>

                        <div className="flex w-full flex-col gap-2 sm:flex-row lg:flex-col">
                          <form action={extendLoanAction} className="w-full">
                            <input
                              type="hidden"
                              name="loanId"
                              value={loan.id}
                            />
                            <button
                              type="submit"
                              disabled={!canExtend}
                              className={`inline-flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition-colors ${
                                canExtend
                                  ? "cursor-pointer border-[#92400E] bg-[var(--surface)] text-[#92400E] hover:bg-[#92400E] hover:text-white dark:text-amber-300"
                                  : "cursor-not-allowed border-[var(--border)] bg-[var(--muted)] text-[var(--fg-muted)] opacity-60"
                              }`}
                            >
                              <RefreshCw className="h-3.5 w-3.5" />
                              <span>
                                {canExtend
                                  ? `Perpanjang 7 Hari (${loan.extendedCount}/2)`
                                  : "Kuota Perpanjangan Habis (2/2)"}
                              </span>
                            </button>
                          </form>

                          <form action={returnBookAction} className="w-full">
                            <input
                              type="hidden"
                              name="loanId"
                              value={loan.id}
                            />
                            <button
                              type="submit"
                              className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#92400E] px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#78350F]"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                              <span>Kembalikan Buku</span>
                            </button>
                          </form>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="Tidak Ada Buku yang Sedang Dipinjam"
              description="Seluruh pinjaman Anda telah dikembalikan. Kunjungi katalog untuk meminjam buku baru atau periksa jurnal riwayat bacaan Anda."
              actionLabel="Eksplorasi Katalog Buku"
              actionHref="/explore"
              secondaryActionLabel="Buka Jurnal Riwayat Bacaan"
              secondaryActionHref="/account/history"
            />
          )}
        </section>

        {returnedLoans.length > 0 && (
          <section
            aria-label="Arsip Pinjaman yang Telah Dikembalikan"
            className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-xs"
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-heading text-lg font-bold text-[var(--fg)]">
                  Arsip Pengembalian Sirkulasi ({returnedLoans.length})
                </h2>
                <p className="text-xs text-[var(--fg-muted)]">
                  Buku yang telah selesai Anda kembalikan ke perpustakaan
                </p>
              </div>
              <Link
                href="/account/history"
                className="text-xs font-semibold text-[#92400E] hover:underline dark:text-amber-300"
              >
                Tulis Refleksi di Riwayat Bacaan &rarr;
              </Link>
            </div>

            <div className="divide-y divide-[var(--border)]">
              {returnedLoans.slice(0, 6).map((loan) => (
                <div
                  key={loan.id}
                  className="flex flex-wrap items-center justify-between gap-4 py-3.5 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                    <div>
                      <Link
                        href={`/books/${loan.book.id}`}
                        className="font-bold text-[var(--fg)] hover:text-[#92400E]"
                      >
                        {loan.book.title}
                      </Link>
                      <p className="text-[var(--fg-muted)]">
                        Kode: <span className="font-mono">{loan.loanCode}</span>{" "}
                        &bull; Dipinjam{" "}
                        {loan.borrowedAt.toLocaleDateString("id-ID")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center rounded-full bg-emerald-600/15 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                      Dikembalikan{" "}
                      {loan.returnedAt
                        ? loan.returnedAt.toLocaleDateString("id-ID")
                        : "Selesai"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}