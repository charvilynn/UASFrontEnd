import React from "react";
import Link from "next/link";
import { BookOpen, ShieldCheck, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { ForbiddenView } from "@/components/auth/ForbiddenView";
import { PageHeader } from "@/components/layout/PageHeader";
import { NewBookFormClient } from "@/features/support/NewBookFormClient";

interface NewBookPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function NewBookPage({ searchParams }: NewBookPageProps) {
  const user = await requireAuth("/books/new");
  if (user.role !== "admin") {
    return <ForbiddenView requestedPath="/books/new" userName={user.name} />;
  }

  const resolvedParams = await searchParams;
  const errorMessage = resolvedParams.error;

  const [authors, categories, publishers, recentManualBooks] =
    await Promise.all([
      prisma.author.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true, nationality: true },
      }),
      prisma.category.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true, slug: true, accentColor: true },
      }),
      prisma.publisher.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true, city: true },
      }),
      prisma.book.findMany({
        where: { source: "manual" },
        orderBy: { createdAt: "desc" },
        take: 4,
        include: {
          authors: { include: { author: true } },
          publisher: true,
        },
      }),
    ]);

  return (
    <div className="pb-16">
      <PageHeader
        title="Tambah Buku Baru ke Katalog"
        subtitle="Tambahkan koleksi literatur baru ke katalog perpustakaan lengkap dengan unggahan gambar sampul dan indeks taksonomi."
        fallbackHref="/explore"
        actions={
          <Link
            href="/admin/books"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3.5 py-2 text-xs font-semibold text-[var(--fg)] transition-colors hover:border-[#92400E]"
          >
            <ShieldCheck className="h-4 w-4 text-[#92400E] dark:text-amber-400" />
            <span>Kelola Katalog Admin</span>
          </Link>
        }
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <NewBookFormClient
          authors={authors}
          categories={categories}
          publishers={publishers}
          errorMessage={errorMessage}
        />

        {recentManualBooks.length > 0 && (
          <section className="mt-12 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/70 p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-[#92400E] dark:text-amber-400" />
                <h2 className="font-heading text-lg font-bold text-[var(--fg)]">
                  Buku yang Baru Ditambahkan Secara Manual
                </h2>
              </div>
              <Link
                href="/explore"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#92400E] hover:underline dark:text-amber-300"
              >
                <span>Lihat Seluruh Katalog</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {recentManualBooks.map((b) => {
                const authorName =
                  b.authors[0]?.author.name || "Penulis Charvlibrary";
                return (
                  <Link
                    key={b.id}
                    href={`/books/${b.id}`}
                    className="group flex flex-col justify-between rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 transition-all hover:border-[#92400E]"
                  >
                    <div>
                      <span className="inline-block rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase text-amber-900 dark:bg-amber-950 dark:text-amber-200">
                        Input Manual #{b.id}
                      </span>
                      <h3 className="font-heading mt-2 line-clamp-2 text-sm font-bold text-[var(--fg)] group-hover:text-[#92400E] dark:group-hover:text-amber-300">
                        {b.title}
                      </h3>
                      <p className="mt-1 text-xs text-[var(--fg-muted)]">
                        {authorName} ({b.publishYear})
                      </p>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-[var(--border)] pt-2 text-[11px] text-[var(--fg-muted)]">
                      <span>{b.publisher.name}</span>
                      <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                        Stok: {b.stockAvailable}/{b.stockTotal}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}