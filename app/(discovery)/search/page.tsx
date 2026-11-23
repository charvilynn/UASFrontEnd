import React from "react";
import Link from "next/link";
import { Search, RotateCcw } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { BookCard } from "@/components/books/BookCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { mapPrismaBookToCard } from "@/features/discovery/queries";

export default async function AdvancedSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const authorQuery = typeof sp.author === "string" ? sp.author.trim() : "";
  const publisherQuery =
    typeof sp.publisher === "string" ? sp.publisher.trim() : "";
  const isbnQuery = typeof sp.isbn === "string" ? sp.isbn.trim() : "";
  const categorySlug =
    typeof sp.category === "string" ? sp.category.trim() : "";
  const minYear = sp.minYear ? Number(sp.minYear) : undefined;
  const maxPages = sp.maxPages ? Number(sp.maxPages) : undefined;

  const sessionUser = await getSessionUser();
  const isAdmin = sessionUser?.role === "admin";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const andConditions: any[] = [];

  if (categorySlug) {
    andConditions.push({
      categories: {
        some: {
          category: { slug: categorySlug },
        },
      },
    });
  }

  if (minYear && !Number.isNaN(minYear)) {
    andConditions.push({
      publishYear: { gte: minYear },
    });
  }

  if (maxPages && !Number.isNaN(maxPages)) {
    andConditions.push({
      pages: { lte: maxPages },
    });
  }

  const [booksRaw, categories, userWishlists] = await Promise.all([
    prisma.book.findMany({
      where: andConditions.length > 0 ? { AND: andConditions } : undefined,
      orderBy: [{ ratingAvg: "desc" }, { title: "asc" }],
      include: {
        publisher: true,
        authors: { include: { author: true } },
        categories: { include: { category: true } },
      },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
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
  const authorLower = authorQuery.toLowerCase();
  const publisherLower = publisherQuery.toLowerCase();
  const isbnLower = isbnQuery.toLowerCase().replace(/[^0-9x]/g, "");

  const filteredBooksRaw = booksRaw.filter((b) => {
    const authorText = b.authors
      .map((a) => a.author.name)
      .join(" ")
      .toLowerCase();
    const categoryText = b.categories
      .map((c) => c.category.name)
      .join(" ")
      .toLowerCase();
    const publisherText = b.publisher.name.toLowerCase();

    if (qTokens.length > 0) {
      const haystack = [
        b.title,
        b.subtitle || "",
        b.description,
        b.isbn,
        authorText,
        categoryText,
        publisherText,
      ]
        .join(" ")
        .toLowerCase();
      if (!qTokens.every((t) => haystack.includes(t))) return false;
    }

    if (authorLower && !authorText.includes(authorLower)) {
      return false;
    }

    if (publisherLower && !publisherText.includes(publisherLower)) {
      return false;
    }

    if (
      isbnQuery &&
      !b.isbn.toLowerCase().includes(isbnQuery.toLowerCase()) &&
      !(isbnLower && b.isbn.toLowerCase().replace(/[^0-9x]/g, "").includes(isbnLower))
    ) {
      return false;
    }

    return true;
  });

  const wishlistSet = new Set(userWishlists.map((w) => w.bookId));
  const books = filteredBooksRaw.map((b) => mapPrismaBookToCard(b, wishlistSet));

  return (
    <div>
      <PageHeader
        title="Pencarian Lanjutan Bibliografi"
        subtitle="Kombinasikan pencarian judul, nama penulis, penerbit, nomor ISBN, tahun terbit minimum, dan batas halaman."
        fallbackHref="/explore"
      />

      <div className="mx-auto max-w-7xl space-y-8 px-4 pb-16 sm:px-6 lg:px-8">
        <form
          action="/search"
          method="get"
          className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-xs"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2">
              <label
                htmlFor="s-q"
                className="block text-xs font-bold text-[var(--fg)]"
              >
                Kata Kunci Umum (Judul / Topik / Sinopsis)
              </label>
              <input
                id="s-q"
                name="q"
                type="text"
                defaultValue={q}
                placeholder="Misal: Stoikisme, Clean Code, Laskar..."
                className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-xs text-[var(--fg)]"
              />
            </div>

            <div>
              <label
                htmlFor="s-author"
                className="block text-xs font-bold text-[var(--fg)]"
              >
                Nama Penulis
              </label>
              <input
                id="s-author"
                name="author"
                type="text"
                defaultValue={authorQuery}
                placeholder="Misal: Pramoedya, Martin..."
                className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-xs text-[var(--fg)]"
              />
            </div>

            <div>
              <label
                htmlFor="s-publisher"
                className="block text-xs font-bold text-[var(--fg)]"
              >
                Nama Penerbit
              </label>
              <input
                id="s-publisher"
                name="publisher"
                type="text"
                defaultValue={publisherQuery}
                placeholder="Misal: Gramedia, Penguin..."
                className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-xs text-[var(--fg)]"
              />
            </div>

            <div>
              <label
                htmlFor="s-isbn"
                className="block text-xs font-bold text-[var(--fg)]"
              >
                Nomor ISBN
              </label>
              <input
                id="s-isbn"
                name="isbn"
                type="text"
                defaultValue={isbnQuery}
                placeholder="Contoh: 978-"
                className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-xs text-[var(--fg)]"
              />
            </div>

            <div>
              <label
                htmlFor="s-category"
                className="block text-xs font-bold text-[var(--fg)]"
              >
                Kategori
              </label>
              <select
                id="s-category"
                name="category"
                defaultValue={categorySlug}
                className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-xs text-[var(--fg)]"
              >
                <option value="">Semua Kategori</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="s-minyear"
                className="block text-xs font-bold text-[var(--fg)]"
              >
                Tahun Terbit Minimum
              </label>
              <input
                id="s-minyear"
                name="minYear"
                type="number"
                defaultValue={minYear || ""}
                placeholder="Misal: 2000"
                className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-xs text-[var(--fg)]"
              />
            </div>

            <div>
              <label
                htmlFor="s-maxpages"
                className="block text-xs font-bold text-[var(--fg)]"
              >
                Maksimal Halaman
              </label>
              <input
                id="s-maxpages"
                name="maxPages"
                type="number"
                defaultValue={maxPages || ""}
                placeholder="Misal: 400"
                className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-xs text-[var(--fg)]"
              />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-4">
            <Link
              href="/search"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--fg-muted)] hover:text-[var(--fg)]"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Bersihkan Semua Kriteria</span>
            </Link>

            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-[#92400E] px-6 py-2.5 text-xs font-semibold text-white hover:bg-[#78350F]"
            >
              <Search className="h-4 w-4" />
              <span>Jalankan Pencarian Database</span>
            </button>
          </div>
        </form>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-xl font-bold text-[var(--fg)]">
              Hasil Pencarian ({books.length} Buku Ditemukan)
            </h2>
          </div>

          {books.length === 0 ? (
            <EmptyState
              title="Buku Tidak Ditemukan"
              description="Tidak ada buku yang memenuhi kombinasi kriteria pencarian Anda. Silakan sesuaikan filter atau jelajahi katalog utama."
              actionLabel="Reset Pencarian"
              actionHref="/search"
              secondaryActionLabel={isAdmin ? "Tambah Buku Baru" : "Jelajahi Katalog"}
              secondaryActionHref={isAdmin ? "/books/new" : "/explore"}
            />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {books.map((book) => (
                <BookCard key={book.id} book={book} isAdmin={isAdmin} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}