import Link from "next/link";
import {
  Heart,
  ShoppingBag,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  PlusCircle,
  Star,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { GeneratedBookCover } from "@/components/books/GeneratedBookCover";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  addBookToWishlistFormAction,
} from "@/features/borrowing/actions";

interface WishlistPageProps {
  searchParams: Promise<{
    priority?: string;
    error?: string;
  }>;
}

const PRIORITY_META: Record<
  string,
  { label: string; badgeClass: string; order: number }
> = {
  high: {
    label: "Prioritas Tinggi",
    badgeClass:
      "border-rose-300 bg-rose-100 text-rose-900 dark:border-rose-800 dark:bg-rose-950/70 dark:text-rose-200",
    order: 1,
  },
  normal: {
    label: "Prioritas Normal",
    badgeClass:
      "border-amber-300 bg-amber-100 text-amber-900 dark:border-amber-800 dark:bg-amber-950/70 dark:text-amber-200",
    order: 2,
  },
  low: {
    label: "Prioritas Santai",
    badgeClass:
      "border-slate-300 bg-slate-100 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200",
    order: 3,
  },
};

export default async function WishlistPage({ searchParams }: WishlistPageProps) {
  const user = await requireAuth("/wishlist");
  const resolvedParams = await searchParams;
  const activePriority = resolvedParams.priority || "all";
  const errorMsg = resolvedParams.error;

  const allWishlists = await prisma.wishlist.findMany({
    where: { userId: user.id },
    include: {
      book: {
        include: {
          publisher: true,
          authors: {
            include: { author: true },
          },
          categories: {
            include: { category: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const sortedWishlists = [...allWishlists].sort((a, b) => {
    const orderA = PRIORITY_META[a.priority]?.order ?? 2;
    const orderB = PRIORITY_META[b.priority]?.order ?? 2;
    if (orderA !== orderB) return orderA - orderB;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  const filteredWishlists =
    activePriority === "all"
      ? sortedWishlists
      : sortedWishlists.filter((item) => item.priority === activePriority);

  const wishlistBookIds = allWishlists.map((w) => w.bookId);
  const catalogCandidates = await prisma.book.findMany({
    where:
      wishlistBookIds.length > 0
        ? { id: { notIn: wishlistBookIds } }
        : undefined,
    orderBy: { ratingAvg: "desc" },
    take: 25,
    select: {
      id: true,
      title: true,
      publishYear: true,
      stockAvailable: true,
    },
  });

  const highPriorityCount = allWishlists.filter((w) => w.priority === "high").length;
  const readyToBorrowCount = allWishlists.filter(
    (w) => w.book.stockAvailable > 0
  ).length;

  return (
    <div className="min-h-screen pb-16">
      <PageHeader
        title="Daftar Keinginan (Wishlist)"
        subtitle="Simpan buku incaran Anda dengan tingkat prioritas bacaan, tambahkan catatan riset pribadi, dan pindahkan langsung ke Keranjang Pinjam saat stok tersedia."
        fallbackHref="/explore"
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/cart"
              className="inline-flex items-center gap-2 rounded-lg bg-[#92400E] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#78350F]"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Buka Keranjang Pinjam</span>
            </Link>
          </div>
        }
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
          aria-label="Ringkasan Daftar Keinginan"
          className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3"
        >
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider uppercase text-[var(--fg-muted)]">
                Total Buku Incaran
              </span>
              <Heart className="h-4 w-4 text-rose-600" />
            </div>
            <p className="mt-2 font-heading text-2xl font-bold text-[var(--fg)]">
              {allWishlists.length} Judul
            </p>
            <p className="mt-1 text-xs text-[var(--fg-muted)]">
              Tersimpan di akun {user.name}
            </p>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider uppercase text-[var(--fg-muted)]">
                Prioritas Tinggi
              </span>
              <Sparkles className="h-4 w-4 text-amber-600" />
            </div>
            <p className="mt-2 font-heading text-2xl font-bold text-[var(--fg)]">
              {highPriorityCount} Judul
            </p>
            <p className="mt-1 text-xs text-[var(--fg-muted)]">
              Target baca utama semester ini
            </p>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider uppercase text-[var(--fg-muted)]">
                Siap Dipinjam Sekarang
              </span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="mt-2 font-heading text-2xl font-bold text-emerald-700 dark:text-emerald-400">
              {readyToBorrowCount} Judul
            </p>
            <p className="mt-1 text-xs text-[var(--fg-muted)]">
              Stok fisik tersedia di rak perpustakaan
            </p>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)]/70 p-3">
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { key: "all", label: `Semua (${allWishlists.length})` },
                  {
                    key: "high",
                    label: `Prioritas Tinggi (${
                      allWishlists.filter((i) => i.priority === "high").length
                    })`,
                  },
                  {
                    key: "normal",
                    label: `Normal (${
                      allWishlists.filter((i) => i.priority === "normal").length
                    })`,
                  },
                  {
                    key: "low",
                    label: `Santai (${
                      allWishlists.filter((i) => i.priority === "low").length
                    })`,
                  },
                ].map((tab) => {
                  const isActive = activePriority === tab.key;
                  return (
                    <Link
                      key={tab.key}
                      href={
                        tab.key === "all"
                          ? "/wishlist"
                          : `/wishlist?priority=${tab.key}`
                      }
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                        isActive
                          ? "bg-[#92400E] text-white"
                          : "bg-[var(--card)] text-[var(--fg-muted)] hover:text-[var(--fg)]"
                      }`}
                    >
                      {tab.label}
                    </Link>
                  );
                })}
              </div>
              <Link
                href="/recommendations"
                className="text-xs font-semibold text-[#92400E] hover:underline dark:text-amber-400"
              >
                Lihat Rekomendasi Personal &rarr;
              </Link>
            </div>

            {filteredWishlists.length === 0 ? (
              <EmptyState
                title="Daftar Keinginan Masih Kosong"
                description="Anda belum menyimpan buku pada kategori prioritas ini. Jelajahi katalog atau tambahkan buku melalui formulir cepat di samping."
                actionLabel="Jelajahi Katalog Buku"
                actionHref="/explore"
                secondaryActionLabel="Lihat Rekomendasi"
                secondaryActionHref="/recommendations"
              />
            ) : (
              <div className="space-y-4">
                {filteredWishlists.map((item) => {
                  const primaryAuthor =
                    item.book.authors[0]?.author.name || "Penulis Koleksi";
                  const primaryCategory =
                    item.book.categories[0]?.category.name || "Literatur";
                  const accentColor =
                    item.book.categories[0]?.category.accentColor || "#92400E";
                  const priorityInfo =
                    PRIORITY_META[item.priority] || PRIORITY_META.normal;
                  const isAvailable = item.book.stockAvailable > 0;

                  return (
                    <article
                      key={item.id}
                      className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-xs transition-shadow hover:shadow-md sm:p-5"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row">
                        <div className="w-28 shrink-0 sm:w-32">
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
                              <span
                                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${priorityInfo.badgeClass}`}
                              >
                                {priorityInfo.label}
                              </span>

                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                  isAvailable
                                    ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/70 dark:text-emerald-200"
                                    : "bg-red-100 text-red-900 dark:bg-red-950/70 dark:text-red-200"
                                }`}
                              >
                                {isAvailable
                                  ? `Stok Tersedia (${item.book.stockAvailable}/${item.book.stockTotal})`
                                  : "Stok Sedang Dipinjam"}
                              </span>
                            </div>

                            <h2 className="mt-2 font-heading text-lg font-bold text-[var(--fg)] hover:text-[#92400E]">
                              <Link href={`/books/${item.book.id}`}>
                                {item.book.title}
                              </Link>
                            </h2>

                            <p className="mt-0.5 text-xs text-[var(--fg-muted)]">
                              Oleh{" "}
                              <span className="font-medium text-[var(--fg)]">
                                {primaryAuthor}
                              </span>{" "}
                              &bull; {item.book.publisher.name} ({item.book.publishYear})
                              &bull; {item.book.pages} hlm
                            </p>

                            <div className="mt-1.5 flex items-center gap-3 text-xs text-[var(--fg-muted)]">
                              <span className="inline-flex items-center gap-1 font-semibold text-amber-700 dark:text-amber-300">
                                <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                                {item.book.ratingAvg.toFixed(1)} ({item.book.ratingCount}{" "}
                                ulasan)
                              </span>
                              <span>ISBN: {item.book.isbn}</span>
                            </div>

                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-xs">
              <div className="flex items-center gap-2.5">
                <PlusCircle className="h-5 w-5 text-[#92400E]" />
                <h2 className="font-heading text-lg font-bold text-[var(--fg)]">
                  Tambah Buku ke Daftar Keinginan
                </h2>
              </div>
              <p className="mt-1 text-xs text-[var(--fg-muted)]">
                Pilih buku langsung dari katalog perpustakaan untuk disimpan
                beserta prioritas dan catatan bacaan Anda.
              </p>

              <form action={addBookToWishlistFormAction} className="mt-4 space-y-3.5">
                <div>
                  <label
                    htmlFor="quick-wishlist-book"
                    className="block text-xs font-semibold text-[var(--fg)]"
                  >
                    Pilih Buku Katalog
                  </label>
                  <select
                    id="quick-wishlist-book"
                    name="bookId"
                    required
                    className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--fg)]"
                  >
                    <option value="">-- Pilih judul buku --</option>
                    {catalogCandidates.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.title} ({b.publishYear}) - Stok: {b.stockAvailable}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="quick-wishlist-priority"
                    className="block text-xs font-semibold text-[var(--fg)]"
                  >
                    Prioritas Baca
                  </label>
                  <select
                    id="quick-wishlist-priority"
                    name="priority"
                    defaultValue="high"
                    className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--fg)]"
                  >
                    <option value="high">Prioritas Tinggi</option>
                    <option value="normal">Prioritas Normal</option>
                    <option value="low">Prioritas Santai</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="quick-wishlist-note"
                    className="block text-xs font-semibold text-[var(--fg)]"
                  >
                    Catatan Bacaan (Opsional)
                  </label>
                  <textarea
                    id="quick-wishlist-note"
                    name="note"
                    rows={2}
                    placeholder="Tulis alasan atau bab yang ingin dipelajari..."
                    className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--fg)]"
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#92400E] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#78350F]"
                >
                  <Heart className="h-4 w-4" />
                  <span>Simpan ke Daftar Keinginan</span>
                </button>
              </form>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/80 p-5">
              <h3 className="font-heading text-base font-bold text-[var(--fg)]">
                Alur Sirkulasi Cepat
              </h3>
              <ul className="mt-3 space-y-2.5 text-xs text-[var(--fg-muted)]">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#92400E] text-[10px] font-bold text-white">
                    1
                  </span>
                  <span>
                    Tandai buku dengan <strong>Prioritas Tinggi</strong> untuk
                    referensi kuliah atau riset mendesak.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#92400E] text-[10px] font-bold text-white">
                    2
                  </span>
                  <span>
                    Klik <strong>Pindahkan ke Keranjang Pinjam</strong> saat
                    stok tersedia untuk mengatur durasi 7, 14, atau 21 hari.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#92400E] text-[10px] font-bold text-white">
                    3
                  </span>
                  <span>
                    Pantau progres buku yang sudah selesai Anda pinjam dan baca
                    melalui halaman{" "}
                    <Link
                      href="/account/history"
                      className="font-semibold text-[#92400E] underline"
                    >
                      Jurnal & Riwayat Bacaan
                    </Link>
                    .
                  </span>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}