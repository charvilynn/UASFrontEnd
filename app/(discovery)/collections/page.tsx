import React from "react";
import Link from "next/link";
import { ArrowRight, Library, UserCheck } from "lucide-react";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { GeneratedBookCover } from "@/components/books/GeneratedBookCover";

export default async function CollectionsPage() {
  const collections = await prisma.collection.findMany({
    orderBy: { id: "asc" },
    include: {
      books: {
        orderBy: { sortOrder: "asc" },
        take: 4,
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
        title="Koleksi Kurasi Tematik Pustakawan"
        subtitle="Daftar bacaan terstruktur yang disusun oleh tim kurator untuk memandu eksplorasi topik secara sistematis."
        fallbackHref="/explore"
      />

      <div className="mx-auto max-w-7xl space-y-8 px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {collections.map((col) => (
            <article
              key={col.id}
              className="flex flex-col justify-between rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-xs transition-all hover:border-[#92400E] sm:p-8"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="inline-flex items-center gap-1.5 font-semibold text-[#92400E] dark:text-amber-400">
                    <UserCheck className="h-3.5 w-3.5" />
                    <span>Kurator: {col.curatorName}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[var(--surface)] px-3 py-1 font-bold text-[var(--fg)]">
                    <Library className="h-3.5 w-3.5 text-[#92400E]" />
                    <span>{col._count.books} Buku Pilihan</span>
                  </span>
                </div>

                <h2 className="font-heading mt-3 text-2xl font-bold text-[var(--fg)]">
                  <Link
                    href={`/collections/${col.slug}`}
                    className="hover:text-[#92400E] hover:underline"
                  >
                    {col.title}
                  </Link>
                </h2>

                <p className="mt-1 text-xs font-semibold text-[var(--fg-muted)]">
                  {col.subtitle}
                </p>

                <p className="mt-3 text-sm leading-relaxed text-[var(--fg-muted)]">
                  {col.description}
                </p>

                <div className="mt-6 grid grid-cols-4 gap-3">
                  {col.books.map((cb) => (
                    <Link
                      key={cb.bookId}
                      href={`/books/${cb.book.id}`}
                      className="group block"
                    >
                      <GeneratedBookCover
                        title={cb.book.title}
                        author={
                          cb.book.authors[0]?.author.name || "Penulis Katalog"
                        }
                        accentColor={col.accentColor}
                        coverPath={cb.book.coverPath}
                        publishYear={cb.book.publishYear}
                        className="w-full aspect-[2/3]"
                      />
                      <p className="mt-1.5 truncate text-[11px] font-semibold text-[var(--fg)] group-hover:text-[#92400E]">
                        {cb.book.title}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end border-t border-[var(--border)] pt-4">
                <Link
                  href={`/collections/${col.slug}`}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#92400E] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#78350F]"
                >
                  <span>Buka Urutan Bacaan</span>
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