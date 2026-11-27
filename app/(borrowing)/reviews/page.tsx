import React from "react";
import Link from "next/link";
import {
  MessageSquareQuote,
  Star,
  ThumbsUp,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  LogIn,
  Send,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { GeneratedBookCover } from "@/components/books/GeneratedBookCover";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  submitReviewAction,
  markReviewHelpfulAction,
} from "@/features/borrowing/actions";

interface ReviewsPageProps {
  searchParams: Promise<{
    rating?: string;
    bookId?: string;
    submitted?: string;
    error?: string;
  }>;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default async function ReviewsPage({ searchParams }: ReviewsPageProps) {
  const [user, resolvedParams] = await Promise.all([
    getSessionUser(),
    searchParams,
  ]);

  const ratingFilter = Number(resolvedParams.rating) || 0;
  const preselectedBookId = Number(resolvedParams.bookId) || 0;
  const submittedBanner = resolvedParams.submitted === "1";
  const errorMsg = resolvedParams.error;

  const [allReviews, catalogBooks] = await Promise.all([
    prisma.review.findMany({
      include: {
        user: true,
        book: {
          include: {
            authors: { include: { author: true } },
            categories: { include: { category: true } },
          },
        },
      },
      orderBy: [{ helpfulCount: "desc" }, { createdAt: "desc" }],
    }),
    prisma.book.findMany({
      orderBy: { title: "asc" },
      select: {
        id: true,
        title: true,
        publishYear: true,
        ratingAvg: true,
      },
    }),
  ]);

  const filteredReviews =
    ratingFilter >= 1 && ratingFilter <= 5
      ? allReviews.filter((r) => r.rating === ratingFilter)
      : allReviews;

  const totalReviews = allReviews.length;
  const avgCommunityRating =
    totalReviews > 0
      ? (
          allReviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews
        ).toFixed(2)
      : "0.00";
  const fiveStarCount = allReviews.filter((r) => r.rating === 5).length;

  return (
    <div className="min-h-screen pb-16">
      <PageHeader
        title="Ulasan & Rating Komunitas"
        subtitle="Baca resensi jujur dari sivitas akademika Charvlibrary, berikan apresiasi pada ulasan yang membantu, dan bagikan penilaian bintang Anda."
        fallbackHref="/explore"
        actions={
          <Link
            href="/recommendations"
            className="inline-flex items-center gap-2 rounded-lg bg-[#92400E] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#78350F]"
          >
            <Star className="h-4 w-4" />
            <span>Lihat Rekomendasi Buku</span>
          </Link>
        }
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {submittedBanner && (
          <div
            role="status"
            className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200"
          >
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
            <span>
              Terima kasih! Ulasan berbintang Anda telah berhasil disimpan dan
              rata-rata rating buku di katalog telah diperbarui.
            </span>
          </div>
        )}

        {errorMsg && (
          <div
            role="alert"
            className="mb-6 flex items-center gap-3 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-900 dark:border-red-800 dark:bg-red-950/60 dark:text-red-200"
          >
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <section
          aria-label="Statistik Ulasan"
          className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3"
        >
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-xs">
            <span className="text-xs font-semibold tracking-wider uppercase text-[var(--fg-muted)]">
              Total Ulasan Pembaca
            </span>
            <p className="mt-2 font-heading text-2xl font-bold text-[var(--fg)]">
              {totalReviews} Resensi
            </p>
            <p className="mt-1 text-xs text-[var(--fg-muted)]">
              Dari mahasiswa, dosen, dan anggota aktif
            </p>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-xs">
            <span className="text-xs font-semibold tracking-wider uppercase text-[var(--fg-muted)]">
              Rata-Rata Rating Komunitas
            </span>
            <p className="mt-2 flex items-center gap-2 font-heading text-2xl font-bold text-amber-600 dark:text-amber-400">
              <Star className="h-6 w-6 fill-amber-500 text-amber-500" />
              <span>{avgCommunityRating} / 5.0</span>
            </p>
            <p className="mt-1 text-xs text-[var(--fg-muted)]">
              Berdasarkan seluruh ulasan anggota terdaftar
            </p>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-xs">
            <span className="text-xs font-semibold tracking-wider uppercase text-[var(--fg-muted)]">
              Apresiasi 5 Bintang
            </span>
            <p className="mt-2 font-heading text-2xl font-bold text-emerald-700 dark:text-emerald-400">
              {fiveStarCount} Ulasan
            </p>
            <p className="mt-1 text-xs text-[var(--fg-muted)]">
              Koleksi dengan tingkat kepuasan tertinggi
            </p>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)]/70 p-3">
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { rating: 0, label: `Semua (${totalReviews})` },
                  { rating: 5, label: "5 Bintang" },
                  { rating: 4, label: "4 Bintang" },
                  { rating: 3, label: "3 Bintang" },
                  { rating: 2, label: "2 Bintang" },
                  { rating: 1, label: "1 Bintang" },
                ].map((tab) => {
                  const isActive = ratingFilter === tab.rating;
                  return (
                    <Link
                      key={tab.rating}
                      href={
                        tab.rating === 0
                          ? "/reviews"
                          : `/reviews?rating=${tab.rating}`
                      }
                      className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                        isActive
                          ? "bg-[#92400E] text-white"
                          : "bg-[var(--card)] text-[var(--fg-muted)] hover:text-[var(--fg)]"
                      }`}
                    >
                      {tab.rating > 0 && (
                        <Star className="h-3 w-3 fill-current" />
                      )}
                      <span>{tab.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {filteredReviews.length === 0 ? (
              <EmptyState
                title="Belum Ada Ulasan pada Filter Ini"
                description="Jadilah pembaca pertama yang menulis ulasan berbintang untuk koleksi buku favorit Anda."
                actionLabel="Tampilkan Semua Ulasan"
                actionHref="/reviews"
                secondaryActionLabel="Jelajahi Katalog"
                secondaryActionHref="/explore"
              />
            ) : (
              <div className="space-y-4">
                {filteredReviews.map((rev) => {
                  const primaryAuthor =
                    rev.book.authors[0]?.author.name || "Penulis Koleksi";
                  const primaryCategory =
                    rev.book.categories[0]?.category.name || "Literatur";
                  const accentColor =
                    rev.book.categories[0]?.category.accentColor || "#92400E";

                  return (
                    <article
                      key={rev.id}
                      className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-xs"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row">
                        <div className="w-20 shrink-0 sm:w-24">
                          <Link href={`/books/${rev.book.id}`} className="block">
                            <GeneratedBookCover
                              title={rev.book.title}
                              author={primaryAuthor}
                              category={primaryCategory}
                              accentColor={accentColor}
                              coverPath={rev.book.coverPath}
                              publishYear={rev.book.publishYear}
                              className="w-full aspect-[2/3]"
                            />
                          </Link>
                        </div>

                        <div className="flex flex-1 flex-col justify-between">
                          <div>
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <Link
                                href={`/books/${rev.book.id}`}
                                className="text-xs font-semibold text-[#92400E] hover:underline dark:text-amber-400"
                              >
                                {rev.book.title} &bull; {primaryAuthor}
                              </Link>

                              <div
                                className="flex items-center gap-0.5 text-amber-500"
                                aria-label={`Rating ${rev.rating} dari 5 bintang`}
                              >
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < rev.rating
                                        ? "fill-amber-500 text-amber-500"
                                        : "text-slate-300 dark:text-slate-600"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>

                            <h3 className="mt-1.5 font-heading text-base font-bold text-[var(--fg)]">
                              {rev.title}
                            </h3>

                            {rev.spoiler && (
                              <div className="mt-1.5 inline-flex items-center gap-1 rounded-md border border-amber-300 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-900 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-200">
                                <AlertTriangle className="h-3 w-3" />
                                <span>Mengandung Bocoran Alur (Spoiler)</span>
                              </div>
                            )}

                            <p className="mt-2 text-sm leading-relaxed text-[var(--fg-muted)]">
                              {rev.comment}
                            </p>
                          </div>

                          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border)] pt-3 text-xs">
                            <div className="flex items-center gap-2">
                              <span
                                className="inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold text-white"
                                style={{
                                  backgroundColor:
                                    rev.user.avatarColor || "#92400E",
                                }}
                              >
                                {rev.user.name.slice(0, 1).toUpperCase()}
                              </span>
                              <span className="font-semibold text-[var(--fg)]">
                                {rev.user.name}
                              </span>
                              {rev.user.faculty && (
                                <span className="text-[var(--fg-muted)]">
                                  ({rev.user.faculty})
                                </span>
                              )}
                              <span className="text-[var(--fg-muted)]">
                                &bull; {formatDate(rev.createdAt)}
                              </span>
                            </div>

                            <form action={markReviewHelpfulAction}>
                              <input
                                type="hidden"
                                name="reviewId"
                                value={rev.id}
                              />
                              <button
                                type="submit"
                                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-[var(--fg)] transition-colors hover:border-[#92400E] hover:text-[#92400E]"
                              >
                                <ThumbsUp className="h-3.5 w-3.5" />
                                <span>
                                  Ulasan Membantu (+1) &bull; {rev.helpfulCount}
                                </span>
                              </button>
                            </form>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          <aside>
            <div className="sticky top-24 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-xs">
              <div className="flex items-center gap-2.5">
                <MessageSquareQuote className="h-5 w-5 text-[#92400E]" />
                <h2 className="font-heading text-lg font-bold text-[var(--fg)]">
                  Tulis Ulasan Buku
                </h2>
              </div>
              <p className="mt-1 text-xs text-[var(--fg-muted)]">
                Bagikan pengalaman membaca Anda. Jika Anda sudah pernah mengulas
                buku yang sama, ulasan lama Anda akan diperbarui secara otomatis.
              </p>

              {!user ? (
                <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50/80 p-4 text-xs text-amber-950 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-200">
                  <p className="font-semibold">
                    Masuk Akun untuk Mengirim Ulasan
                  </p>
                  <p className="mt-1">
                    Silakan masuk menggunakan akun anggota Anda untuk menulis
                    resensi dan menilai buku di katalog.
                  </p>
                  <Link
                    href="/login?next=/reviews"
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#92400E] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#78350F]"
                  >
                    <LogIn className="h-3.5 w-3.5" />
                    <span>Masuk Akun Anggota</span>
                  </Link>
                </div>
              ) : (
                <form action={submitReviewAction} className="mt-4 space-y-3.5">
                  <div>
                    <label
                      htmlFor="review-bookId"
                      className="block text-xs font-semibold text-[var(--fg)]"
                    >
                      Pilih Buku dari Katalog
                    </label>
                    <select
                      id="review-bookId"
                      name="bookId"
                      required
                      defaultValue={
                        preselectedBookId > 0 ? String(preselectedBookId) : ""
                      }
                      className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--fg)]"
                    >
                      <option value="">-- Pilih judul buku --</option>
                      {catalogBooks.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.title} ({b.publishYear}) - ★{" "}
                          {b.ratingAvg.toFixed(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="review-rating"
                      className="block text-xs font-semibold text-[var(--fg)]"
                    >
                      Penilaian Bintang
                    </label>
                    <select
                      id="review-rating"
                      name="rating"
                      defaultValue="5"
                      className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-semibold text-[var(--fg)]"
                    >
                      <option value="5">★★★★★ (5/5 - Sangat Direkomendasikan)</option>
                      <option value="4">★★★★☆ (4/5 - Bagus & Bermanfaat)</option>
                      <option value="3">★★★☆☆ (3/5 - Cukup Baik)</option>
                      <option value="2">★★☆☆☆ (2/5 - Kurang Sesuai Ekspektasi)</option>
                      <option value="1">★☆☆☆☆ (1/5 - Tidak Direkomendasikan)</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="review-title"
                      className="block text-xs font-semibold text-[var(--fg)]"
                    >
                      Judul Ulasan
                    </label>
                    <input
                      id="review-title"
                      type="text"
                      name="title"
                      required
                      placeholder="Mis: Kupasan mendalam yang mudah dipahami"
                      className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--fg)]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="review-comment"
                      className="block text-xs font-semibold text-[var(--fg)]"
                    >
                      Isi Resensi / Komentar
                    </label>
                    <textarea
                      id="review-comment"
                      name="comment"
                      required
                      rows={4}
                      placeholder="Ceritakan bagian paling menarik atau manfaat buku ini bagi studi Anda..."
                      className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--fg)]"
                    />
                  </div>

                  <label className="flex cursor-pointer items-center gap-2 text-xs text-[var(--fg-muted)]">
                    <input
                      type="checkbox"
                      name="spoiler"
                      className="h-4 w-4 rounded border-[var(--border)] accent-[#92400E]"
                    />
                    <span>Tandai jika ulasan mengandung bocoran cerita (spoiler)</span>
                  </label>

                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#92400E] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#78350F]"
                  >
                    <Send className="h-4 w-4" />
                    <span>Publikasikan Ulasan</span>
                  </button>
                </form>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}