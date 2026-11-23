import React from "react";
import Link from "next/link";
import {
  PlusCircle,
  Search,
  FileEdit,
  ExternalLink,
  Filter,
  RotateCcw,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { ForbiddenView } from "@/components/auth/ForbiddenView";
import { EmptyState } from "@/components/ui/EmptyState";
import { adminReturnLoanAction } from "@/features/admin/actions";
import { AdminBookDeleteButton } from "@/features/admin/AdminBookDeleteButton";

interface AdminBooksPageProps {
  searchParams: Promise<{
    q?: string;
    source?: string;
    status?: string;
  }>;
}

export default async function AdminBooksPage({
  searchParams,
}: AdminBooksPageProps) {
  const user = await requireAuth("/admin/books");
  if (user.role !== "admin") {
    return <ForbiddenView requestedPath="/admin/books" userName={user.name} />;
  }

  const resolvedParams = await searchParams;
  const query = (resolvedParams.q || "").trim();
  const sourceFilter = resolvedParams.source || "all";
  const statusFilter = resolvedParams.status || "all";

  const whereClause: {
    AND?: Array<Record<string, unknown>>;
  } = {
    AND: [],
  };

  if (query.length > 0) {
    whereClause.AND?.push({
      OR: [
        { title: { contains: query } },
        { isbn: { contains: query } },
        { subtitle: { contains: query } },
      ],
    });
  }

  if (sourceFilter === "manual" || sourceFilter === "openlibrary") {
    whereClause.AND?.push({
      source: sourceFilter,
    });
  }

  if (statusFilter === "available") {
    whereClause.AND?.push({
      stockAvailable: { gt: 0 },
    });
  } else if (statusFilter === "borrowed") {
    whereClause.AND?.push({
      stockAvailable: { lte: 0 },
    });
  }

  const [
    books,
    totalBooksCount,
    manualCount,
    openLibraryCount,
    availableCount,
    borrowedCount,
  ] = await Promise.all([
    prisma.book.findMany({
      where:
        whereClause.AND && whereClause.AND.length > 0 ? whereClause : undefined,
      orderBy: [{ source: "asc" }, { id: "desc" }],
      include: {
        publisher: true,
        authors: { include: { author: true } },
        categories: { include: { category: true } },
        loans: {
          where: { status: { in: ["borrowed", "overdue"] } },
          include: { user: true },
          orderBy: { borrowedAt: "desc" },
        },
      },
    }),
    prisma.book.count(),
    prisma.book.count({ where: { source: "manual" } }),
    prisma.book.count({ where: { source: "openlibrary" } }),
    prisma.book.count({ where: { stockAvailable: { gt: 0 } } }),
    prisma.book.count({ where: { stockAvailable: { lte: 0 } } }),
  ]);

  return (
    <div className="pb-16">
      <PageHeader
        title="Kelola Katalog Buku"
        subtitle={`Manajemen penuh ${totalBooksCount} koleksi buku perpustakaan (${availableCount} Tersedia, ${borrowedCount} Sedang Dipinjam).`}
        fallbackHref="/admin"
        actions={
          <Link
            href="/books/new"
            className="inline-flex items-center gap-2 rounded-lg bg-[#92400E] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#78350F]"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Tambah Buku Baru</span>
          </Link>
        }
      />

      <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:flex-row sm:items-center">
          <form
            action="/admin/books"
            method="get"
            className="flex flex-1 flex-wrap items-center gap-2.5"
          >
            <div className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[var(--fg-muted)]" />
              <input
                type="search"
                name="q"
                defaultValue={query}
                placeholder="Cari judul buku, subjudul, atau nomor ISBN..."
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] py-2 pr-3 pl-9 text-sm text-[var(--fg)]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Filter className="h-4 w-4 shrink-0 text-[var(--fg-muted)]" />
              <select
                name="status"
                defaultValue={statusFilter}
                aria-label="Filter Status Ketersediaan"
                className="max-w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-semibold text-[var(--fg)]"
              >
                <option value="all">Semua Status ({totalBooksCount})</option>
                <option value="available">Tersedia ({availableCount})</option>
                <option value="borrowed">
                  Sedang Dipinjam ({borrowedCount})
                </option>
              </select>

              <select
                name="source"
                defaultValue={sourceFilter}
                aria-label="Filter Sumber Buku"
                className="max-w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-semibold text-[var(--fg)]"
              >
                <option value="all">Semua Sumber ({totalBooksCount})</option>
                <option value="manual">Input Manual ({manualCount})</option>
                <option value="openlibrary">
                  OpenLibrary ({openLibraryCount})
                </option>
              </select>
            </div>

            <button
              type="submit"
              className="rounded-lg bg-[#92400E] px-4 py-2 text-xs font-semibold text-white hover:bg-[#78350F]"
            >
              Terapkan Filter
            </button>

            {(query || sourceFilter !== "all" || statusFilter !== "all") && (
              <Link
                href="/admin/books"
                className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-semibold text-[var(--fg-muted)] hover:text-[var(--fg)]"
              >
                Reset
              </Link>
            )}
          </form>

          <div className="text-xs font-medium text-[var(--fg-muted)]">
            Menampilkan <strong>{books.length}</strong> judul buku
          </div>
        </div>

        {books.length === 0 ? (
          <EmptyState
            title="Tidak Ada Buku yang Cocok"
            description="Coba ubah kata kunci pencarian judul/ISBN atau tambahkan buku baru secara manual ke database."
            actionLabel="Tambah Buku Baru"
            actionHref="/books/new"
            secondaryActionLabel="Tampilkan Semua Buku"
            secondaryActionHref="/admin/books"
          />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--surface)] text-xs font-bold tracking-wider uppercase text-[var(--fg-muted)]">
                    <th className="px-4 py-3.5">ID & Judul Buku</th>
                    <th className="px-4 py-3.5">Penulis & Penerbit</th>
                    <th className="px-4 py-3.5">Kategori & ISBN</th>
                    <th className="px-4 py-3.5">Status & Peminjam</th>
                    <th className="px-4 py-3.5 text-right">Aksi Pustakawan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {books.map((book) => {
                    const authorNames =
                      book.authors.map((a) => a.author.name).join(", ") ||
                      "Penulis Charvlibrary";
                    const categoryNames =
                      book.categories.map((c) => c.category.name).join(", ") ||
                      "Literatur";
                    const activeLoan = book.loans[0];
                    const isAvailable =
                      book.stockAvailable > 0 && !activeLoan;

                    return (
                      <tr
                        key={book.id}
                        className="transition-colors hover:bg-[var(--surface)]/50"
                      >
                        <td className="px-4 py-3.5 align-top">
                          <div className="flex items-start gap-2.5">
                            <span className="mt-0.5 rounded bg-[var(--surface)] px-1.5 py-0.5 font-mono text-[11px] font-bold text-[#92400E] dark:text-amber-300">
                              #{book.id}
                            </span>
                            <div>
                              <Link
                                href={`/books/${book.id}`}
                                className="font-heading font-bold text-[var(--fg)] hover:text-[#92400E] dark:hover:text-amber-300"
                              >
                                {book.title}
                              </Link>
                              {book.subtitle && (
                                <p className="mt-0.5 line-clamp-1 text-xs text-[var(--fg-muted)]">
                                  {book.subtitle}
                                </p>
                              )}
                              <p className="mt-0.5 text-[11px] text-[var(--fg-muted)]">
                                Terbit {book.publishYear} • {book.pages} hlm •{" "}
                                {book.language}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3.5 align-top">
                          <p className="font-medium text-[var(--fg)]">
                            {authorNames}
                          </p>
                          <p className="mt-0.5 text-xs text-[var(--fg-muted)]">
                            {book.publisher.name}
                          </p>
                        </td>

                        <td className="px-4 py-3.5 align-top">
                          <span className="inline-block rounded-full bg-[var(--surface)] px-2.5 py-0.5 text-xs font-semibold text-[#92400E] dark:text-amber-300">
                            {categoryNames}
                          </span>
                          <p className="mt-1 font-mono text-xs text-[var(--fg-muted)]">
                            {book.isbn}
                          </p>
                        </td>

                        <td className="px-4 py-3.5 align-top">
                          {isAvailable ? (
                            <span className="inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                              Tersedia
                            </span>
                          ) : (
                            <div className="space-y-1">
                              <span className="inline-block rounded-full bg-rose-100 px-2.5 py-0.5 text-[11px] font-semibold text-rose-800 dark:bg-rose-950 dark:text-rose-200">
                                Tidak Tersedia (Dipinjam)
                              </span>
                              {activeLoan && (
                                <div className="mt-1 rounded-lg border border-[var(--border)] bg-[var(--surface)]/70 p-2 text-xs">
                                  <p className="font-semibold text-[var(--fg)]">
                                    Dipinjam oleh: {activeLoan.user.name}
                                  </p>
                                  <p className="text-[11px] text-[var(--fg-muted)]">
                                    {activeLoan.user.email} • Tenggat:{" "}
                                    {new Date(
                                      activeLoan.dueDate
                                    ).toLocaleDateString("id-ID", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    })}
                                  </p>
                                  <form
                                    action={adminReturnLoanAction}
                                    className="mt-1.5"
                                  >
                                    <input
                                      type="hidden"
                                      name="loanId"
                                      value={activeLoan.id}
                                    />
                                    <button
                                      type="submit"
                                      className="inline-flex items-center gap-1 rounded bg-emerald-700 px-2 py-1 text-[11px] font-semibold text-white hover:bg-emerald-800"
                                    >
                                      <RotateCcw className="h-3 w-3" />
                                      <span>Tandai Kembali</span>
                                    </button>
                                  </form>
                                </div>
                              )}
                            </div>
                          )}
                        </td>

                        <td className="px-4 py-3.5 text-right align-top">
                          <div className="inline-flex flex-wrap items-center justify-end gap-1.5">
                            <Link
                              href={`/books/${book.id}`}
                              title="Lihat Detail Buku"
                              className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-xs font-semibold text-[var(--fg)] hover:border-[#92400E]"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                              <span>Lihat</span>
                            </Link>

                            <Link
                              href={`/books/${book.id}/edit`}
                              className="inline-flex items-center gap-1 rounded-lg bg-[#92400E] px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-[#78350F]"
                            >
                              <FileEdit className="h-3.5 w-3.5" />
                              <span>Edit</span>
                            </Link>

                            <AdminBookDeleteButton
                              bookId={book.id}
                              bookTitle={book.title}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}