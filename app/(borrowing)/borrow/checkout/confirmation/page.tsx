import Link from "next/link";
import {
  Ticket,
  CheckCircle2,
  BookCopy,
  RotateCcw,
  Compass,
  QrCode,
  ShieldCheck,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";

interface ConfirmationPageProps {
  searchParams: Promise<{
    code?: string;
  }>;
}

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default async function BorrowConfirmationPage({
  searchParams,
}: ConfirmationPageProps) {
  const user = await requireAuth("/borrow/confirmation");
  const resolvedParams = await searchParams;
  const requestedCode = resolvedParams.code;

  const userLoans = await prisma.loan.findMany({
    where: { userId: user.id },
    include: {
      book: {
        include: {
          publisher: true,
          authors: { include: { author: true } },
          categories: { include: { category: true } },
        },
      },
    },
    orderBy: { borrowedAt: "desc" },
    take: 10,
  });

  const primaryLoan =
    (requestedCode
      ? userLoans.find((l) => l.loanCode === requestedCode)
      : undefined) || userLoans[0];

  const batchLoans = primaryLoan
    ? userLoans.filter(
        (l) =>
          Math.abs(
            l.borrowedAt.getTime() - primaryLoan.borrowedAt.getTime()
          ) <=
          2 * 60 * 1000
      )
    : [];

  const displayLoans =
    batchLoans.length > 0
      ? batchLoans
      : primaryLoan
      ? [primaryLoan]
      : [];

  return (
    <div className="min-h-screen pb-16">
      <PageHeader
        title="Bukti Peminjaman Digital"
        subtitle="Tiket resi sirkulasi resmi Charvlibrary. Tunjukkan kode transaksi ini kepada petugas meja sirkulasi atau gunakan untuk pengembalian mandiri."
        fallbackHref="/account/borrowed"
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/account/borrowed"
              className="inline-flex items-center gap-2 rounded-lg bg-[#92400E] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#78350F]"
            >
              <BookCopy className="h-4 w-4" />
              <span>Lihat Buku Dipinjam</span>
            </Link>
            <Link
              href="/borrow/returns"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-xs font-semibold text-[var(--fg)] transition-colors hover:border-[#92400E]"
            >
              <RotateCcw className="h-4 w-4 text-[#92400E]" />
              <span>Pengembalian & Perpanjangan</span>
            </Link>
          </div>
        }
      />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {!primaryLoan ? (
          <EmptyState
            title="Belum Ada Transaksi Peminjaman"
            description="Anda belum memiliki riwayat peminjaman aktif. Silakan pilih buku dari katalog dan lakukan checkout terlebih dahulu."
            actionLabel="Jelajahi Katalog Buku"
            actionHref="/explore"
            secondaryActionLabel="Buka Keranjang Pinjam"
            secondaryActionHref="/cart"
          />
        ) : (
          <div className="overflow-hidden rounded-3xl border-2 border-[#92400E]/35 bg-[var(--card)] shadow-lg">
            <div className="bg-gradient-to-r from-[#92400E] via-[#78350F] to-[#451A03] px-6 py-6 text-[#FFFBEB]">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-xs">
                    <Ticket className="h-6 w-6 text-amber-300" />
                  </div>
                  <div>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase text-amber-200">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                      Transaksi Sirkulasi Terverifikasi
                    </span>
                    <h2 className="font-heading text-xl font-bold sm:text-2xl">
                      Tiket Resi Peminjaman Charvlibrary
                    </h2>
                  </div>
                </div>

                <div className="rounded-xl border border-amber-200/30 bg-black/25 px-4 py-2.5 text-right">
                  <span className="block text-[10px] font-semibold tracking-widest uppercase text-amber-200/80">
                    Kode Resi Utama
                  </span>
                  <span className="font-mono text-lg font-bold tracking-wider text-amber-300">
                    {primaryLoan.loanCode}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="grid grid-cols-1 gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/70 p-4 text-xs sm:grid-cols-4">
                <div>
                  <span className="text-[var(--fg-muted)]">Nama Anggota</span>
                  <p className="mt-1 font-semibold text-[var(--fg)]">
                    {user.name}
                  </p>
                </div>
                <div>
                  <span className="text-[var(--fg-muted)]">ID Kartu Anggota</span>
                  <p className="mt-1 font-mono font-semibold text-[#92400E] dark:text-amber-400">
                    {user.memberCode}
                  </p>
                </div>
                <div>
                  <span className="text-[var(--fg-muted)]">Tanggal Pinjam</span>
                  <p className="mt-1 font-semibold text-[var(--fg)]">
                    {formatDateTime(primaryLoan.borrowedAt)}
                  </p>
                </div>
                <div>
                  <span className="text-[var(--fg-muted)]">Status Sirkulasi</span>
                  <p className="mt-1 inline-flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Aktif ({displayLoans.length} Buku)
                  </p>
                </div>
              </div>

              {primaryLoan.notes && (
                <div className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--surface)]/60 p-4 text-xs">
                  <span className="font-semibold text-[var(--fg)]">
                    Catatan Peminjam:
                  </span>
                  <p className="mt-1 text-[var(--fg-muted)]">
                    {primaryLoan.notes}
                  </p>
                </div>
              )}

              <div className="mt-6 flex flex-col items-start justify-between gap-4 border-t border-dashed border-[var(--border)] pt-6 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[#92400E]">
                    <QrCode className="h-8 w-8" />
                  </div>
                  <div className="text-xs text-[var(--fg-muted)]">
                    <p className="font-semibold text-[var(--fg)]">
                      Verifikasi Sirkulasi Otomatis
                    </p>
                    <p>
                      Anda dapat mengembalikan buku kapan saja atau memperpanjang
                      masa pinjam +7 hari secara mandiri.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <Link
                    href="/account/borrowed"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#92400E] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#78350F]"
                  >
                    <BookCopy className="h-4 w-4" />
                    <span>Ke Daftar Buku Dipinjam</span>
                  </Link>
                  <Link
                    href="/borrow/returns"
                    className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-xs font-semibold text-[var(--fg)] transition-colors hover:border-[#92400E]"
                  >
                    <RotateCcw className="h-4 w-4 text-[#92400E]" />
                    <span>Pusat Pengembalian</span>
                  </Link>
                  <Link
                    href="/explore"
                    className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-xs font-semibold text-[var(--fg)] transition-colors hover:border-[#92400E]"
                  >
                    <Compass className="h-4 w-4" />
                    <span>Katalog</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}