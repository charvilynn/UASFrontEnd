import React from "react";
import Link from "next/link";
import {
  BookCheck,
  BookOpen,
  Calendar,
  FileText,
  NotebookPen,
  PlusCircle,
  Sparkles,
  Target,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { GeneratedBookCover } from "@/components/books/GeneratedBookCover";
import { EmptyState } from "@/components/ui/EmptyState";
import { logReadingHistoryAction } from "@/features/account/actions";

export const dynamic = "force-dynamic";

interface HistoryPageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function ReadingHistoryPage({
  searchParams,
}: HistoryPageProps) {
  const sessionUser = await requireAuth("/account/history");
  const resolvedParams = await searchParams;
  const activeFilter = resolvedParams.status ?? "all";

  const [histories, books] = await Promise.all([
    prisma.readingHistory.findMany({
      where: { userId: sessionUser.id },
      include: {
        book: {
          include: {
            authors: {
              include: { author: true },
            },
            categories: {
              include: { category: true },
            },
          },
        },
        loan: true,
      },
      orderBy: {
        startedAt: "desc",
      },
    }),
    prisma.book.findMany({
      orderBy: { title: "asc" },
      select: {
        id: true,
        title: true,
        pages: true,
        publishYear: true,
      },
    }),
  ]);

  const filteredHistories =
    activeFilter === "all"
      ? histories
      : histories.filter((h) => h.status === activeFilter);

  const totalCompleted = histories.filter(
    (h) => h.status === "completed"
  ).length;
  const totalReading = histories.filter((h) => h.status === "reading").length;
  const totalPagesRead = histories.reduce((sum, h) => sum + h.pagesRead, 0);

  return (
    <div className="min-h-screen pb-16">
      <PageHeader
        title="Jurnal & Riwayat Bacaan"
        subtitle="Arsip buku yang telah Anda baca, catatan refleksi intelektual, dan pencatatan progres halaman terintegrasi dengan Target Baca Tahunan."
        fallbackHref="/account/profile"
        actions={
          <>
            <Link
              href="/account/reading-goals"
              className="inline-flex items-center gap-2 rounded-lg bg-[#92400E] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#78350F]"
            >
              <Target className="h-3.5 w-3.5" />
              <span>Target Baca 2026</span>
            </Link>
            <Link
              href="/reviews"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-xs font-semibold text-[var(--fg)] transition-colors hover:border-[#92400E]"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#92400E]" />
              <span>Tulis Ulasan Publik</span>
            </Link>
          </>
        }
      />

      <main className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider uppercase text-[var(--fg-muted)]">
                Buku Selesai Dibaca
              </span>
              <BookCheck className="h-5 w-5 text-emerald-600" />
            </div>
            <p className="font-heading mt-2 text-3xl font-bold text-[var(--fg)]">
              {totalCompleted}
            </p>
            <p className="mt-1 text-xs text-[var(--fg-muted)]">
              Dari total {histories.length} entri jurnal bacaan
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider uppercase text-[var(--fg-muted)]">
                Sedang Dibaca
              </span>
              <BookOpen className="h-5 w-5 text-[#92400E]" />
            </div>
            <p className="font-heading mt-2 text-3xl font-bold text-[var(--fg)]">
              {totalReading}
            </p>
            <p className="mt-1 text-xs text-[var(--fg-muted)]">
              Buku dalam proses pembacaan aktif
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider uppercase text-[var(--fg-muted)]">
                Akumulasi Halaman
              </span>
              <FileText className="h-5 w-5 text-amber-600" />
            </div>
            <p className="font-heading mt-2 text-3xl font-bold text-[var(--fg)]">
              {totalPagesRead.toLocaleString("id-ID")}
            </p>
            <p className="mt-1 text-xs text-[var(--fg-muted)]">
              Otomatis disinkronkan ke progres Target Tahunan 2026
            </p>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <section className="lg:col-span-4">
            <form
              action={logReadingHistoryAction}
              className="sticky top-24 space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-xs"
            >
              <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3">
                <NotebookPen className="h-5 w-5 text-[#92400E]" />
                <div>
                  <h2 className="font-heading text-lg font-bold text-[var(--fg)]">
                    Catat Progres &amp; Refleksi
                  </h2>
                  <p className="text-[11px] text-[var(--fg-muted)]">
                    Simpan catatan halaman dan intisari buku ke jurnal bacaan
                  </p>
                </div>
              </div>

              <div>
                <label
                  htmlFor="bookId"
                  className="mb-1 block text-xs font-bold uppercase text-[var(--fg)]"
                >
                  Pilih Buku Katalog
                </label>
                <select
                  id="bookId"
                  name="bookId"
                  required
                  defaultValue={books[0]?.id ?? ""}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)]/70 px-3 py-2.5 text-xs text-[var(--fg)] focus:border-[#92400E]"
                >
                  {books.map((book) => (
                    <option key={book.id} value={book.id}>
                      {book.title} ({book.pages} hal)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="pagesRead"
                    className="mb-1 block text-xs font-bold uppercase text-[var(--fg)]"
                  >
                    Halaman Terbaca
                  </label>
                  <input
                    id="pagesRead"
                    name="pagesRead"
                    type="number"
                    min={1}
                    max={5000}
                    defaultValue={120}
                    required
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)]/70 px-3 py-2 text-xs text-[var(--fg)] focus:border-[#92400E]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="status"
                    className="mb-1 block text-xs font-bold uppercase text-[var(--fg)]"
                  >
                    Status Baca
                  </label>
                  <select
                    id="status"
                    name="status"
                    defaultValue="completed"
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)]/70 px-3 py-2 text-xs text-[var(--fg)] focus:border-[#92400E]"
                  >
                    <option value="completed">Selesai Dibaca</option>
                    <option value="reading">Sedang Dibaca</option>
                    <option value="dropped">Ditunda</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="reflection"
                  className="mb-1 block text-xs font-bold uppercase text-[var(--fg)]"
                >
                  Refleksi &amp; Catatan Intelektual
                </label>
                <textarea
                  id="reflection"
                  name="reflection"
                  rows={4}
                  placeholder="Tuliskan gagasan utama, kutipan berkesan, atau analisis singkat dari buku ini..."
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)]/70 px-3 py-2 text-xs text-[var(--fg)] focus:border-[#92400E]"
                />
              </div>

              <button
                type="submit"
                className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#92400E] px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#78350F]"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Simpan ke Jurnal Bacaan</span>
              </button>
            </form>
          </section>

          <section className="space-y-4 lg:col-span-8">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-xs">
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { key: "all", label: `Semua (${histories.length})` },
                  {
                    key: "completed",
                    label: `Selesai (${totalCompleted})`,
                  },
                  {
                    key: "reading",
                    label: `Sedang Dibaca (${totalReading})`,
                  },
                  {
                    key: "dropped",
                    label: `Ditunda (${
                      histories.filter((h) => h.status === "dropped").length
                    })`,
                  },
                ].map((tab) => {
                  const isActive = activeFilter === tab.key;
                  return (
                    <Link
                      key={tab.key}
                      href={
                        tab.key === "all"
                          ? "/account/history"
                          : `/account/history?status=${tab.key}`
                      }
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                        isActive
                          ? "bg-[#92400E] text-white"
                          : "bg-[var(--surface)] text-[var(--fg-muted)] hover:text-[var(--fg)]"
                      }`}
                    >
                      {tab.label}
                    </Link>
                  );
                })}
              </div>
              <Link
                href="/account/reading-goals"
                className="text-xs font-semibold text-[#92400E] hover:underline dark:text-amber-300"
              >
                Lihat Target Baca 2026 &rarr;
              </Link>
            </div>

            {filteredHistories.length > 0 ? (
              <div className="space-y-4">
                {filteredHistories.map((entry) => {
                  const primaryAuthor =
                    entry.book.authors[0]?.author.name ??
                    "Penulis Charvlibrary";
                  const primaryCategory =
                    entry.book.categories[0]?.category.name ?? "Literatur";
                  const progressPct = Math.min(
                    100,
                    Math.round(
                      (entry.pagesRead / Math.max(1, entry.book.pages)) * 100
                    )
                  );

                  return (
                    <article
                      key={entry.id}
                      className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-xs sm:p-6"
                    >
                      <div className="flex flex-col gap-5 sm:flex-row">
                        <div className="w-20 shrink-0 sm:w-24">
                          <GeneratedBookCover
                            title={entry.book.title}
                            author={primaryAuthor}
                            category={primaryCategory}
                            coverPath={entry.book.coverPath}
                            publishYear={entry.book.publishYear}
                            className="w-20 sm:w-24 aspect-[2/3]"
                          />
                        </div>

                        <div className="min-w-0 flex-1 space-y-3">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                                    entry.status === "completed"
                                      ? "bg-emerald-600/15 text-emerald-700 dark:text-emerald-300"
                                      : entry.status === "reading"
                                        ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                                        : "bg-slate-500/15 text-slate-700 dark:text-slate-300"
                                  }`}
                                >
                                  {entry.status === "completed"
                                    ? "Selesai Dibaca"
                                    : entry.status === "reading"
                                      ? "Sedang Dibaca"
                                      : "Ditunda"}
                                </span>
                                <span className="text-xs text-[var(--fg-muted)]">
                                  {primaryCategory}
                                </span>
                                {entry.loan && (
                                  <span className="font-mono text-[11px] text-[#92400E] dark:text-amber-300">
                                    Pinjaman: {entry.loan.loanCode}
                                  </span>
                                )}
                              </div>

                              <Link
                                href={`/books/${entry.book.id}`}
                                className="font-heading mt-1 block text-lg font-bold text-[var(--fg)] hover:text-[#92400E]"
                              >
                                {entry.book.title}
                              </Link>
                              <p className="text-xs text-[var(--fg-muted)]">
                                Karya {primaryAuthor} &bull; {entry.book.pages}{" "}
                                halaman
                              </p>
                            </div>

                            <div className="text-right text-xs text-[var(--fg-muted)]">
                              <span className="inline-flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                {entry.startedAt.toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                          </div>

                          <div>
                            <div className="mb-1 flex items-center justify-between text-xs">
                              <span className="text-[var(--fg-muted)]">
                                Progres Pembacaan
                              </span>
                              <span className="font-bold text-[var(--fg)]">
                                {entry.pagesRead} / {entry.book.pages} halaman (
                                {progressPct}%)
                              </span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]">
                              <div
                                className="h-full rounded-full bg-[#92400E]"
                                style={{ width: `${progressPct}%` }}
                              />
                            </div>
                          </div>

                          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)]/70 p-3.5">
                            <p className="text-[11px] font-bold tracking-wider uppercase text-[#92400E] dark:text-amber-300">
                              Catatan Refleksi Anggota:
                            </p>
                            <p className="mt-1 text-xs leading-relaxed text-[var(--fg)]">
                              {entry.reflection ||
                                "Belum ada catatan refleksi tertulis untuk buku ini."}
                            </p>
                          </div>

                          <details className="group text-xs">
                            <summary className="cursor-pointer font-semibold text-[#92400E] hover:underline dark:text-amber-300">
                              Perbarui Halaman / Refleksi Buku Ini
                            </summary>
                            <form
                              action={logReadingHistoryAction}
                              className="mt-3 space-y-3 rounded-xl border border-[var(--border)] bg-[var(--surface)]/50 p-3.5"
                            >
                              <input
                                type="hidden"
                                name="historyId"
                                value={entry.id}
                              />
                              <input
                                type="hidden"
                                name="bookId"
                                value={entry.bookId}
                              />
                              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div>
                                  <label className="mb-1 block text-[11px] font-semibold text-[var(--fg)]">
                                    Halaman Terbaca
                                  </label>
                                  <input
                                    type="number"
                                    name="pagesRead"
                                    min={1}
                                    max={entry.book.pages}
                                    defaultValue={entry.pagesRead}
                                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-xs text-[var(--fg)]"
                                  />
                                </div>
                                <div>
                                  <label className="mb-1 block text-[11px] font-semibold text-[var(--fg)]">
                                    Status Bacaan
                                  </label>
                                  <select
                                    name="status"
                                    defaultValue={entry.status}
                                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-xs text-[var(--fg)]"
                                  >
                                    <option value="completed">
                                      Selesai Dibaca
                                    </option>
                                    <option value="reading">
                                      Sedang Dibaca
                                    </option>
                                    <option value="dropped">Ditunda</option>
                                  </select>
                                </div>
                              </div>
                              <div>
                                <label className="mb-1 block text-[11px] font-semibold text-[var(--fg)]">
                                  Refleksi Baru
                                </label>
                                <input
                                  type="text"
                                  name="reflection"
                                  defaultValue={entry.reflection ?? ""}
                                  placeholder="Perbarui catatan refleksi..."
                                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-xs text-[var(--fg)]"
                                />
                              </div>
                              <button
                                type="submit"
                                className="cursor-pointer rounded-lg bg-[#92400E] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#78350F]"
                              >
                                Simpan Pembaruan
                              </button>
                            </form>
                          </details>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                title="Belum Ada Catatan pada Filter Ini"
                description="Gunakan formulir di samping untuk mencatat progres halaman buku yang sedang atau telah selesai Anda baca."
                actionLabel="Tampilkan Semua Riwayat"
                actionHref="/account/history"
                secondaryActionLabel="Jelajahi Katalog"
                secondaryActionHref="/explore"
              />
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
