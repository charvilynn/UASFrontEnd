import Link from "next/link";
import {
  Bell,
  BookCopy,
  BookOpen,
  CheckCircle2,
  Clock,
  Edit3,
  GraduationCap,
  Heart,
  Mail,
  MessageSquareQuote,
  Phone,
  Shield,
  Sparkles,
  Target,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { GeneratedBookCover } from "@/components/books/GeneratedBookCover";
import { EmptyState } from "@/components/ui/EmptyState";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const sessionUser = await requireAuth("/account/profile");

  const member = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    include: {
      preferences: {
        include: {
          category: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
      loans: {
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
        },
        orderBy: {
          borrowedAt: "desc",
        },
      },
      readingHistory: {
        include: {
          book: true,
        },
        orderBy: {
          startedAt: "desc",
        },
      },
      reviews: {
        orderBy: {
          createdAt: "desc",
        },
      },
      wishlists: {
        orderBy: {
          createdAt: "desc",
        },
      },
      readingGoals: {
        where: { year: 2026 },
      },
      notifications: {
        where: { isRead: false },
        orderBy: { createdAt: "desc" },
        take: 4,
      },
    },
  });

  if (!member) {
    return (
      <div className="min-h-screen pb-16">
        <PageHeader
          title="Profil & Kartu Anggota"
          subtitle="Kartu anggota digital Charvlibrary dan ringkasan aktivitas"
          fallbackHref="/"
        />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <EmptyState
            title="Data Anggota Tidak Ditemukan"
            description="Sesi akun Anda tidak dapat dimuat. Silakan masuk kembali untuk mengakses kartu anggota digital."
            actionLabel="Masuk Kembali"
            actionHref="/login"
          />
        </div>
      </div>
    );
  }

  const activeLoans = member.loans.filter(
    (loan) => loan.status === "borrowed" || loan.status === "overdue"
  );
  const completedReadings = member.readingHistory.filter(
    (item) => item.status === "completed"
  );
  const goal2026 = member.readingGoals[0] ?? {
    targetBooks: 12,
    targetPages: 3600,
    currentBooks: completedReadings.length,
    currentPages: member.readingHistory.reduce(
      (sum, item) => sum + item.pagesRead,
      0
    ),
  };

  const cardAccent = member.avatarColor || "#92400E";
  const initials = member.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const joinedDateFormatted = member.createdAt.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const bookGoalPercent = Math.min(
    100,
    Math.round(
      (goal2026.currentBooks / Math.max(1, goal2026.targetBooks)) * 100
    )
  );

  return (
    <div className="min-h-screen pb-16">
      <PageHeader
        title="Profil & Kartu Anggota"
        subtitle="Kartu anggota perpustakaan digital Charvlibrary, preferensi genre, statistik literasi, dan navigasi akun."
        fallbackHref="/"
        actions={
          <>
            <Link
              href="/account/edit-profile"
              className="inline-flex items-center gap-2 rounded-lg bg-[#92400E] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#78350F]"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Edit Profil</span>
            </Link>
            <Link
              href="/account/borrowed"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-xs font-semibold text-[var(--fg)] transition-colors hover:border-[#92400E]"
            >
              <BookCopy className="h-3.5 w-3.5 text-[#92400E]" />
              <span>Pinjaman Saya</span>
            </Link>
          </>
        }
      />

      <main className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div
              className="relative overflow-hidden rounded-2xl border border-amber-200/30 p-6 text-[#FFFBEB] shadow-lg sm:p-8"
              style={{
                background: `linear-gradient(135deg, ${cardAccent} 0%, #251A13 65%, #1C1410 100%)`,
              }}
            >
              <div
                className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full border border-amber-200/15 bg-amber-400/5"
                aria-hidden="true"
              />
              <div
                className="pointer-events-none absolute right-8 bottom-6 h-28 w-28 rounded-full border border-amber-200/10"
                aria-hidden="true"
              />

              <div className="relative z-10 flex flex-wrap items-start justify-between gap-4 border-b border-amber-100/20 pb-5">
                <div>
                  <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-amber-200/90">
                    Charvlibrary Academic Press &amp; Archive
                  </p>
                  <h2 className="font-heading mt-1 text-xl font-bold tracking-tight text-[#FFFBEB] sm:text-2xl">
                    Kartu Anggota Perpustakaan Digital
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  {member.isVerified ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/40 bg-emerald-950/60 px-3 py-1 text-xs font-semibold text-emerald-200">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      Terverifikasi
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/40 bg-amber-950/60 px-3 py-1 text-xs font-semibold text-amber-200">
                      <Clock className="h-3.5 w-3.5 text-amber-300" />
                      Menunggu Verifikasi
                    </span>
                  )}
                  <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-wider uppercase text-amber-100">
                    {member.role === "admin" ? "Pustakawan" : "Anggota Aktif"}
                  </span>
                </div>
              </div>

              <div className="relative z-10 mt-6 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                <div className="flex items-start gap-4">
                  <div
                    className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-2 border-amber-200/60 text-xl font-bold text-[#FFFBEB] shadow-inner sm:h-20 sm:w-20 sm:text-2xl"
                    style={{ backgroundColor: cardAccent }}
                  >
                    {initials || "CH"}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-amber-200/80">
                      Nama Pemegang Kartu
                    </p>
                    <p className="font-heading text-xl font-bold text-white sm:text-2xl">
                      {member.name}
                    </p>
                    <p className="inline-flex items-center gap-1.5 text-xs text-amber-100/90">
                      <GraduationCap className="h-4 w-4 text-amber-300" />
                      <span>
                        {member.faculty || "Fakultas Ilmu Budaya & Literasi"}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-amber-100/20 bg-black/30 px-4 py-3 backdrop-blur-xs">
                  <p className="text-[10px] font-semibold tracking-widest uppercase text-amber-200/75">
                    Nomor Induk Anggota
                  </p>
                  <p className="mt-0.5 font-mono text-lg font-bold tracking-wider text-amber-300">
                    {member.memberCode}
                  </p>
                  <p className="mt-1 text-[11px] text-amber-100/70">
                    Terdaftar: {joinedDateFormatted}
                  </p>
                </div>
              </div>

              <div className="relative z-10 mt-6 rounded-xl border border-amber-100/15 bg-black/20 p-4">
                <p className="text-xs leading-relaxed text-amber-50/90">
                  {member.bio ||
                    "Anggota aktif komunitas literasi akademik Charvlibrary yang gemar mengeksplorasi khazanah pustaka Nusantara dan ilmu pengetahuan lintas disiplin."}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-4 border-t border-amber-100/15 pt-3 text-xs text-amber-100/85">
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-amber-300" />
                    {member.email}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-amber-300" />
                    {member.phone || "+62 812-3456-7890"}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      className="inline-block h-3 w-3 rounded-full border border-white/60"
                      style={{ backgroundColor: cardAccent }}
                    />
                    Warna Kartu: {cardAccent.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="relative z-10 mt-5 flex items-center justify-between gap-4 pt-1">
                <div className="text-[11px] text-amber-200/75">
                  Gunakan kartu ini untuk peminjaman mandiri dan akses ruang baca kampus.
                </div>
                <svg
                  className="h-8 w-36 shrink-0 text-amber-100/85"
                  viewBox="0 0 160 32"
                  role="img"
                  aria-label={`Kode batang anggota ${member.memberCode}`}
                >
                  {[
                    2, 6, 9, 14, 18, 21, 27, 31, 35, 40, 44, 49, 53, 58, 62, 67,
                    72, 76, 81, 85, 90, 95, 99, 104, 108, 113, 118, 122, 127,
                    131, 136, 141, 146, 150, 155,
                  ].map((x, idx) => (
                    <rect
                      key={x}
                      x={x}
                      y={2}
                      width={idx % 3 === 0 ? 3 : idx % 2 === 0 ? 2 : 1}
                      height={28}
                      fill="currentColor"
                    />
                  ))}
                </svg>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-6 lg:col-span-5">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-xs">
              <div>
                <h3 className="font-heading text-lg font-bold text-[var(--fg)]">
                  Akses Cepat Layanan Anggota
                </h3>
              </div>
              <p className="mt-1 text-xs text-[var(--fg-muted)]">
                Kelola biodata, sirkulasi pinjaman, target literasi, dan keamanan sesi akun.
              </p>

              <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <Link
                  href="/account/edit-profile"
                  className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)]/60 p-3 text-left transition-colors hover:border-[#92400E]"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#92400E]/15 text-[#92400E] dark:text-amber-300">
                    <Edit3 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[var(--fg)]">
                      Edit Profil
                    </p>
                    <p className="text-[11px] text-[var(--fg-muted)]">
                      Biodata &amp; warna kartu
                    </p>
                  </div>
                </Link>

                <Link
                  href="/account/history"
                  className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)]/60 p-3 text-left transition-colors hover:border-[#92400E]"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#92400E]/15 text-[#92400E] dark:text-amber-300">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[var(--fg)]">
                      Riwayat Bacaan
                    </p>
                    <p className="text-[11px] text-[var(--fg-muted)]">
                      {member.readingHistory.length} entri jurnal baca
                    </p>
                  </div>
                </Link>

                <Link
                  href="/account/borrowed"
                  className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)]/60 p-3 text-left transition-colors hover:border-[#92400E]"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#92400E]/15 text-[#92400E] dark:text-amber-300">
                    <BookCopy className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[var(--fg)]">
                      Buku Dipinjam
                    </p>
                    <p className="text-[11px] text-[var(--fg-muted)]">
                      {activeLoans.length} pinjaman berjalan
                    </p>
                  </div>
                </Link>

                <Link
                  href="/wishlist"
                  className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)]/60 p-3 text-left transition-colors hover:border-[#92400E]"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#92400E]/15 text-[#92400E] dark:text-amber-300">
                    <Heart className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[var(--fg)]">
                      Daftar Keinginan
                    </p>
                    <p className="text-[11px] text-[var(--fg-muted)]">
                      {member.wishlists.length} buku disimpan
                    </p>
                  </div>
                </Link>

                <Link
                  href="/account/security"
                  className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)]/60 p-3 text-left transition-colors hover:border-[#92400E]"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#92400E]/15 text-[#92400E] dark:text-amber-300">
                    <Shield className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[var(--fg)]">
                      Keamanan &amp; Sesi
                    </p>
                    <p className="text-[11px] text-[var(--fg-muted)]">
                      Sandi &amp; perangkat aktif
                    </p>
                  </div>
                </Link>

                <Link
                  href="/account/reading-goals"
                  className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)]/60 p-3 text-left transition-colors hover:border-[#92400E]"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#92400E]/15 text-[#92400E] dark:text-amber-300">
                    <Target className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[var(--fg)]">
                      Target Baca 2026
                    </p>
                    <p className="text-[11px] text-[var(--fg-muted)]">
                      Progres {bookGoalPercent}% tercapai
                    </p>
                  </div>
                </Link>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border)] pt-3 text-xs">
                <Link
                  href="/account/history"
                  className="font-semibold text-[#92400E] hover:underline dark:text-amber-300"
                >
                  Lihat Riwayat Bacaan ({member.readingHistory.length})
                </Link>
                <Link
                  href="/account/notifications"
                  className="inline-flex items-center gap-1 font-semibold text-[#92400E] hover:underline dark:text-amber-300"
                >
                  <Bell className="h-3.5 w-3.5" />
                  <span>
                    Notifikasi ({member.notifications.length} belum dibaca)
                  </span>
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-xs">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#92400E] dark:text-amber-400" />
                  <h3 className="font-heading text-base font-bold text-[var(--fg)]">
                    Preferensi Genre &amp; Minat Baca
                  </h3>
                </div>
                <Link
                  href="/onboarding"
                  className="text-xs font-semibold text-[#92400E] hover:underline dark:text-amber-300"
                >
                  Atur Minat
                </Link>
              </div>

              {member.preferences.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {member.preferences.map((pref) => (
                    <Link
                      key={pref.id}
                      href={`/explore?category=${encodeURIComponent(pref.category.slug)}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs font-semibold text-[var(--fg)] transition-colors hover:border-[#92400E]"
                    >
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{
                          backgroundColor:
                            pref.category.accentColor || "#92400E",
                        }}
                      />
                      <span>{pref.category.name}</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)]/50 p-3">
                  <p className="text-xs text-[var(--fg-muted)]">
                    Anda belum memilih kategori bacaan favorit untuk personalisasi katalog.
                  </p>
                  <Link
                    href="/onboarding"
                    className="shrink-0 rounded-lg bg-[#92400E] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#78350F]"
                  >
                    Pilih Genre
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>

        <section aria-label="Statistik Ringkas Anggota">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wider uppercase text-[var(--fg-muted)]">
                  Pinjaman Aktif
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#92400E]/15 text-[#92400E] dark:text-amber-300">
                  <BookCopy className="h-4 w-4" />
                </div>
              </div>
              <p className="font-heading mt-3 text-3xl font-bold text-[var(--fg)]">
                {activeLoans.length}
              </p>
              <p className="mt-1 text-xs text-[var(--fg-muted)]">
                Dari total {member.loans.length} riwayat transaksi pinjam
              </p>
              <Link
                href="/account/borrowed"
                className="mt-3 inline-block text-xs font-semibold text-[#92400E] hover:underline dark:text-amber-300"
              >
                Kelola Pinjaman &rarr;
              </Link>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wider uppercase text-[var(--fg-muted)]">
                  Buku Selesai Dibaca
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600/15 text-emerald-700 dark:text-emerald-300">
                  <BookOpen className="h-4 w-4" />
                </div>
              </div>
              <p className="font-heading mt-3 text-3xl font-bold text-[var(--fg)]">
                {completedReadings.length}
              </p>
              <p className="mt-1 text-xs text-[var(--fg-muted)]">
                Total{" "}
                {member.readingHistory
                  .reduce((sum, item) => sum + item.pagesRead, 0)
                  .toLocaleString("id-ID")}{" "}
                halaman tercatat
              </p>
              <Link
                href="/account/history"
                className="mt-3 inline-block text-xs font-semibold text-[#92400E] hover:underline dark:text-amber-300"
              >
                Buka Jurnal Baca &rarr;
              </Link>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wider uppercase text-[var(--fg-muted)]">
                  Ulasan Ditulis
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-300">
                  <MessageSquareQuote className="h-4 w-4" />
                </div>
              </div>
              <p className="font-heading mt-3 text-3xl font-bold text-[var(--fg)]">
                {member.reviews.length}
              </p>
              <p className="mt-1 text-xs text-[var(--fg-muted)]">
                Kontribusi apresiasi literasi di katalog
              </p>
              <Link
                href="/reviews"
                className="mt-3 inline-block text-xs font-semibold text-[#92400E] hover:underline dark:text-amber-300"
              >
                Lihat Ulasan Komunitas &rarr;
              </Link>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wider uppercase text-[var(--fg-muted)]">
                  Daftar Keinginan
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/15 text-blue-700 dark:text-blue-300">
                  <Heart className="h-4 w-4" />
                </div>
              </div>
              <p className="font-heading mt-3 text-3xl font-bold text-[var(--fg)]">
                {member.wishlists.length}
              </p>
              <p className="mt-1 text-xs text-[var(--fg-muted)]">
                Koleksi buku yang disimpan untuk dipinjam nanti
              </p>
              <Link
                href="/wishlist"
                className="mt-3 inline-block text-xs font-semibold text-[#92400E] hover:underline dark:text-amber-300"
              >
                Kelola Daftar Keinginan &rarr;
              </Link>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-xs lg:col-span-7">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-4">
              <div>
                <h3 className="font-heading text-lg font-bold text-[var(--fg)]">
                  Pinjaman Buku Saat Ini
                </h3>
                <p className="text-xs text-[var(--fg-muted)]">
                  Buku yang sedang berada dalam masa pinjam Anda
                </p>
              </div>
              <Link
                href="/account/borrowed"
                className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-[var(--fg)] hover:border-[#92400E]"
              >
                Lihat Semua ({activeLoans.length})
              </Link>
            </div>

            {activeLoans.length > 0 ? (
              <div className="mt-4 space-y-4">
                {(() => {
                  const nowMs = new Date().getTime();
                  return activeLoans.slice(0, 3).map((loan) => {
                  const primaryAuthor =
                    loan.book.authors[0]?.author.name ?? "Penulis Charvlibrary";
                  const primaryCategory =
                    loan.book.categories[0]?.category.name ?? "Literatur";
                  const diffDays = Math.ceil(
                    (loan.dueDate.getTime() - nowMs) /
                      (1000 * 60 * 60 * 24)
                  );
                  const isOverdue =
                    loan.status === "overdue" || diffDays < 0;

                  return (
                    <div
                      key={loan.id}
                      className="flex flex-col justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)]/50 p-4 sm:flex-row sm:items-center"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 shrink-0">
                          <GeneratedBookCover
                            title={loan.book.title}
                            author={primaryAuthor}
                            category={primaryCategory}
                            coverPath={loan.book.coverPath}
                            publishYear={loan.book.publishYear}
                            className="w-14 aspect-[2/3]"
                          />
                        </div>
                        <div>
                          <span className="font-mono text-[11px] font-semibold text-[#92400E] dark:text-amber-300">
                            {loan.loanCode}
                          </span>
                          <Link
                            href={`/books/${loan.book.id}`}
                            className="font-heading block text-base font-bold text-[var(--fg)] hover:text-[#92400E]"
                          >
                            {loan.book.title}
                          </Link>
                          <p className="text-xs text-[var(--fg-muted)]">
                            {primaryAuthor} &bull; {loan.book.pages} halaman
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            isOverdue
                              ? "bg-red-600/15 text-red-700 dark:text-red-300"
                              : "bg-emerald-600/15 text-emerald-700 dark:text-emerald-300"
                          }`}
                        >
                          {isOverdue
                            ? `Terlambat ${Math.abs(diffDays)} hari`
                            : `Sisa ${diffDays} hari`}
                        </span>
                        <Link
                          href="/account/borrowed"
                          className="text-xs font-semibold text-[#92400E] hover:underline dark:text-amber-300"
                        >
                          Perpanjang / Kembalikan
                        </Link>
                      </div>
                    </div>
                  );
                  });
                })()}
              </div>
            ) : (
              <EmptyState
                title="Tidak Ada Pinjaman Aktif"
                description="Anda sedang tidak meminjam buku fisik maupun digital saat ini. Jelajahi katalog untuk mulai meminjam."
                actionLabel="Eksplorasi Katalog"
                actionHref="/explore"
                secondaryActionLabel="Lihat Riwayat Bacaan"
                secondaryActionHref="/account/history"
              />
            )}
          </div>

        </section>
      </main>
    </div>
  );
}