import React from "react";
import Link from "next/link";
import {
  Wand2,
  Sparkles,
  TrendingUp,
  Layers,
  Heart,
  SlidersHorizontal,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { BookCard, type BookCardData } from "@/components/books/BookCard";
import { EmptyState } from "@/components/ui/EmptyState";

interface RecommendationsPageProps {
  searchParams: Promise<{
    category?: string;
  }>;
}

export default async function RecommendationsPage({
  searchParams,
}: RecommendationsPageProps) {
  const [user, resolvedParams] = await Promise.all([
    getSessionUser(),
    searchParams,
  ]);

  const selectedCategorySlug = resolvedParams.category || "all";

  const [categories, allBooks, userPrefs, userWishlists, userLoans] =
    await Promise.all([
      prisma.category.findMany({
        orderBy: { name: "asc" },
      }),
      prisma.book.findMany({
        include: {
          authors: { include: { author: true } },
          categories: { include: { category: true } },
          _count: {
            select: { loans: true, reviews: true },
          },
        },
        orderBy: [{ ratingAvg: "desc" }, { isFeatured: "desc" }],
      }),
      user
        ? prisma.userPreference.findMany({
            where: { userId: user.id },
            include: { category: true },
          })
        : Promise.resolve([]),
      user
        ? prisma.wishlist.findMany({
            where: { userId: user.id },
            select: { bookId: true },
          })
        : Promise.resolve([]),
      user
        ? prisma.loan.findMany({
            where: { userId: user.id },
            include: {
              book: {
                include: {
                  categories: { include: { category: true } },
                },
              },
            },
          })
        : Promise.resolve([]),
    ]);

  const wishlistSet = new Set(userWishlists.map((w) => w.bookId));
  const preferredCategoryIds = new Set(userPrefs.map((p) => p.categoryId));
  const borrowedBookIds = new Set(userLoans.map((l) => l.bookId));
  const borrowedCategoryNames = new Set<string>();
  for (const l of userLoans) {
    for (const c of l.book.categories) {
      borrowedCategoryNames.add(c.category.name);
    }
  }

  const scoredBooks = allBooks
    .filter((book) => {
      if (selectedCategorySlug === "all") return true;
      return book.categories.some(
        (bc) => bc.category.slug === selectedCategorySlug
      );
    })
    .map((book) => {
      const primaryAuthor = book.authors[0]?.author;
      const primaryCategory = book.categories[0]?.category;
      const categoryName = primaryCategory?.name || "Literatur Akademik";

      let score = book.ratingAvg * 10 + book._count.loans * 3;
      let reason = `Rating tertinggi bulan ini (${book.ratingAvg.toFixed(1)} ★)`;

      const matchesPref = book.categories.some((bc) =>
        preferredCategoryIds.has(bc.categoryId)
      );
      const matchesLoanHistory = book.categories.some((bc) =>
        borrowedCategoryNames.has(bc.category.name)
      );

      if (matchesPref) {
        score += 35;
        reason = `Sesuai minat Anda pada genre ${categoryName}`;
      } else if (matchesLoanHistory) {
        score += 22;
        reason = `Serupa dengan riwayat bacaan genre ${categoryName}`;
      } else if (book.isFeatured) {
        score += 15;
        reason = `Koleksi unggulan pilihan kurator (${categoryName})`;
      } else if (book._count.loans >= 2) {
        score += 10;
        reason = `Populer di kalangan mahasiswa (${book._count.loans}x dipinjam)`;
      }

      if (borrowedBookIds.has(book.id)) {
        score -= 12;
      }

      const cardData: BookCardData = {
        id: book.id,
        title: book.title,
        subtitle: book.subtitle,
        publishYear: book.publishYear,
        pages: book.pages,
        isbn: book.isbn,
        coverPath: book.coverPath,
        stockAvailable: book.stockAvailable,
        stockTotal: book.stockTotal,
        ratingAvg: book.ratingAvg,
        ratingCount: book.ratingCount,
        authorName: primaryAuthor?.name || "Penulis Koleksi",
        authorSlug: primaryAuthor?.slug,
        categoryName,
        categorySlug: primaryCategory?.slug,
        accentColor: primaryCategory?.accentColor || "#92400E",
        inWishlist: wishlistSet.has(book.id),
      };

      return {
        book: cardData,
        score,
        reason,
        matchesPref,
      };
    })
    .sort((a, b) => b.score - a.score);

  const topPicks = scoredBooks.slice(0, 8);
  const moreDiscovery = scoredBooks.slice(8, 16);

  return (
    <div className="min-h-screen pb-16">
      <PageHeader
        title="Rekomendasi Bacaan Personal"
        subtitle="Saran buku pilihan yang dikurasi secara dinamis berdasarkan preferensi genre, riwayat peminjaman, dan peringkat tertinggi komunitas."
        fallbackHref="/explore"
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            {user ? (
              <Link
                href="/onboarding"
                className="inline-flex items-center gap-2 rounded-lg bg-[#92400E] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#78350F]"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>Sesuaikan Minat Baca</span>
              </Link>
            ) : (
              <Link
                href="/login?next=/recommendations"
                className="inline-flex items-center gap-2 rounded-lg bg-[#92400E] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#78350F]"
              >
                <Sparkles className="h-4 w-4" />
                <span>Masuk untuk Personalisasi</span>
              </Link>
            )}
            <Link
              href="/wishlist"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-xs font-semibold text-[var(--fg)] transition-colors hover:border-[#92400E]"
            >
              <Heart className="h-4 w-4 text-rose-600" />
              <span>Daftar Keinginan</span>
            </Link>
          </div>
        }
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <section
          aria-label="Status Personalisasi"
          className="mb-8 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-xs"
        >
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div className="flex items-start gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#92400E]/15 text-[#92400E] dark:text-amber-400">
                <Wand2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-heading text-lg font-bold text-[var(--fg)]">
                  {user
                    ? `Mesin Rekomendasi Aktif untuk ${user.name}`
                    : "Mode Rekomendasi Kurator & Tren Kampus"}
                </h2>
                <p className="mt-0.5 text-xs text-[var(--fg-muted)]">
                  {user && userPrefs.length > 0
                    ? `Menampilkan kecocokan tertinggi berdasarkan ${userPrefs.length} genre favorit dan ${userLoans.length} riwayat sirkulasi Anda.`
                    : "Menampilkan buku dengan rating tertinggi dan sirkulasi terpopuler. Masuk akun dan atur orientasi minat untuk rekomendasi spesifik."}
                </p>
              </div>
            </div>

            {userPrefs.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                {userPrefs.map((pref) => (
                  <Link
                    key={pref.id}
                    href={`/recommendations?category=${encodeURIComponent(
                      pref.category.slug
                    )}`}
                    className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-950 transition-colors hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-200"
                  >
                    <Sparkles className="h-3 w-3 text-amber-600" />
                    <span>{pref.category.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        <div className="mb-6 flex flex-wrap items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)]/70 p-3">
          <span className="inline-flex items-center gap-1.5 px-2 text-xs font-semibold text-[var(--fg-muted)]">
            <Layers className="h-4 w-4 text-[#92400E]" />
            Filter Genre:
          </span>
          <Link
            href="/recommendations"
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              selectedCategorySlug === "all"
                ? "bg-[#92400E] text-white"
                : "bg-[var(--card)] text-[var(--fg-muted)] hover:text-[var(--fg)]"
            }`}
          >
            Semua Rekomendasi
          </Link>
          {categories.map((cat) => {
            const isSelected = selectedCategorySlug === cat.slug;
            return (
              <Link
                key={cat.id}
                href={`/recommendations?category=${encodeURIComponent(
                  cat.slug
                )}`}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  isSelected
                    ? "bg-[#92400E] text-white"
                    : "bg-[var(--card)] text-[var(--fg-muted)] hover:text-[var(--fg)]"
                }`}
              >
                {cat.name}
              </Link>
            );
          })}
        </div>

        {topPicks.length === 0 ? (
          <EmptyState
            title="Tidak Ada Buku pada Genre Ini"
            description="Belum ada rekomendasi buku untuk filter kategori yang dipilih. Silakan tampilkan seluruh genre."
            actionLabel="Tampilkan Semua Genre"
            actionHref="/recommendations"
            secondaryActionLabel="Eksplorasi Katalog"
            secondaryActionHref="/explore"
          />
        ) : (
          <>
            <section aria-labelledby="top-picks-heading" className="mb-12">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[#92400E]" />
                  <h2
                    id="top-picks-heading"
                    className="font-heading text-xl font-bold text-[var(--fg)]"
                  >
                    Pilihan Utama untuk Anda ({topPicks.length} Buku)
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {topPicks.map((item) => (
                  <div key={item.book.id} className="flex flex-col">
                    <div
                      className={`mb-2 inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-semibold ${
                        item.matchesPref
                          ? "border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-800 dark:bg-amber-950/70 dark:text-amber-200"
                          : "border-[var(--border)] bg-[var(--surface)] text-[var(--fg-muted)]"
                      }`}
                    >
                      <Sparkles className="h-3 w-3 shrink-0 text-[#92400E]" />
                      <span className="truncate">{item.reason}</span>
                    </div>
                    <div className="flex-1">
                      <BookCard
                        book={item.book}
                        isAdmin={user?.role === "admin"}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {moreDiscovery.length > 0 && (
              <section aria-labelledby="more-discovery-heading">
                <div className="mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-[#92400E]" />
                  <h2
                    id="more-discovery-heading"
                    className="font-heading text-xl font-bold text-[var(--fg)]"
                  >
                    Sorotan Lintas Disiplin & Rating Tinggi
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {moreDiscovery.map((item) => (
                    <div key={item.book.id} className="flex flex-col">
                      <div className="mb-2 inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 text-[11px] font-medium text-[var(--fg-muted)]">
                        <TrendingUp className="h-3 w-3 shrink-0 text-[#92400E]" />
                        <span className="truncate">{item.reason}</span>
                      </div>
                      <div className="flex-1">
                        <BookCard
                          book={item.book}
                          isAdmin={user?.role === "admin"}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}