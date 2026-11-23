import Link from "next/link";
import {
  BookCopy,
  CheckCircle2,
  Clock,
  Edit3,
  GraduationCap,
  Mail,
  Phone,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { PageHeader } from "@/components/layout/PageHeader";
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
        </section>
      </main>
    </div>
  );
}