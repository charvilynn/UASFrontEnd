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
import { BookDetailActions } from "@/features/discovery/BookDetailActions";

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

  const createdBanner = sp.created === "1";
  const updatedBanner = sp.updated === "1";

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

    </div>
  );
}