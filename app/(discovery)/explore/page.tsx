import React from "react";
import Link from "next/link";
import { PlusCircle, Search, X } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { BookCard } from "@/components/books/BookCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { mapPrismaBookToCard } from "@/features/discovery/queries";
import { ExploreFilterDrawerClient } from "./ExploreFilterDrawerClient";

interface ExploreSearchParams {
  q?: string;
  category?: string;
  lang?: string;
  available?: string;
  sort?: string;
  page?: string;
}

const PAGE_SIZE = 16;

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<ExploreSearchParams>;
}) {
  const sp = await searchParams;
  const q = (sp.q || "").trim();
  const categorySlug = (sp.category || "").trim();
  const language = (sp.lang || "").trim();
  const onlyAvailable = sp.available === "1";
  const sort = sp.sort || "featured";
  const currentPage = Math.max(1, Number(sp.page || 1) || 1);

  const sessionUser = await getSessionUser();
  const isAdmin = sessionUser?.role === "admin";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const whereClause: any = {};

  if (categorySlug) {
    whereClause.categories = {
      some: {
        category: {
          slug: categorySlug,
        },
      },
    };
  }

  if (language) {
    whereClause.language = language;
  }

  if (onlyAvailable) {
    whereClause.stockAvailable = { gt: 0 };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let orderByClause: any = [{ isFeatured: "desc" }, { ratingAvg: "desc" }];
  if (sort === "newest") {
    orderByClause = [{ publishYear: "desc" }, { id: "desc" }];
  } else if (sort === "title") {
    orderByClause = [{ title: "asc" }];
  } else if (sort === "rating") {
    orderByClause = [{ ratingAvg: "desc" }, { ratingCount: "desc" }];
  }

  const [booksRaw, categories, userWishlists] = await Promise.all([
    prisma.book.findMany({
      where: whereClause,
      orderBy: orderByClause,
      include: {
        authors: { include: { author: true } },
        categories: { include: { category: true } },
      },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    }),
    sessionUser
      ? prisma.wishlist.findMany({
          where: { userId: sessionUser.id },
          select: { bookId: true },
        })
      : Promise.resolve([]),
  ]);

  const qTokens = q
    ? q
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean)
    : [];

  const filteredBooksRaw =
    qTokens.length === 0
      ? booksRaw
      : booksRaw.filter((b) => {
          const authorText = b.authors.map((a) => a.author.name).join(" ");
          const categoryText = b.categories
            .map((c) => c.category.name)
            .join(" ");
          const haystack = [
            b.title,
            b.subtitle || "",
            b.description,
            b.isbn,
            authorText,
            categoryText,
          ]
            .join(" ")
            .toLowerCase();
          return qTokens.every((t) => haystack.includes(t));
        });

  const wishlistSet = new Set(userWishlists.map((w) => w.bookId));
  const allMatchedBooks = filteredBooksRaw.map((b) =>
    mapPrismaBookToCard(b, wishlistSet)
  );

  const totalCount = allMatchedBooks.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedBooks = allMatchedBooks.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  const activeFilterCount =
    (categorySlug ? 1 : 0) + (language ? 1 : 0) + (onlyAvailable ? 1 : 0);

  function buildPageHref(pageNum: number) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (categorySlug) params.set("category", categorySlug);
    if (language) params.set("lang", language);
    if (onlyAvailable) params.set("available", "1");
    if (sort && sort !== "featured") params.set("sort", sort);
    if (pageNum > 1) params.set("page", String(pageNum));
    const qs = params.toString();
    return qs ? `/explore?${qs}` : "/explore";
  }

  return (
    <div className="pb-20">
      <PageHeader
        title="Jelajah Katalog"
        subtitle="Telusuri delapan puluh koleksi literatur akademik dan sastra."
        fallbackHref="/"
        actions={
          isAdmin ? (
            <Link
              href="/books/new"
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2 text-xs font-semibold text-[var(--primary-fg)] hover:bg-[var(--primary-hover)]"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Tambah Buku</span>
            </Link>
          ) : undefined
        }
      />

      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/70 p-4 sm:flex-row sm:items-center">
          <form
            action="/explore"
            method="get"
            className="flex flex-1 flex-wrap items-center gap-2.5"
          >
            {categorySlug && (
              <input type="hidden" name="category" value={categorySlug} />
            )}
            {language && <input type="hidden" name="lang" value={language} />}
            {onlyAvailable && (
              <input type="hidden" name="available" value="1" />
            )}

            <div className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--fg-subtle)]" />
              <input
                type="text"
                name="q"
                defaultValue={q}
                aria-label="Cari judul, penulis, atau ISBN"
                placeholder="Cari judul, penulis, atau ISBN..."
                className="h-10 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg)] pl-10 pr-4 text-xs text-[var(--fg)] placeholder:text-[var(--fg-subtle)] focus:border-[var(--primary)] focus:outline-none"
              />
            </div>

            <select
              name="sort"
              defaultValue={sort}
              aria-label="Urutkan katalog"
              className="h-10 rounded-xl border border-[var(--border-strong)] bg-[var(--bg)] px-3 text-xs font-medium text-[var(--fg)] focus:border-[var(--primary)] focus:outline-none"
            >
              <option value="featured">Urutkan: Sorotan</option>
              <option value="rating">Rating Tertinggi</option>
              <option value="newest">Terbaru</option>
              <option value="title">Judul (A - Z)</option>
            </select>

            <button
              type="submit"
              className="h-10 rounded-xl bg-[var(--primary)] px-4 text-xs font-semibold text-[var(--primary-fg)] transition-colors hover:bg-[var(--primary-hover)]"
            >
              Terapkan
            </button>
          </form>

          <div className="flex items-center gap-2">
            <ExploreFilterDrawerClient
              q={q}
              categorySlug={categorySlug}
              language={language}
              onlyAvailable={onlyAvailable}
              sort={sort}
              categories={categories}
              activeFilterCount={activeFilterCount}
            />
          </div>
        </div>

        {(q || categorySlug || language || onlyAvailable) && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--fg-muted)]">
            <div className="flex flex-wrap items-center gap-2">
              <span>Menampilkan {totalCount} buku</span>
              {categorySlug && (
                <span className="rounded-full bg-[var(--muted)] px-3 py-1 font-medium text-[var(--fg)]">
                  Kategori: {categorySlug}
                </span>
              )}
              {language && (
                <span className="rounded-full bg-[var(--muted)] px-3 py-1 font-medium text-[var(--fg)]">
                  Bahasa: {language}
                </span>
              )}
              {onlyAvailable && (
                <span className="rounded-full bg-[var(--muted)] px-3 py-1 font-medium text-[var(--fg)]">
                  Stok Tersedia
                </span>
              )}
            </div>
            <Link
              href="/explore"
              className="inline-flex items-center gap-1 font-semibold text-[var(--primary)] hover:underline"
            >
              <X className="h-3.5 w-3.5" />
              <span>Hapus Filter</span>
            </Link>
          </div>
        )}

        {paginatedBooks.length === 0 ? (
          <EmptyState
            title="Buku Tidak Ditemukan"
            description="Tidak ada koleksi yang cocok dengan saringan Anda saat ini."
            actionLabel="Tampilkan Semua Buku"
            actionHref="/explore"
          />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
              {paginatedBooks.map((book) => (
                <BookCard key={book.id} book={book} isAdmin={isAdmin} />
              ))}
            </div>

            {totalPages > 1 && (
              <nav
                aria-label="Paginasi Katalog"
                className="mt-12 flex items-center justify-center gap-2"
              >
                {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(
                  (pageNum) => {
                    const isCurrent = pageNum === safePage;
                    return (
                      <Link
                        key={pageNum}
                        href={buildPageHref(pageNum)}
                        aria-current={isCurrent ? "page" : undefined}
                        className={`inline-flex h-9 min-w-9 items-center justify-center rounded-xl px-3 text-xs font-semibold transition-colors ${
                          isCurrent
                            ? "bg-[var(--primary)] text-[var(--primary-fg)]"
                            : "border border-[var(--border)] bg-[var(--card)] text-[var(--fg)] hover:border-[var(--primary)]"
                        }`}
                      >
                        {pageNum}
                      </Link>
                    );
                  }
                )}
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  );
}