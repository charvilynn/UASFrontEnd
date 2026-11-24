import Link from "next/link";
import {
  Award,
  BookCheck,
  BookOpen,
  Flame,
  Target,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { PageHeader } from "@/components/layout/PageHeader";

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

      </main>
    </div>
  );
}