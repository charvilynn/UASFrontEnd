import Link from "next/link";
import {
  MessageSquareQuote,
  Star,
  CheckCircle2,
  AlertCircle,
  LogIn,
  Send,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  submitReviewAction,
} from "@/features/borrowing/actions";

interface ReviewsPageProps {
  searchParams: Promise<{
    rating?: string;
    bookId?: string;
    submitted?: string;
    error?: string;
  }>;
}


export default async function ReviewsPage({ searchParams }: ReviewsPageProps) {
  const [user, resolvedParams] = await Promise.all([
    getSessionUser(),
    searchParams,
  ]);

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

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
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