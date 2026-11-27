import React from "react";
import Link from "next/link";
import {
  Award,
  BookCheck,
  BookOpen,
  Calendar,
  CheckCircle2,
  Flame,
  Save,
  Sparkles,
  Target,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { updateReadingGoalAction } from "@/features/account/actions";

export const dynamic = "force-dynamic";

export default async function ReadingGoalsPage() {
  const sessionUser = await requireAuth("/account/reading-goals");

  const [existingGoal, readingHistories] = await Promise.all([
    prisma.readingGoal.findUnique({
      where: {
        userId_year: {
          userId: sessionUser.id,
          year: 2026,
        },
      },
    }),
    prisma.readingHistory.findMany({
      where: { userId: sessionUser.id },
      include: { book: true },
      orderBy: { startedAt: "desc" },
    }),
  ]);

  const completedHistoryCount = readingHistories.filter(
    (h) => h.status === "completed"
  ).length;
  const historyPagesSum = readingHistories.reduce(
    (sum, h) => sum + Math.max(0, h.pagesRead),
    0
  );

  const goal = existingGoal ?? {
    year: 2026,
    targetBooks: 12,
    targetPages: 3600,
    currentBooks: completedHistoryCount,
    currentPages: historyPagesSum,
    updatedAt: new Date(),
  };

  const bookPct = Math.min(
    100,
    Math.round((goal.currentBooks / Math.max(1, goal.targetBooks)) * 100)
  );
  const pagePct = Math.min(
    100,
    Math.round((goal.currentPages / Math.max(1, goal.targetPages)) * 100)
  );

  const remainingBooks = Math.max(0, goal.targetBooks - goal.currentBooks);
  const remainingPages = Math.max(0, goal.targetPages - goal.currentPages);
  const recommendedDailyPages = Math.max(
    5,
    Math.ceil(remainingPages / 120)
  );

  return (
    <div className="min-h-screen pb-16">
      <PageHeader
        title="Target Baca Tahunan 2026"
        subtitle="Tetapkan sasaran buku dan halaman tahun 2026, pantau bilah pencapaian literasi, dan sesuaikan target kapan saja."
        fallbackHref="/account/profile"
        actions={
          <>
            <Link
              href="/account/history"
              className="inline-flex items-center gap-2 rounded-lg bg-[#92400E] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#78350F]"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Catat Progres di Jurnal</span>
            </Link>
            <Link
              href="/account/profile"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-xs font-semibold text-[var(--fg)] transition-colors hover:border-[#92400E]"
            >
              <Award className="h-3.5 w-3.5 text-[#92400E]" />
              <span>Profil Anggota</span>
            </Link>
          </>
        }
      />

      <main className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-xs">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#92400E]/15 px-3 py-1 text-xs font-bold text-[#92400E] dark:text-amber-300">
                  <BookCheck className="h-3.5 w-3.5" />
                  Target Judul Buku 2026
                </span>
                <h2 className="font-heading mt-3 text-3xl font-bold text-[var(--fg)]">
                  {goal.currentBooks}{" "}
                  <span className="text-lg font-normal text-[var(--fg-muted)]">
                    dari {goal.targetBooks} buku
                  </span>
                </h2>
              </div>
              <div className="text-right">
                <span className="font-heading text-3xl font-bold text-[#92400E] dark:text-amber-300">
                  {bookPct}%
                </span>
                <p className="text-[11px] text-[var(--fg-muted)]">Tercapai</p>
              </div>
            </div>

            <div className="mt-5 h-4 w-full overflow-hidden rounded-full bg-[var(--muted)]">
              <div
                className="h-full rounded-full bg-[#92400E] transition-all"
                style={{ width: `${bookPct}%` }}
              />
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--fg-muted)]">
              <span>
                {remainingBooks > 0
                  ? `Kurang ${remainingBooks} judul buku lagi untuk menuntaskan target 2026`
                  : "Target buku tahun 2026 telah terpenuhi!"}
              </span>
              <span className="font-semibold text-[var(--fg)]">
                ~{Math.max(1, Math.ceil(goal.targetBooks / 12))} buku / bulan
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-xs">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-300">
                  <Flame className="h-3.5 w-3.5" />
                  Target Halaman Terbaca 2026
                </span>
                <h2 className="font-heading mt-3 text-3xl font-bold text-[var(--fg)]">
                  {goal.currentPages.toLocaleString("id-ID")}{" "}
                  <span className="text-lg font-normal text-[var(--fg-muted)]">
                    dari {goal.targetPages.toLocaleString("id-ID")} halaman
                  </span>
                </h2>
              </div>
              <div className="text-right">
                <span className="font-heading text-3xl font-bold text-amber-600 dark:text-amber-400">
                  {pagePct}%
                </span>
                <p className="text-[11px] text-[var(--fg-muted)]">Tercapai</p>
              </div>
            </div>

            <div className="mt-5 h-4 w-full overflow-hidden rounded-full bg-[var(--muted)]">
              <div
                className="h-full rounded-full bg-[#D97706] transition-all"
                style={{ width: `${pagePct}%` }}
              />
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--fg-muted)]">
              <span>
                {remainingPages > 0
                  ? `Sisa ${remainingPages.toLocaleString("id-ID")} halaman untuk mencapai sasaran`
                  : "Target halaman tahun 2026 telah terlampaui!"}
              </span>
              <span className="font-semibold text-[var(--fg)]">
                Rekomendasi: {recommendedDailyPages} hal / hari
              </span>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <form
              action={updateReadingGoalAction}
              className="space-y-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-xs sm:p-8"
            >
              <div className="flex items-center gap-2 border-b border-[var(--border)] pb-4">
                <Target className="h-5 w-5 text-[#92400E]" />
                <div>
                  <h2 className="font-heading text-xl font-bold text-[var(--fg)]">
                    Formulir Penyesuaian Target Baca 2026
                  </h2>
                  <p className="text-xs text-[var(--fg-muted)]">
                    Ubah sasaran jumlah buku, sasaran halaman, maupun realisasi saat ini pada akun Anda.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="targetBooks"
                    className="mb-1.5 block text-xs font-bold uppercase text-[var(--fg)]"
                  >
                    Target Buku Tahun 2026 (`targetBooks`)
                  </label>
                  <input
                    id="targetBooks"
                    name="targetBooks"
                    type="number"
                    min={1}
                    max={200}
                    required
                    defaultValue={goal.targetBooks}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)]/70 px-4 py-2.5 text-sm font-semibold text-[var(--fg)] focus:border-[#92400E]"
                  />
                  <p className="mt-1 text-[11px] text-[var(--fg-muted)]">
                    Disarankan minimal 12 buku (1 buku per bulan).
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="targetPages"
                    className="mb-1.5 block text-xs font-bold uppercase text-[var(--fg)]"
                  >
                    Target Halaman Tahun 2026 (`targetPages`)
                  </label>
                  <input
                    id="targetPages"
                    name="targetPages"
                    type="number"
                    min={100}
                    max={100000}
                    required
                    defaultValue={goal.targetPages}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)]/70 px-4 py-2.5 text-sm font-semibold text-[var(--fg)] focus:border-[#92400E]"
                  />
                  <p className="mt-1 text-[11px] text-[var(--fg-muted)]">
                    Contoh: 3.600 halaman setara ~300 halaman/bulan.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="currentBooks"
                    className="mb-1.5 block text-xs font-bold uppercase text-[var(--fg)]"
                  >
                    Realisasi Buku Selesai (`currentBooks`)
                  </label>
                  <input
                    id="currentBooks"
                    name="currentBooks"
                    type="number"
                    min={0}
                    max={200}
                    required
                    defaultValue={goal.currentBooks}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)]/70 px-4 py-2.5 text-sm font-semibold text-[var(--fg)] focus:border-[#92400E]"
                  />
                  <p className="mt-1 text-[11px] text-[var(--fg-muted)]">
                    Tercatat di Jurnal Bacaan: {completedHistoryCount} buku selesai.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="currentPages"
                    className="mb-1.5 block text-xs font-bold uppercase text-[var(--fg)]"
                  >
                    Realisasi Halaman Terbaca (`currentPages`)
                  </label>
                  <input
                    id="currentPages"
                    name="currentPages"
                    type="number"
                    min={0}
                    max={200000}
                    required
                    defaultValue={goal.currentPages}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)]/70 px-4 py-2.5 text-sm font-semibold text-[var(--fg)] focus:border-[#92400E]"
                  />
                  <p className="mt-1 text-[11px] text-[var(--fg-muted)]">
                    Akumulasi Jurnal Bacaan: {historyPagesSum.toLocaleString("id-ID")} halaman.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-4">
                <span className="inline-flex items-center gap-1.5 text-xs text-[var(--fg-muted)]">
                  <Calendar className="h-3.5 w-3.5 text-[#92400E]" />
                  Periode Evaluasi: Tahun Akademik 2026
                </span>
                <button
                  type="submit"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#92400E] px-6 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#78350F]"
                >
                  <Save className="h-4 w-4" />
                  <span>Simpan Target Baca 2026</span>
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-6 lg:col-span-5">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#92400E]" />
                <h3 className="font-heading text-lg font-bold text-[var(--fg)]">
                  Preset Target Akademik Cepat
                </h3>
              </div>
              <p className="mt-1 text-xs text-[var(--fg-muted)]">
                Terapkan standar target baca populer hanya dengan satu klik:
              </p>

              <div className="mt-4 space-y-3">
                {[
                  {
                    title: "Pembaca Konsisten (1 Buku/Bulan)",
                    books: 12,
                    pages: 3600,
                    desc: "Cocok untuk mahasiswa dengan jadwal kuliah padat.",
                  },
                  {
                    title: "Peneliti Literasi (2 Buku/Bulan)",
                    books: 24,
                    pages: 7200,
                    desc: "Ideal untuk penyusunan skripsi dan kajian pustaka.",
                  },
                  {
                    title: "Bibliophile Akademik (3 Buku/Bulan)",
                    books: 36,
                    pages: 10800,
                    desc: "Tantangan intensif eksplorasi lintas disiplin ilmu.",
                  },
                ].map((preset) => (
                  <form
                    key={preset.title}
                    action={updateReadingGoalAction}
                    className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)]/60 p-3.5"
                  >
                    <input
                      type="hidden"
                      name="targetBooks"
                      value={preset.books}
                    />
                    <input
                      type="hidden"
                      name="targetPages"
                      value={preset.pages}
                    />
                    <input
                      type="hidden"
                      name="currentBooks"
                      value={goal.currentBooks}
                    />
                    <input
                      type="hidden"
                      name="currentPages"
                      value={goal.currentPages}
                    />
                    <div>
                      <p className="text-xs font-bold text-[var(--fg)]">
                        {preset.title}
                      </p>
                      <p className="text-[11px] text-[var(--fg-muted)]">
                        {preset.books} buku &bull;{" "}
                        {preset.pages.toLocaleString("id-ID")} hal &bull;{" "}
                        {preset.desc}
                      </p>
                    </div>
                    <button
                      type="submit"
                      className="shrink-0 cursor-pointer rounded-lg border border-[#92400E] px-3 py-1.5 text-xs font-semibold text-[#92400E] transition-colors hover:bg-[#92400E] hover:text-white dark:text-amber-300"
                    >
                      Pilih
                    </button>
                  </form>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-xs">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-[#92400E]" />
                <h3 className="font-heading text-base font-bold text-[var(--fg)]">
                  Milestone Pencapaian 2026
                </h3>
              </div>

              <ul className="mt-4 space-y-2.5 text-xs">
                {[
                  {
                    label: "Langkah Pertama: 1 Buku Selesai",
                    unlocked: goal.currentBooks >= 1,
                  },
                  {
                    label: "Penjelajah Pustaka: 1.000 Halaman Terbaca",
                    unlocked: goal.currentPages >= 1000,
                  },
                  {
                    label: "Separuh Jalan: 50% Target Buku Tercapai",
                    unlocked: bookPct >= 50,
                  },
                  {
                    label: "Tuntas Paripurna: 100% Target 2026 Selesai",
                    unlocked: bookPct >= 100 && pagePct >= 100,
                  },
                ].map((milestone) => (
                  <li
                    key={milestone.label}
                    className={`flex items-center justify-between rounded-xl border p-3 ${
                      milestone.unlocked
                        ? "border-emerald-600/30 bg-emerald-600/10 text-[var(--fg)]"
                        : "border-[var(--border)] bg-[var(--surface)]/40 text-[var(--fg-muted)]"
                    }`}
                  >
                    <span className="font-semibold">{milestone.label}</span>
                    {milestone.unlocked ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                    ) : (
                      <span className="text-[10px] uppercase">Terkunci</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}