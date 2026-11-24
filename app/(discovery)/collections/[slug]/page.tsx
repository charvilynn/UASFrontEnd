import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { UserCheck, Library } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { BookCard } from "@/components/books/BookCard";
import { mapPrismaBookToCard } from "@/features/discovery/queries";

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let collection = await prisma.collection.findUnique({
    where: { slug },
    include: {
      books: {
        orderBy: { sortOrder: "asc" },
        include: {
          book: {
            include: {
              authors: { include: { author: true } },
              categories: { include: { category: true } },
            },
          },
        },
      },
    },
  });

  if (!collection) {
    collection = await prisma.collection.findFirst({
      orderBy: { id: "asc" },
      include: {
        books: {
          orderBy: { sortOrder: "asc" },
          include: {
            book: {
              include: {
                authors: { include: { author: true } },
                categories: { include: { category: true } },
              },
            },
          },
        },
      },
    });
  }

  if (!collection) {
    notFound();
  }

  const sessionUser = await getSessionUser();
  const isAdmin = sessionUser?.role === "admin";
  const userWishlists = sessionUser
    ? await prisma.wishlist.findMany({
        where: { userId: sessionUser.id },
        select: { bookId: true },
      })
    : [];
  const wishlistSet = new Set(userWishlists.map((w) => w.bookId));

  return (
    <div>
      <PageHeader
        title={collection.title}
        subtitle={`${collection.subtitle} • Dikurasi oleh ${collection.curatorName}`}
        fallbackHref="/collections"
        breadcrumbLabel={collection.title}
        actions={
          <Link
            href="/collections"
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-xs font-semibold text-[var(--fg)] hover:border-[#92400E]"
          >
            <Library className="h-3.5 w-3.5" />
            <span>Semua Koleksi Kurasi</span>
          </Link>
        }
      />

      <div className="mx-auto max-w-7xl space-y-8 px-4 pb-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-[#92400E] dark:text-amber-400">
            <UserCheck className="h-4 w-4" />
            <span>Catatan Kurator: {collection.curatorName}</span>
            <span>&bull;</span>
            <span>{collection.books.length} Buku dalam Urutan Studi</span>
          </div>
          <p className="mt-3 max-w-4xl text-sm leading-relaxed text-[var(--fg-muted)] sm:text-base">
            {collection.description}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {collection.books.map((cb, idx) => {
            const cardData = mapPrismaBookToCard(cb.book, wishlistSet);
            return (
              <div key={cb.bookId} className="flex flex-col">
                <div className="mb-2 flex items-center justify-between rounded-lg bg-[var(--surface)] px-3 py-1.5 text-xs">
                  <span className="font-bold text-[#92400E] dark:text-amber-400">
                    Urutan Baca #{idx + 1}
                  </span>
                  {cb.curatorNote && (
                    <span className="truncate pl-2 text-[11px] text-[var(--fg-muted)]">
                      {cb.curatorNote}
                    </span>
                  )}
                </div>
                <BookCard book={cardData} isAdmin={isAdmin} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}