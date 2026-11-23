import React from "react";
import Link from "next/link";
import { Award, Star, TrendingUp } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { BookCard } from "@/components/books/BookCard";
import { GeneratedBookCover } from "@/components/books/GeneratedBookCover";
import { mapPrismaBookToCard } from "@/features/discovery/queries";

export default async function TrendingPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const tab = typeof sp.tab === "string" ? sp.tab : "rating";

  const sessionUser = await getSessionUser();
  const isAdmin = sessionUser?.role === "admin";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let orderBy: any = [{ ratingAvg: "desc" }, { ratingCount: "desc" }];
  if (tab === "reviews") orderBy = [{ ratingCount: "desc" }, { ratingAvg: "desc" }];
  if (tab === "newest") orderBy = [{ publishYear: "desc" }, { ratingAvg: "desc" }];

  const [booksRaw, userWishlists] = await Promise.all([
    prisma.book.findMany({
      orderBy,
      take: 24,
      include: {
        authors: { include: { author: true } },
        categories: { include: { category: true } },
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
  const books = booksRaw.map((b) => mapPrismaBookToCard(b, wishlistSet));
  const podium = books.slice(0, 3);
  const restBooks = books.slice(3);

  return (
    <div>
      <PageHeader
        title="Peringkat Buku Terpopuler & Rating Tertinggi"
        subtitle="Pantau literatur yang paling banyak dibaca, diulas, dan direkomendasikan oleh civitas akademika Charvlibrary."
        fallbackHref="/explore"
      />

      <div className="mx-auto max-w-7xl space-y-10 px-4 pb-16 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/trending?tab=rating"
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-colors ${
              tab === "rating"
                ? "bg-[#92400E] text-white"
                : "border border-[var(--border)] bg-[var(--card)] text-[var(--fg)] hover:border-[#92400E]"
            }`}
          >
            <Star className="h-3.5 w-3.5" />
            <span>Rating Tertinggi</span>
          </Link>

          <Link
            href="/trending?tab=reviews"
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-colors ${
              tab === "reviews"
                ? "bg-[#92400E] text-white"
                : "border border-[var(--border)] bg-[var(--card)] text-[var(--fg)] hover:border-[#92400E]"
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Paling Banyak Diulas</span>
          </Link>

          <Link
            href="/trending?tab=newest"
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-colors ${
              tab === "newest"
                ? "bg-[#92400E] text-white"
                : "border border-[var(--border)] bg-[var(--card)] text-[var(--fg)] hover:border-[#92400E]"
            }`}
          >
            <Award className="h-3.5 w-3.5" />
            <span>Terbitan Terkini</span>
          </Link>
        </div>

        <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {podium.map((book, idx) => (
            <div
              key={book.id}
              className="relative flex flex-col justify-between rounded-3xl border border-amber-500/40 bg-gradient-to-b from-[var(--surface)] to-[var(--card)] p-6 shadow-sm"
            >
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#92400E] px-3 py-1 text-xs font-bold text-white">
                    <Award className="h-3.5 w-3.5" />
                    <span>Peringkat #{idx + 1}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 text-sm font-bold text-amber-600">
                    <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                    {book.ratingAvg.toFixed(1)} ({book.ratingCount})
                  </span>
                </div>

                <div className="mx-auto max-w-[170px]">
                  <Link href={`/books/${book.id}`}>
                    <GeneratedBookCover
                      title={book.title}
                      author={book.authorName}
                      category={book.categoryName}
                      accentColor={book.accentColor}
                      coverPath={book.coverPath}
                      publishYear={book.publishYear}
                    />
                  </Link>
                </div>

                <h2 className="font-heading mt-4 text-center text-lg font-bold text-[var(--fg)]">
                  <Link href={`/books/${book.id}`} className="hover:underline">
                    {book.title}
                  </Link>
                </h2>
                <p className="mt-1 text-center text-xs text-[var(--fg-muted)]">
                  {book.authorName} &bull; {book.categoryName}
                </p>
              </div>

              <div className="mt-5">
                <Link
                  href={`/books/${book.id}`}
                  className="block w-full rounded-xl bg-[#92400E] py-2 text-center text-xs font-semibold text-white hover:bg-[#78350F]"
                >
                  Lihat Detail &amp; Pinjam
                </Link>
              </div>
            </div>
          ))}
        </section>

        <section>
          <h2 className="font-heading mb-5 text-xl font-bold text-[var(--fg)]">
            Peringkat Selanjutnya (#4 sampai #{books.length})
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {restBooks.map((book) => (
              <BookCard key={book.id} book={book} isAdmin={isAdmin} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}