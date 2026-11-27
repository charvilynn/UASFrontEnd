import Link from "next/link";
import {
  Sparkles,
  Layers,
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

  return (
    <div className="min-h-screen pb-16">
      <PageHeader
        title="Rekomendasi Bacaan Personal"
        subtitle="Saran buku pilihan yang dikurasi secara dinamis berdasarkan preferensi genre, riwayat peminjaman, dan peringkat tertinggi komunitas."
        fallbackHref="/explore"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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

          </>
        )}
      </div>
    </div>
  );
}