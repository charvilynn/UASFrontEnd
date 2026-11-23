import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  Heart,
  BookCopy,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { GeneratedBookCover } from "@/components/books/GeneratedBookCover";
import { EmptyState } from "@/components/ui/EmptyState";

interface CartPageProps {
  searchParams: Promise<{
    moved?: string;
    error?: string;
  }>;
}

function formatIndonesianDate(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default async function CartPage({ searchParams }: CartPageProps) {
  const user = await requireAuth("/cart");
  const resolvedParams = await searchParams;
  const movedBanner = resolvedParams.moved === "1";
  const errorMsg = resolvedParams.error;

  const [cartItems, activeLoansCount] = await Promise.all([
    prisma.borrowCartItem.findMany({
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
      orderBy: { addedAt: "desc" },
    }),
    prisma.loan.count({
      where: {
        userId: user.id,
        status: { in: ["borrowed", "overdue"] },
      },
    }),
  ]);

  const maxQuota = 5;
  const remainingQuota = Math.max(0, maxQuota - activeLoansCount);
  const availableItemsInCart = cartItems.filter(
    (item) => item.book.stockAvailable > 0
  );
  const quotaExceeded = cartItems.length > remainingQuota;
    availableItemsInCart.length > 0 && remainingQuota > 0;

  return (
    <div className="min-h-screen pb-16">
      <PageHeader
        title="Keranjang Pinjam"
        subtitle="Kelola daftar buku yang akan Anda pinjam, sesuaikan durasi peminjaman (7, 14, atau 21 hari), dan periksa kuota sirkulasi aktif Anda sebelum checkout."
        fallbackHref="/explore"
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/wishlist"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3.5 py-2 text-xs font-semibold text-[var(--fg)] transition-colors hover:border-[#92400E]"
            >
              <Heart className="h-4 w-4 text-rose-600" />
              <span>Daftar Keinginan</span>
            </Link>
            <Link
              href="/account/borrowed"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3.5 py-2 text-xs font-semibold text-[var(--fg)] transition-colors hover:border-[#92400E]"
            >
              <BookCopy className="h-4 w-4 text-[#92400E]" />
              <span>Pinjaman Aktif ({activeLoansCount})</span>
            </Link>
          </div>
        }
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {movedBanner && (
          <div
            role="status"
            className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200"
          >
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
            <span>
              Buku dari Daftar Keinginan berhasil dipindahkan ke Keranjang Pinjam.
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

        <section
          aria-label="Status Kuota Peminjaman"
          className="mb-8 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-xs"
        >
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-semibold tracking-wider uppercase text-[#92400E] dark:text-amber-400">
                Indikator Kuota Sirkulasi Anggota
              </p>
              <h2 className="mt-1 font-heading text-lg font-bold text-[var(--fg)]">
                Sisa Kuota Pinjam: {remainingQuota} dari {maxQuota} Buku
              </h2>
              <p className="mt-0.5 text-xs text-[var(--fg-muted)]">
                Saat ini Anda memiliki <strong>{activeLoansCount}</strong> buku
                yang sedang dipinjam dan <strong>{cartItems.length}</strong>{" "}
                buku di dalam keranjang.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {Array.from({ length: maxQuota }).map((_, idx) => {
                const isBorrowedSlot = idx < activeLoansCount;
                const isCartSlot =
                  idx >= activeLoansCount &&
                  idx < activeLoansCount + cartItems.length;
                return (
                  <div
                    key={idx}
                    title={
                      isBorrowedSlot
                        ? "Slot Pinjaman Aktif"
                        : isCartSlot
                        ? "Slot Keranjang Pinjam"
                        : "Slot Kuota Tersedia"
                    }
                    className={`flex h-10 w-10 items-center justify-center rounded-xl border text-xs font-bold ${
                      isBorrowedSlot
                        ? "border-amber-700 bg-[#92400E] text-white"
                        : isCartSlot
                        ? "border-amber-400 bg-amber-100 text-amber-950 dark:bg-amber-900/60 dark:text-amber-100"
                        : "border-[var(--border)] bg-[var(--surface)] text-[var(--fg-muted)]"
                    }`}
                  >
                    {idx + 1}
                  </div>
                );
              })}
            </div>
          </div>

          {quotaExceeded && (
            <p className="mt-3 rounded-lg bg-amber-100/80 px-3 py-2 text-xs font-medium text-amber-950 dark:bg-amber-950/60 dark:text-amber-200">
              Catatan: Jumlah buku di keranjang ({cartItems.length}) melebihi
              sisa kuota pinjam Anda ({remainingQuota}). Saat checkout,{" "}
              {remainingQuota} buku pertama yang tersedia akan diproses terlebih
              dahulu.
            </p>
          )}
        </section>

        {cartItems.length === 0 ? (
          <EmptyState
            title="Keranjang Pinjam Anda Masih Kosong"
            description="Pilih buku dari katalog eksplorasi atau pindahkan buku incaran dari Daftar Keinginan untuk mulai meminjam."
            actionLabel="Jelajahi Katalog Buku"
            actionHref="/explore"
            secondaryActionLabel="Buka Daftar Keinginan"
            secondaryActionHref="/wishlist"
          />
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              {(() => {
                const nowMs = new Date().getTime();
                return cartItems.map((item) => {
                  const primaryAuthor =
                    item.book.authors[0]?.author.name || "Penulis Koleksi";
                  const primaryCategory =
                    item.book.categories[0]?.category.name || "Literatur";
                  const accentColor =
                    item.book.categories[0]?.category.accentColor || "#92400E";
                  const isAvailable = item.book.stockAvailable > 0;
                  const estimatedDue = new Date(
                    nowMs + item.durationDays * 24 * 60 * 60 * 1000
                  );

                return (
                  <article
                    key={item.id}
                    className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-xs sm:p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row">
                      <div className="w-24 shrink-0 sm:w-28">
                        <Link href={`/books/${item.book.id}`} className="block">
                          <GeneratedBookCover
                            title={item.book.title}
                            author={primaryAuthor}
                            category={primaryCategory}
                            accentColor={accentColor}
                            coverPath={item.book.coverPath}
                            publishYear={item.book.publishYear}
                            className="w-full aspect-[2/3]"
                          />
                        </Link>
                      </div>

                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="rounded-md bg-[#92400E]/10 px-2.5 py-0.5 text-xs font-semibold text-[#92400E] dark:text-amber-300">
                              {primaryCategory}
                            </span>
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                isAvailable
                                  ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/70 dark:text-emerald-200"
                                  : "bg-red-100 text-red-900 dark:bg-red-950/70 dark:text-red-200"
                              }`}
                            >
                              {isAvailable
                                ? `Tersedia (${item.book.stockAvailable} eks)`
                                : "Stok Habis"}
                            </span>
                          </div>

                          <h3 className="mt-1.5 font-heading text-lg font-bold text-[var(--fg)] hover:text-[#92400E]">
                            <Link href={`/books/${item.book.id}`}>
                              {item.book.title}
                            </Link>
                          </h3>

                          <p className="mt-0.5 text-xs text-[var(--fg-muted)]">
                            {primaryAuthor} &bull; {item.book.publisher.name} (
                            {item.book.publishYear}) &bull; {item.book.pages} hlm
                          </p>

                        </div>

                      </div>
                    </div>
                  </article>
                );
                });
              })()}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}