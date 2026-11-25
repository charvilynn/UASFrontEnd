import Link from "next/link";
import {
  RotateCcw,
  CalendarPlus,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { GeneratedBookCover } from "@/components/books/GeneratedBookCover";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  returnLoanItemAction,
  extendLoanItemAction,
} from "@/features/borrowing/actions";

interface BorrowReturnsPageProps {
  searchParams: Promise<{
    status?: string;
    code?: string;
    error?: string;
  }>;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default async function BorrowReturnsPage({
  searchParams,
}: BorrowReturnsPageProps) {
  const user = await requireAuth("/borrow/returns");
  const resolvedParams = await searchParams;
  const actionStatus = resolvedParams.status;
  const actionCode = resolvedParams.code;
  const errorMsg = resolvedParams.error;

  const allLoans = await prisma.loan.findMany({
    where: { userId: user.id },
    include: {
      book: {
        include: {
          publisher: true,
          authors: { include: { author: true } },
          categories: { include: { category: true } },
        },
      },
      fine: true,
    },
    orderBy: { borrowedAt: "desc" },
  });

  const activeLoans = allLoans.filter((l) => l.status !== "returned");
  const now = new Date();

  return (
    <div className="min-h-screen pb-16">
      <PageHeader
        title="Pusat Pengembalian & Perpanjangan Mandiri"
        subtitle="Kembalikan buku yang telah selesai Anda baca secara instan ke stok perpustakaan atau perpanjang masa pinjam hingga +7 hari."
        fallbackHref="/account/borrowed"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {actionStatus === "returned" && (
          <div
            role="status"
            className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200"
          >
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
            <span>
              Pengembalian mandiri berhasil! Transaksi{" "}
              <strong>{actionCode}</strong> telah ditutup dan stok buku telah
              dikembalikan ke rak katalog.
            </span>
          </div>
        )}

        {actionStatus === "extended" && (
          <div
            role="status"
            className="mb-6 flex items-center gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-950 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-200"
          >
            <CalendarPlus className="h-5 w-5 shrink-0 text-amber-600" />
            <span>
              Masa pinjam transaksi <strong>{actionCode}</strong> berhasil
              diperpanjang selama +7 hari.
            </span>
          </div>
        )}

        {errorMsg && (
          <div
            role="alert"
            className="mb-6 flex items-center gap-3 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-900 dark:border-red-800 dark:bg-red-950/60 dark:text-red-200"
          >
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <section aria-labelledby="active-loans-heading" className="mb-12">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2
                id="active-loans-heading"
                className="font-heading text-xl font-bold text-[var(--fg)]"
              >
                Pinjaman Aktif ({activeLoans.length} Buku)
              </h2>
              <p className="text-xs text-[var(--fg-muted)]">
                Klik Kembalikan Buku untuk menyelesaikan pinjaman atau
                Perpanjang +7 Hari (maksimal 2 kali per buku).
              </p>
            </div>
          </div>

          {activeLoans.length === 0 ? (
            <EmptyState
              title="Tidak Ada Pinjaman Aktif Saat Ini"
              description="Seluruh buku yang pernah Anda pinjam sudah dikembalikan. Jelajahi katalog untuk meminjam buku baru."
              actionLabel="Jelajahi Katalog Buku"
              actionHref="/explore"
              secondaryActionLabel="Lihat Riwayat Bacaan"
              secondaryActionHref="/account/history"
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {activeLoans.map((loan) => {
                const primaryAuthor =
                  loan.book.authors[0]?.author.name || "Penulis Koleksi";
                const primaryCategory =
                  loan.book.categories[0]?.category.name || "Literatur";
                const accentColor =
                  loan.book.categories[0]?.category.accentColor || "#92400E";

                const diffMs = loan.dueDate.getTime() - now.getTime();
                const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
                const isOverdue =
                  loan.status === "overdue" || daysRemaining < 0;
                const canExtend = loan.extendedCount < 2;

                return (
                  <article
                    key={loan.id}
                    className="flex flex-col justify-between rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-xs"
                  >
                    <div className="flex gap-4">
                      <div className="w-24 shrink-0">
                        <Link href={`/books/${loan.book.id}`} className="block">
                          <GeneratedBookCover
                            title={loan.book.title}
                            author={primaryAuthor}
                            category={primaryCategory}
                            accentColor={accentColor}
                            coverPath={loan.book.coverPath}
                            publishYear={loan.book.publishYear}
                            className="w-full aspect-[2/3]"
                          />
                        </Link>
                      </div>

                      <div className="flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="rounded bg-[#92400E]/15 px-2 py-0.5 font-mono text-[11px] font-bold text-[#92400E] dark:text-amber-300">
                            {loan.loanCode}
                          </span>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              isOverdue
                                ? "bg-red-100 text-red-900 dark:bg-red-950/70 dark:text-red-200"
                                : "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/70 dark:text-emerald-200"
                            }`}
                          >
                            {isOverdue
                              ? `Terlambat ${Math.abs(daysRemaining)} Hari`
                              : `Sisa ${daysRemaining} Hari`}
                          </span>
                        </div>

                        <h3 className="mt-2 font-heading text-lg font-bold text-[var(--fg)] hover:text-[#92400E]">
                          <Link href={`/books/${loan.book.id}`}>
                            {loan.book.title}
                          </Link>
                        </h3>
                        <p className="text-xs text-[var(--fg-muted)]">
                          {primaryAuthor} &bull; {loan.book.pages} halaman
                        </p>

                        <dl className="mt-3 grid grid-cols-2 gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)]/70 p-2.5 text-xs">
                          <div>
                            <dt className="text-[11px] text-[var(--fg-muted)]">
                              Tanggal Pinjam
                            </dt>
                            <dd className="font-semibold text-[var(--fg)]">
                              {formatDate(loan.borrowedAt)}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-[11px] text-[var(--fg-muted)]">
                              Jatuh Tempo
                            </dt>
                            <dd className="font-semibold text-[var(--fg)]">
                              {formatDate(loan.dueDate)}
                            </dd>
                          </div>
                        </dl>

                        <p className="mt-2 text-[11px] text-[var(--fg-muted)]">
                          Status Perpanjangan:{" "}
                          <strong>{loan.extendedCount} / 2 kali</strong>
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2.5 border-t border-[var(--border)] pt-3.5">
                      <form action={returnLoanItemAction} className="flex-1">
                        <input type="hidden" name="loanId" value={loan.id} />
                        <button
                          type="submit"
                          className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#92400E] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#78350F]"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          <span>Kembalikan Buku</span>
                        </button>
                      </form>

                      {canExtend ? (
                        <form action={extendLoanItemAction} className="flex-1">
                          <input type="hidden" name="loanId" value={loan.id} />
                          <button
                            type="submit"
                            className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#92400E] bg-[#92400E]/10 px-3.5 py-2 text-xs font-semibold text-[#92400E] transition-colors hover:bg-[#92400E] hover:text-white dark:text-amber-300"
                          >
                            <CalendarPlus className="h-3.5 w-3.5" />
                            <span>Perpanjang +7 Hari</span>
                          </button>
                        </form>
                      ) : (
                        <span className="inline-flex flex-1 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-xs font-medium text-[var(--fg-muted)]">
                          Kuota Perpanjangan Habis
                        </span>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}