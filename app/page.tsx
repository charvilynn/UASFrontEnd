import React from "react";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { BookCard } from "@/components/books/BookCard";
import { GeneratedBookCover } from "@/components/books/GeneratedBookCover";
import { mapPrismaBookToCard } from "@/features/discovery/queries";

export default async function HomePage() {
  const sessionUser = await getSessionUser();
  const isAdmin = sessionUser?.role === "admin";

  const [featuredBooksRaw, recentBooksRaw, categories, userWishlists] =
    await Promise.all([
      prisma.book.findMany({
        where: { isFeatured: true },
        orderBy: [{ ratingAvg: "desc" }, { id: "asc" }],
        take: 6,
        include: {
          authors: { include: { author: true } },
          categories: { include: { category: true } },
        },
      }),
      prisma.book.findMany({
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: 6,
        include: {
          authors: { include: { author: true } },
          categories: { include: { category: true } },
        },
      }),
      prisma.category.findMany({
        orderBy: { name: "asc" },
        take: 8,
        include: {
          _count: { select: { books: true } },
        },
      }),
      sessionUser
        ? prisma.wishlist.findMany({
            where: { userId: sessionUser.id },
            select: { bookId: true },
          })
        : Promise.resolve([]),
    ]);

  const wishlistSet = new Set(userWishlists.map((w) => w.bookId));
  const featuredBooks = featuredBooksRaw.map((b) =>
    mapPrismaBookToCard(b, wishlistSet)
  );
  const recentBooks = recentBooksRaw.map((b) =>
    mapPrismaBookToCard(b, wishlistSet)
  );
  const heroCovers = featuredBooks.slice(0, 3);

  return (
    <div className="space-y-16 pb-20">
      <section className="border-b border-[var(--border)] bg-[var(--surface)]/60 py-12 sm:py-16">
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
          <div className="lg:col-span-7">
            <h1 className="font-serif text-3xl font-semibold leading-tight tracking-tight text-[var(--fg)] sm:text-5xl">
              Ruang Baca Literatur Akademik dan Sastra
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-[var(--fg-muted)]">
              Telusuri delapan puluh buku pilihan lintas disiplin ilmu dalam ruang baca yang tenang, rapi, dan fokus pada karya.
            </p>

            <form
              action="/explore"
              method="get"
              className="mt-8 flex max-w-xl flex-col gap-2.5 sm:flex-row"
            >
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--fg-subtle)]" />
                <input
                  type="text"
                  name="q"
                  aria-label="Cari judul buku, penulis, atau ISBN"
                  placeholder="Cari judul buku, penulis, atau ISBN..."
                  className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg)] py-3 pl-11 pr-4 text-sm text-[var(--fg)] placeholder:text-[var(--fg-subtle)] focus:border-[var(--primary)] focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-[var(--primary-fg)] transition-colors hover:bg-[var(--primary-hover)]"
              >
                <span>Cari Buku</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-5">
            <div className="mx-auto grid max-w-[330px] grid-cols-3 items-end gap-3.5 lg:mr-0 lg:ml-auto">
              {heroCovers.map((book, idx) => (
                <Link
                  key={book.id}
                  href={`/books/${book.id}`}
                  data-cursor="cover"
                  className={`group block overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm transition-transform duration-300 hover:-translate-y-1.5 ${
                    idx === 1 ? "-translate-y-2.5 shadow-md" : ""
                  }`}
                >
                  <div className="aspect-[2/3] w-full">
                    <GeneratedBookCover
                      title={book.title}
                      author={book.authorName}
                      category={book.categoryName}
                      accentColor={book.accentColor}
                      coverPath={book.coverPath}
                      publishYear={book.publishYear}
                      className="h-full w-full"
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-[var(--fg)] sm:text-3xl">
              Pilihan Minggu Ini
            </h2>
            <p className="mt-1 text-sm text-[var(--fg-muted)]">
              Sorotan koleksi sastra, sains, dan pemikiran pilihan kurator.
            </p>
          </div>
          <Link
            href="/explore"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--primary)] hover:underline"
          >
            <span>Lihat Semua</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {featuredBooks.slice(0, 6).map((book) => (
            <BookCard key={book.id} book={book} isAdmin={isAdmin} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/80 p-7 sm:p-9">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="font-serif text-xl font-semibold text-[var(--fg)] sm:text-2xl">
                Telusuri Kategori Literatur
              </h2>
              <p className="mt-1 text-sm text-[var(--fg-muted)]">
                Pilih ranah keilmuan untuk melihat daftar bacaan terkait.
              </p>
            </div>
            <Link
              href="/categories"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--primary)] hover:underline"
            >
              <span>Semua Kategori</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap gap-2.5">
            {categories.slice(0, 8).map((cat) => (
              <Link
                key={cat.id}
                href={`/explore?category=${encodeURIComponent(cat.slug)}`}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--bg)] px-4 py-2 text-xs font-medium text-[var(--fg)] transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: cat.accentColor }}
                />
                <span>{cat.name}</span>
                <span className="text-[var(--fg-subtle)]">
                  ({cat._count.books})
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-[var(--fg)] sm:text-3xl">
              Baru Ditambahkan
            </h2>
            <p className="mt-1 text-sm text-[var(--fg-muted)]">
              Judul terbaru yang masuk ke rak koleksi perpustakaan.
            </p>
          </div>
          <Link
            href="/explore?sort=newest"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--primary)] hover:underline"
          >
            <span>Telusuri Katalog</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {recentBooks.map((book) => (
            <BookCard key={book.id} book={book} isAdmin={isAdmin} />
          ))}
        </div>
      </section>

      {!sessionUser && (
        <section className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-serif text-xl font-semibold text-[var(--fg)]">
                Pinjam Buku dan Susun Rak Pribadi
              </h2>
              <p className="mt-1 text-sm text-[var(--fg-muted)]">
                Masuk atau daftar akun anggota untuk meminjam buku dan menyimpan daftar bacaan.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <Link
                href="/login"
                className="rounded-xl border border-[var(--border-strong)] bg-[var(--bg)] px-5 py-2.5 text-xs font-semibold text-[var(--fg)] transition-colors hover:border-[var(--primary)]"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="rounded-xl bg-[var(--primary)] px-5 py-2.5 text-xs font-semibold text-[var(--primary-fg)] transition-colors hover:bg-[var(--primary-hover)]"
              >
                Daftar Anggota
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}