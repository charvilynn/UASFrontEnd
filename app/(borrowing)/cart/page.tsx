import React from "react";
import Link from "next/link";
import {
  ShoppingBag,
  CalendarClock,
  Trash2,
  ArrowRight,
  ShieldCheck,
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
import {
  updateCartDurationAction,
  removeFromCartAction,
} from "@/features/borrowing/actions";

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
  const totalPages = cartItems.reduce((acc, item) => acc + item.book.pages, 0);
  const quotaExceeded = cartItems.length > remainingQuota;
  const canProceedToCheckout =
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

                          <div className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--surface)]/70 p-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--fg)]">
                                <CalendarClock className="h-4 w-4 text-[#92400E]" />
                                Pilih Durasi Peminjaman:
                              </span>
                              <span className="text-xs text-[var(--fg-muted)]">
                                Estimasi kembali:{" "}
                                <strong className="text-[var(--fg)]">
                                  {formatIndonesianDate(estimatedDue)}
                                </strong>
                              </span>
                            </div>

                            <div className="mt-2.5 flex flex-wrap items-center gap-2">
                              {[7, 14, 21].map((days) => {
                                const isSelected = item.durationDays === days;
                                return (
                                  <form
                                    key={days}
                                    action={updateCartDurationAction}
                                  >
                                    <input
                                      type="hidden"
                                      name="cartItemId"
                                      value={item.id}
                                    />
                                    <input
                                      type="hidden"
                                      name="durationDays"
                                      value={days}
                                    />
                                    <button
                                      type="submit"
                                      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                                        isSelected
                                          ? "border-[#92400E] bg-[#92400E] text-white"
                                          : "border-[var(--border)] bg-[var(--card)] text-[var(--fg)] hover:border-[#92400E]"
                                      }`}
                                    >
                                      {days} Hari{" "}
                                      {days === 14 ? "(Standar)" : ""}
                                    </button>
                                  </form>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between border-t border-[var(--border)] pt-3">
                          <Link
                            href={`/books/${item.book.id}`}
                            className="text-xs font-semibold text-[#92400E] hover:underline dark:text-amber-400"
                          >
                            Lihat Detail Buku
                          </Link>

                          <form action={removeFromCartAction}>
                            <input
                              type="hidden"
                              name="cartItemId"
                              value={item.id}
                            />
                            <button
                              type="submit"
                              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50/70 px-3 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Keluarkan</span>
                            </button>
                          </form>
                        </div>
                      </div>
                    </div>
                  </article>
                );
                });
              })()}
            </div>

            <aside className="space-y-5">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-xs">
                <h2 className="font-heading text-lg font-bold text-[var(--fg)]">
                  Ringkasan Keranjang Pinjam
                </h2>
                <p className="mt-1 text-xs text-[var(--fg-muted)]">
                  Anggota: <strong>{user.name}</strong> ({user.memberCode})
                </p>

                <dl className="mt-4 space-y-2.5 border-y border-[var(--border)] py-4 text-xs">
                  <div className="flex items-center justify-between">
                    <dt className="text-[var(--fg-muted)]">Total Buku di Keranjang</dt>
                    <dd className="font-semibold text-[var(--fg)]">
                      {cartItems.length} Judul
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-[var(--fg-muted)]">Stok Siap Dipinjam</dt>
                    <dd className="font-semibold text-emerald-700 dark:text-emerald-400">
                      {availableItemsInCart.length} Judul
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-[var(--fg-muted)]">Total Halaman Bacaan</dt>
                    <dd className="font-semibold text-[var(--fg)]">
                      {totalPages.toLocaleString("id-ID")} Halaman
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-[var(--fg-muted)]">Biaya Peminjaman</dt>
                    <dd className="font-semibold text-emerald-700 dark:text-emerald-400">
                      Gratis (Bebas Biaya)
                    </dd>
                  </div>
                </dl>

                {canProceedToCheckout ? (
                  <Link
                    href="/borrow/checkout"
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#92400E] px-4 py-3 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-[#78350F]"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    <span>Lanjut ke Checkout Peminjaman</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-950 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-200">
                    Kuota pinjam aktif Anda telah penuh atau stok buku di
                    keranjang sedang kosong. Silakan kembalikan buku terlebih
                    dahulu di halaman{" "}
                    <Link
                      href="/borrow/returns"
                      className="font-semibold underline"
                    >
                      Pengembalian Mandiri
                    </Link>
                    .
                  </div>
                )}

                <div className="mt-4 flex items-start gap-2 text-[11px] text-[var(--fg-muted)]">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#92400E]" />
                  <span>
                    Setiap peminjaman dapat diperpanjang hingga 2 kali (+7 hari
                    per perpanjangan) melalui menu Pengembalian & Perpanjangan.
                  </span>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}