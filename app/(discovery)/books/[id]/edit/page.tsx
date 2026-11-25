import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { ForbiddenView } from "@/components/auth/ForbiddenView";
import { PageHeader } from "@/components/layout/PageHeader";
import { EditBookForm } from "@/features/discovery/EditBookForm";

export default async function EditBookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numericId = Number(id);

  const user = await requireAuth(`/books/${id}/edit`);

  let book = !Number.isNaN(numericId)
    ? await prisma.book.findUnique({
        where: { id: numericId },
        include: {
          authors: true,
          categories: true,
        },
      })
    : null;

  if (!book && id === "1") {
    book = await prisma.book.findFirst({
      orderBy: { id: "asc" },
      include: {
        authors: true,
        categories: true,
      },
    });
  }

  if (!book) {
    notFound();
  }

  if (user.role !== "admin") {
    return (
      <ForbiddenView
        requestedPath={`/books/${id}/edit`}
        userName={user.name}
      />
    );
  }

  const [authors, categories, publishers] = await Promise.all([
    prisma.author.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, accentColor: true },
    }),
    prisma.publisher.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div>
      <PageHeader
        title={`Edit Metadata Buku: ${book.title}`}
        subtitle="Perbarui judul, penulis, kategori, stok, atau ganti gambar sampul buku di katalog perpustakaan."
        fallbackHref={`/books/${book.id}`}
        breadcrumbLabel={`Edit: ${book.title}`}
        actions={
          <Link
            href={`/books/${book.id}`}
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-xs font-semibold text-[var(--fg)] hover:border-[#92400E]"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Lihat Halaman Detail Buku</span>
          </Link>
        }
      />

      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <EditBookForm
          book={{
            id: book.id,
            title: book.title,
            subtitle: book.subtitle,
            isbn: book.isbn,
            language: book.language,
            publishYear: book.publishYear,
            pages: book.pages,
            stockTotal: book.stockTotal,
            stockAvailable: book.stockAvailable,
            description: book.description,
            sampleExcerpt: book.sampleExcerpt,
            coverPath: book.coverPath,
            isFeatured: book.isFeatured,
            authorId: book.authors[0]?.authorId || authors[0]?.id || 1,
            categoryId:
              book.categories[0]?.categoryId || categories[0]?.id || 1,
            publisherId: book.publisherId,
          }}
          authors={authors}
          categories={categories}
          publishers={publishers}
        />
      </div>
    </div>
  );
}