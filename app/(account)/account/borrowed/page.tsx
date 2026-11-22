import Link from "next/link";
import {
  BookCheck,
  BookCopy,
  CalendarClock,
  RotateCcw,
  ShoppingBag,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { PageHeader } from "@/components/layout/PageHeader";

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

      </main>
    </div>
  );
}