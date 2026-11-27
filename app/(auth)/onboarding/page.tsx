import Link from "next/link";
import { Sparkles, BookOpen, Target, CheckCircle2, Wand2, Compass } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { saveOnboardingAction } from "@/features/auth/actions";

export default async function OnboardingPage() {
  const user = await requireAuth("/onboarding");

  const [categories, existingPrefs, readingGoal] = await Promise.all([
    prisma.category.findMany({
      include: {
        _count: {
          select: { books: true },
        },
      },
      orderBy: { id: "asc" },
    }),
    prisma.userPreference.findMany({
      where: { userId: user.id },
      select: { categoryId: true },
    }),
    prisma.readingGoal.findUnique({
      where: {
        userId_year: {
          userId: user.id,
          year: 2026,
        },
      },
    }),
  ]);

  const selectedSet = new Set(existingPrefs.map((p) => p.categoryId));
  const defaultTargetBooks = readingGoal?.targetBooks ?? 15;
  const defaultTargetPages = readingGoal?.targetPages ?? 4500;

  return (
    <div className="min-h-screen pb-16">
      <PageHeader
        title="Orientasi Minat Baca & Target Literasi 2026"
        subtitle={`Selamat datang, ${user.name} (${user.memberCode}). Pilih genre literatur favorit Anda dari 16 kategori agar mesin rekomendasi personal menampilkan bacaan yang paling relevan.`}
        fallbackHref="/"
        breadcrumbLabel="Orientasi Minat Baca"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/recommendations"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3.5 py-2 text-xs font-semibold text-[var(--fg)] transition hover:border-[#92400E] hover:text-[#92400E]"
            >
              <Wand2 className="h-3.5 w-3.5" />
              Lihat Rekomendasi Personal
            </Link>
            <Link
              href="/account/reading-goals"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3.5 py-2 text-xs font-semibold text-[var(--fg-muted)] transition hover:border-[#92400E] hover:text-[var(--fg)]"
            >
              <Target className="h-3.5 w-3.5" />
              Progres Target Baca
            </Link>
          </div>
        }
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <form action={saveOnboardingAction} className="space-y-8">
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm sm:p-8">
            <div className="mb-6 flex flex-col justify-between gap-3 border-b border-[var(--border)] pb-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="font-heading text-xl font-bold text-[var(--fg)]">
                  1. Pilih Kategori & Genre Favorit ({categories.length} Kategori Tersedia)
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-[var(--fg-muted)]">
                  Centang minimal 2 hingga 5 kategori yang paling sesuai dengan minat studi atau
                  hobi membaca Anda.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-[#92400E]/15 px-3 py-1 text-xs font-bold text-[#92400E] dark:text-amber-300">
                <Sparkles className="h-3.5 w-3.5" />
                {selectedSet.size} Genre Tersimpan Saat Ini
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((cat, idx) => {
                const isChecked = selectedSet.size > 0 ? selectedSet.has(cat.id) : idx < 3;

                return (
                  <label
                    key={cat.id}
                    className="group relative flex cursor-pointer flex-col justify-between rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4 transition hover:border-[#92400E] has-[:checked]:border-[#92400E] has-[:checked]:bg-[#92400E]/5"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span
                          className="inline-block h-3 w-3 rounded-full"
                          style={{ backgroundColor: cat.accentColor }}
                        />
                        <input
                          type="checkbox"
                          name="categoryIds"
                          value={cat.id}
                          defaultChecked={isChecked}
                          className="h-4 w-4 rounded accent-[#92400E]"
                        />
                      </div>
                      <h3 className="mt-2.5 font-heading text-base font-bold text-[var(--fg)] group-hover:text-[#92400E] dark:group-hover:text-amber-300">
                        {cat.name}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-xs text-[var(--fg-muted)]">
                        {cat.description}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-[var(--border)]/70 pt-2.5 text-[11px] font-medium text-[var(--fg-muted)]">
                      <span className="inline-flex items-center gap-1">
                        <BookOpen className="h-3 w-3 text-[#D97706]" />
                        {cat._count.books} judul buku
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm sm:p-8">
            <div className="mb-6 flex items-center justify-between border-b border-[var(--border)] pb-4">
              <div>
                <h2 className="font-heading text-xl font-bold text-[var(--fg)]">
                  2. Tetapkan Target Membaca Tahunan (Tahun Akademik 2026)
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-[var(--fg-muted)]">
                  Target ini akan dipantau secara langsung di halaman Profil Anggota dan halaman
                  Target Baca Tahunan.
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D97706]/15 text-[#92400E] dark:text-amber-300">
                <Target className="h-5 w-5" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label
                  htmlFor="targetBooks"
                  className="mb-1.5 block text-sm font-semibold text-[var(--fg)]"
                >
                  Target Jumlah Buku Selesai Dibaca (2026)
                </label>
                <input
                  id="targetBooks"
                  name="targetBooks"
                  type="number"
                  min={1}
                  max={200}
                  required
                  defaultValue={defaultTargetBooks}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-sm font-semibold text-[var(--fg)] focus:border-[#92400E] focus:outline-none"
                />
                <p className="mt-1.5 text-xs text-[var(--fg-muted)]">
                  Rekomendasi mahasiswa aktif: 12 hingga 24 buku per tahun (1-2 buku per bulan).
                </p>
              </div>

              <div>
                <label
                  htmlFor="targetPages"
                  className="mb-1.5 block text-sm font-semibold text-[var(--fg)]"
                >
                  Target Total Halaman Terbaca (2026)
                </label>
                <input
                  id="targetPages"
                  name="targetPages"
                  type="number"
                  min={100}
                  max={100000}
                  step={50}
                  required
                  defaultValue={defaultTargetPages}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-sm font-semibold text-[var(--fg)] focus:border-[#92400E] focus:outline-none"
                />
                <p className="mt-1.5 text-xs text-[var(--fg-muted)]">
                  Rata-rata 1 buku setara dengan 280 hingga 320 halaman literatur.
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-[var(--border)] pt-6 sm:flex-row">
              <div className="flex items-center gap-2 text-xs text-[var(--fg-muted)]">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>
                  Status orientasi saat ini:{" "}
                  <strong className="text-[var(--fg)]">
                    {user.onboardingDone
                      ? "Sudah Diselesaikan (Dapat Diperbarui Kapan Saja)"
                      : "Menunggu Konfirmasi Preferensi"}
                  </strong>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/explore"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-xs font-semibold text-[var(--fg)] transition hover:border-[#92400E]"
                >
                  <Compass className="h-4 w-4" />
                  Lewati ke Katalog
                </Link>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#92400E] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#78350F]"
                >
                  <Sparkles className="h-4 w-4" />
                  Simpan Preferensi & Buka Rekomendasi Personal
                </button>
              </div>
            </div>
          </section>
        </form>
      </div>
    </div>
  );
}
