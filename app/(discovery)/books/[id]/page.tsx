import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Star,
  FileEdit,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { BackButton } from "@/components/layout/BackButton";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { GeneratedBookCover } from "@/components/books/GeneratedBookCover";
import { BookCard } from "@/components/books/BookCard";
import { BookDetailActions } from "@/features/discovery/BookDetailActions";
import { BookDetailTabs } from "@/features/discovery/BookDetailTabs";
import { addReviewOnDetailAction } from "@/features/discovery/actions";
import { mapPrismaBookToCard } from "@/features/discovery/queries";

export default async function BookDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const numericId = Number(id);

  let book = !Number.isNaN(numericId)
    ? await prisma.book.findUnique({
        where: { id: numericId },
        include: {
          publisher: true,
          authors: { include: { author: true } },
          categories: { include: { category: true } },
          loans: {
            where: { status: { in: ["borrowed", "overdue"] } },
            include: { user: true },
            orderBy: { borrowedAt: "desc" },
            take: 1,
          },
          reviews: {
            orderBy: { createdAt: "desc" },
            include: { user: true },
          },
        },
      })
    : null;

  if (!book && id === "1") {
    book = await prisma.book.findFirst({
      orderBy: { id: "asc" },
      include: {
        publisher: true,
        authors: { include: { author: true } },
        categories: { include: { category: true } },
        loans: {
          where: { status: { in: ["borrowed", "overdue"] } },
          include: { user: true },
          orderBy: { borrowedAt: "desc" },
          take: 1,
        },
        reviews: {
          orderBy: { createdAt: "desc" },
          include: { user: true },
        },
      },
    });
  }

  if (!book) {
    notFound();
  }

  const sessionUser = await getSessionUser();
  const isAdmin = sessionUser?.role === "admin";
  const activeLoan = book.loans[0] ?? null;
  const isAvailable = book.stockAvailable > 0;

  const wishlistEntry = sessionUser
    ? await prisma.wishlist.findUnique({
        where: {
          userId_bookId: {
            userId: sessionUser.id,
            bookId: book.id,
          },
        },
      })
    : null;

  const primaryAuthor = book.authors[0]?.author;
  const primaryCategory = book.categories[0]?.category;

  const relatedRaw = await prisma.book.findMany({
    where: {
      id: { not: book.id },
      ...(primaryCategory
        ? {
            categories: {
              some: { categoryId: primaryCategory.id },
            },
          }
        : {}),
    },
    take: 4,
    include: {
      authors: { include: { author: true } },
      categories: { include: { category: true } },
    },
  });

  const relatedBooks = relatedRaw.map((rb) => mapPrismaBookToCard(rb));
  const createdBanner = sp.created === "1";
  const updatedBanner = sp.updated === "1";

  const metadataSection = (
    <div className="grid grid-cols-2 gap-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/50 p-6 sm:grid-cols-3 lg:grid-cols-6">
      <div>
        <p className="text-xs text-[var(--fg-muted)]">ISBN</p>
        <p className="mt-1 font-mono text-xs font-medium text-[var(--fg)]">
          {book.isbn}
        </p>
      </div>
      <div>
        <p className="text-xs text-[var(--fg-muted)]">Penerbit</p>
        <p className="mt-1 text-xs font-medium text-[var(--fg)]">
          {book.publisher.name}
        </p>
      </div>
      <div>
        <p className="text-xs text-[var(--fg-muted)]">Tahun Terbit</p>
        <p className="mt-1 text-xs font-medium text-[var(--fg)]">
          {book.publishYear}
        </p>
      </div>
      <div>
        <p className="text-xs text-[var(--fg-muted)]">Halaman</p>
        <p className="mt-1 text-xs font-medium text-[var(--fg)]">
          {book.pages} hlm
        </p>
      </div>
      <div>
        <p className="text-xs text-[var(--fg-muted)]">Bahasa</p>
        <p className="mt-1 text-xs font-medium text-[var(--fg)]">
          {book.language}
        </p>
      </div>
      <div>
        <p className="text-xs text-[var(--fg-muted)]">Status Ketersediaan</p>
        <p
          className={`mt-1 text-xs font-semibold ${
            isAvailable
              ? "text-emerald-700 dark:text-emerald-400"
              : "text-rose-700 dark:text-rose-400"
          }`}
        >
          {isAvailable ? "Tersedia" : "Tidak Tersedia (Sedang Dipinjam)"}
        </p>
      </div>
    </div>
  );

  const reviewsSection = (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-heading text-lg font-semibold text-[var(--fg)]">
            Catatan Pembaca
          </h3>
          <Link
            href="/reviews"
            className="text-xs font-medium text-[var(--primary)] hover:underline"
          >
            Semua ulasan komunitas &rarr;
          </Link>
        </div>

        {book.reviews.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)]/40 p-6 text-xs text-[var(--fg-muted)]">
            Belum ada ulasan untuk buku ini. Bagikan catatan bacaan Anda di samping.
          </div>
        ) : (
          <div className="space-y-4">
            {book.reviews.map((rev) => (
              <article
                key={rev.id}
                className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[var(--fg)]">
                    {rev.user.name}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-[var(--primary)]">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    {rev.rating}/5
                  </span>
                </div>
                <h4 className="font-heading mt-2 text-sm font-semibold text-[var(--fg)]">
                  {rev.title}
                </h4>
                <p className="mt-1 text-xs leading-relaxed text-[var(--fg-muted)]">
                  {rev.comment}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="lg:col-span-5">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
          <h3 className="font-heading text-base font-semibold text-[var(--fg)]">
            Tulis Ulasan
          </h3>
          <p className="mt-1 text-xs text-[var(--fg-muted)]">
            Bagikan kesan bacaan Anda untuk pembaca lain.
          </p>

          <form
            action={addReviewOnDetailAction.bind(null, book.id)}
            className="mt-4 space-y-4"
          >
            <div>
              <label
                htmlFor="rev-rating"
                className="block text-xs font-medium text-[var(--fg)]"
              >
                Rating
              </label>
              <select
                id="rev-rating"
                name="rating"
                defaultValue="5"
                className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--fg)]"
              >
                <option value="5">5 Bintang (Sangat Direkomendasikan)</option>
                <option value="4">4 Bintang (Bagus &amp; Bermanfaat)</option>
                <option value="3">3 Bintang (Cukup Baik)</option>
                <option value="2">2 Bintang (Kurang Sesuai)</option>
                <option value="1">1 Bintang</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="rev-title"
                className="block text-xs font-medium text-[var(--fg)]"
              >
                Judul Ringkas
              </label>
              <input
                id="rev-title"
                name="title"
                type="text"
                required
                placeholder="Contoh: Referensi terbaik untuk memahami..."
                className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--fg)]"
              />
            </div>

            <div>
              <label
                htmlFor="rev-comment"
                className="block text-xs font-medium text-[var(--fg)]"
              >
                Komentar
              </label>
              <textarea
                id="rev-comment"
                name="comment"
                rows={3}
                required
                placeholder="Tuliskan poin menarik dari buku ini..."
                className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-xs text-[var(--fg)]"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-[var(--primary)] py-2.5 text-xs font-medium text-[var(--primary-fg)] transition-colors hover:bg-[var(--primary-hover)]"
            >
              Kirim Ulasan
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-[1280px] space-y-16 px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <BackButton fallbackHref="/explore" label="Kembali ke Jelajah" />
          <Breadcrumbs currentLabel={book.title} />
        </div>

        {isAdmin && (
          <Link
            href={`/books/${book.id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3.5 py-2 text-xs font-medium text-[var(--fg)] transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
          >
            <FileEdit className="h-3.5 w-3.5" />
            <span>Edit Buku</span>
          </Link>
        )}
      </div>

      {createdBanner && (
        <div
          data-testid="book-created-banner"
          className="flex flex-col justify-between gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-[var(--fg)] sm:flex-row sm:items-center"
        >
          <p className="font-medium">
            Buku baru berhasil ditambahkan ke katalog perpustakaan.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {isAdmin && (
              <Link
                href="/books/new"
                className="inline-flex items-center rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-xs font-medium text-[var(--fg)] hover:border-[var(--fg-muted)]"
              >
                Tambah Buku Lagi
              </Link>
            )}
            <Link
              href="/explore"
              className="inline-flex items-center rounded-lg bg-[var(--primary)] px-3 py-1.5 text-xs font-medium text-[var(--primary-fg)]"
            >
              Lihat di Jelajah
            </Link>
          </div>
        </div>
      )}

      {updatedBanner && (
        <div
          data-testid="book-updated-banner"
          className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-xs font-medium text-[var(--fg)]"
        >
          Perubahan metadata buku berhasil disimpan.
        </div>
      )}

      <section className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-4">
          <div
            data-cursor="cover"
            className="mx-auto max-w-[280px] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm"
          >
            <GeneratedBookCover
              title={book.title}
              author={primaryAuthor?.name}
              category={primaryCategory?.name}
              accentColor={primaryCategory?.accentColor}
              coverPath={book.coverPath}
              publishYear={book.publishYear}
            />
          </div>
        </div>

        <div className="space-y-5 lg:col-span-8">
          <div className="flex flex-wrap items-center gap-3">
            {primaryCategory && (
              <Link
                href={`/explore?category=${encodeURIComponent(primaryCategory.slug)}`}
                className="rounded-full bg-[var(--surface)] px-3 py-1 text-xs font-medium text-[var(--primary)] transition-colors hover:bg-[var(--border)]"
              >
                {primaryCategory.name}
              </Link>
            )}
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                isAvailable
                  ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300"
                  : "bg-rose-500/15 text-rose-800 dark:text-rose-300"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isAvailable ? "bg-emerald-600" : "bg-rose-600"
                }`}
              />
              <span>
                {isAvailable
                  ? "Tersedia untuk Dipinjam"
                  : "Tidak Tersedia (Sedang Dipinjam)"}
              </span>
            </span>
            {isAdmin && activeLoan && (
              <span className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs font-medium text-[var(--fg)]">
                Dipinjam oleh: <strong>{activeLoan.user.name}</strong>
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-xs text-[var(--fg-muted)]">
              <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
              <span className="font-medium text-[var(--fg)]">
                {book.ratingAvg.toFixed(1)}
              </span>
              <span>({book.ratingCount} ulasan)</span>
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="font-heading text-3xl font-semibold tracking-tight text-[var(--fg)] sm:text-4xl">
              {book.title}
            </h1>
            {book.subtitle && (
              <p className="text-base text-[var(--fg-muted)]">{book.subtitle}</p>
            )}
            <p className="pt-1 text-sm text-[var(--fg-muted)]">
              Oleh{" "}
              {primaryAuthor ? (
                <Link
                  href={`/authors/${primaryAuthor.slug}`}
                  className="font-medium text-[var(--fg)] underline decoration-[var(--border)] underline-offset-4 hover:decoration-[var(--primary)]"
                >
                  {primaryAuthor.name}
                </Link>
              ) : (
                <span className="font-medium text-[var(--fg)]">Penulis Katalog</span>
              )}
            </p>
          </div>

          <BookDetailActions
            bookId={book.id}
            title={book.title}
            authorName={primaryAuthor?.name || "Penulis Katalog"}
            publisherName={book.publisher.name}
            publishYear={book.publishYear}
            isbn={book.isbn}
            pages={book.pages}
            stockAvailable={book.stockAvailable}
            inWishlistInitial={Boolean(wishlistEntry)}
            sampleExcerpt={
              book.sampleExcerpt ||
              `"Membaca buku ${book.title} membawa kita menyelami pemikiran ${primaryAuthor?.name || "penulis"} yang disajikan secara jernih dan sistematis."`
            }
            description={book.description}
          />
        </div>
      </section>

      <BookDetailTabs
        reviewCount={book.reviews.length}
        metadataContent={metadataSection}
        reviewsContent={reviewsSection}
      />

      {relatedBooks.length > 0 && (
        <section className="space-y-6 border-t border-[var(--border)] pt-12">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-xl font-semibold text-[var(--fg)] sm:text-2xl">
              Buku Serupa
            </h2>
            {primaryCategory && (
              <Link
                href={`/explore?category=${encodeURIComponent(primaryCategory.slug)}`}
                className="text-xs font-medium text-[var(--primary)] hover:underline"
              >
                Lihat kategori {primaryCategory.name} &rarr;
              </Link>
            )}
          </div>
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {relatedBooks.map((rb) => (
              <BookCard key={rb.id} book={rb} isAdmin={isAdmin} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}