import Link from "next/link";
import {
  BookCheck,
  BookOpen,
  FileText,
  NotebookPen,
  PlusCircle,
  Sparkles,
  Target,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { logReadingHistoryAction } from "@/features/account/actions";

export const dynamic = "force-dynamic";

interface HistoryPageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function ReadingHistoryPage({
  searchParams,
}: HistoryPageProps) {
  const sessionUser = await requireAuth("/account/history");

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

        </div>
      </main>
    </div>
  );
}