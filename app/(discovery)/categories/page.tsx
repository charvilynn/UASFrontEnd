import React from "react";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { GeneratedBookCover } from "@/components/books/GeneratedBookCover";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      books: {
        take: 3,
        include: {
          book: {
            include: {
              authors: { include: { author: true } },
            },
          },
        },
      },
      _count: {
        select: { books: true },
      },
    },
  });

  return (
    <div>
      <PageHeader
        title="Direktori Kategori & Disiplin Ilmu"
        subtitle="Jelajahi 16 kategori literatur di Charvlibrary beserta statistik ketersediaan koleksi dan contoh buku unggulan."
        fallbackHref="/explore"
      />

      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {categories.map((cat) => (
            <article
              key={cat.id}
              className="flex flex-col justify-between rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-xs transition-colors hover:border-[#92400E]"
            >
              <div>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: cat.accentColor }}
                    />
                    <h2 className="font-heading text-xl font-bold text-[var(--fg)]">
                      {cat.name}
                    </h2>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[var(--surface)] px-3 py-1 text-xs font-bold text-[#92400E] dark:text-amber-300">
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>{cat._count.books} Buku</span>
                  </span>
                </div>

                <p className="mt-2 text-sm text-[var(--fg-muted)]">
                  {cat.description}
                </p>

                {cat.books.length > 0 && (
                  <div className="mt-5 grid grid-cols-3 gap-3">
                    {cat.books.map((bc) => (
                      <Link
                        key={bc.bookId}
                        href={`/books/${bc.book.id}`}
                        className="group block"
                      >
                        <GeneratedBookCover
                          title={bc.book.title}
                          author={
                            bc.book.authors[0]?.author.name || "Penulis Katalog"
                          }
                          category={cat.name}
                          accentColor={cat.accentColor}
                          coverPath={bc.book.coverPath}
                          publishYear={bc.book.publishYear}
                          className="w-full aspect-[2/3]"
                        />
                        <p className="mt-1.5 truncate text-xs font-semibold text-[var(--fg)] group-hover:text-[#92400E]">
                          {bc.book.title}
                        </p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 flex items-center justify-end border-t border-[var(--border)] pt-4">
                <Link
                  href={`/explore?category=${encodeURIComponent(cat.slug)}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#92400E] hover:underline dark:text-amber-400"
                >
                  <span>Buka Semua Buku {cat.name}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}