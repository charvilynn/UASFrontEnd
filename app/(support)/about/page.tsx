import React from "react";
import Link from "next/link";
import {
  BookOpen,
  Layers,
  Feather,
  Library,
  Calendar,
  Users,
  Compass,
  Scale,
  Sparkles,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";

interface TeamMemberProfile {
  fullName: string;
  roleTitle: string;
  focusTitle: string;
  summary: string;
  accentBg: string;
}

const TEAM_MEMBERS: TeamMemberProfile[] = [
  {
    fullName: "Davvin Denielsen Fusta",
    roleTitle: "Katalog & Eksplorasi Koleksi",
    focusTitle: "Penjelajahan Katalog & Koleksi Kurasi",
    summary:
      "Mengembangkan pengalaman halaman beranda, eksplorasi katalog buku, pencarian lanjutan, kurasi buku populer, direktori kategori, serta tampilan detail koleksi.",
    accentBg: "#92400E",
  },
  {
    fullName: "Liviana Winata",
    roleTitle: "Autentikasi & Keamanan Akun",
    focusTitle: "Akses Anggota & Keamanan Sesi",
    summary:
      "Menangani pendaftaran anggota perpustakaan, autentikasi akun, pemulihan kata sandi melalui verifikasi kode OTP, orientasi minat baca, serta pengelolaan sesi perangkat.",
    accentBg: "#B45309",
  },
  {
    fullName: "Chandra Wijaya",
    roleTitle: "Profil Anggota & Riwayat Bacaan",
    focusTitle: "Kartu Anggota & Jurnal Bacaan",
    summary:
      "Merancang kartu identitas anggota digital, pemantauan pinjaman aktif, catatan riwayat buku yang telah selesai dibaca, target literasi tahunan, serta pusat notifikasi.",
    accentBg: "#0F766E",
  },
  {
    fullName: "Aaron Valerio Lieputra",
    roleTitle: "Sirkulasi Peminjaman & Ulasan",
    focusTitle: "Layanan Peminjaman & Apresiasi Pembaca",
    summary:
      "Membangun alur keranjang pinjam, konfirmasi peminjaman, bukti transaksi peminjaman, pengembalian serta perpanjangan mandiri, daftar keinginan, dan ulasan pembaca.",
    accentBg: "#1E40AF",
  },
  {
    fullName: "Aurelia Cheryl Claresta",
    roleTitle: "Jurnal Literasi & Kegiatan Kampus",
    focusTitle: "Redaksi Jurnal, Penulis & Acara",
    summary:
      "Menghadirkan artikel jurnal literasi beserta ruang diskusi pembaca, direktori profil penulis Nusantara dan dunia, jadwal kegiatan bedah buku, serta tanya jawab layanan.",
    accentBg: "#7C3AED",
  },
  {
    fullName: "Olivian Cerlindo",
    roleTitle: "Manajemen Koleksi & Layanan Pustakawan",
    focusTitle: "Pengelolaan Katalog & Pusat Bantuan",
    summary:
      "Menyediakan layanan pengelolaan katalog perpustakaan, pemantauan sirkulasi pustakawan, pengajuan buku baru, pusat bantuan anggota, serta tata tertib perpustakaan.",
    accentBg: "#065F46",
  },
];

export default async function AboutPage() {
  const [
    booksCount,
    categoriesCount,
    authorsCount,
    collectionsCount,
    eventsCount,
    usersCount,
  ] = await Promise.all([
    prisma.book.count(),
    prisma.category.count(),
    prisma.author.count(),
    prisma.collection.count(),
    prisma.event.count(),
    prisma.user.count(),
  ]);

  return (
    <div className="pb-16">
      <PageHeader
        title="Tentang Charvlibrary"
        subtitle="Ruang baca akademik yang memadukan katalog literatur terkurasi, kemudahan layanan peminjaman buku, dan kegiatan literasi kampus."
        fallbackHref="/"
        actions={
          <>
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 rounded-lg bg-[#92400E] px-4 py-2 text-xs font-semibold text-white hover:bg-[#78350F]"
            >
              <Compass className="h-4 w-4" />
              <span>Jelajahi Katalog</span>
            </Link>
            <Link
              href="/terms"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-xs font-semibold text-[var(--fg)] hover:border-[#92400E]"
            >
              <Scale className="h-4 w-4 text-[#92400E] dark:text-amber-400" />
              <span>Syarat & Ketentuan</span>
            </Link>
          </>
        }
      />

      <div className="mx-auto max-w-7xl space-y-12 px-4 sm:px-6 lg:px-8">
        <section className="grid grid-cols-1 gap-8 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm sm:p-8 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-7">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#92400E]/15 px-3 py-1 text-xs font-bold tracking-wider uppercase text-[#92400E] dark:text-amber-300">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Visi & Filosofi Ruang Baca</span>
            </span>

            <h2 className="font-heading text-2xl font-bold text-[var(--fg)] sm:text-3xl">
              Menghadirkan Suasana Ruang Baca Klasik yang Hangat, Tenang, dan Terbuka bagi Sivitas Akademika
            </h2>

            <p className="text-sm leading-relaxed text-[var(--fg-muted)] sm:text-base">
              Charvlibrary hadir sebagai pusat literasi kampus yang dirancang untuk mendukung kebutuhan riset, perkuliahan, maupun pengembangan diri mahasiswa dan dosen. Dengan suasana visual bernuansa hangat dan tipografi yang ramah mata, pembaca dapat menelusuri koleksi buku secara nyaman.
            </p>

            <p className="text-sm leading-relaxed text-[var(--fg-muted)] sm:text-base">
              Mulai dari karya sastra klasik Indonesia, filsafat, sejarah, psikologi, hingga rekayasa perangkat lunak dan sains modern, setiap koleksi dikurasi agar mudah ditemukan, dipinjam, dan didiskusikan bersama melalui jurnal literasi serta kegiatan bedah buku kampus.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:col-span-5">
            <div className="flex flex-col justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)]/70 p-4">
              <BookOpen className="h-5 w-5 text-[#92400E] dark:text-amber-400" />
              <div className="mt-3">
                <p className="font-heading text-2xl font-bold text-[var(--fg)]">
                  {booksCount}
                </p>
                <p className="text-xs font-medium text-[var(--fg-muted)]">
                  Judul Buku Koleksi
                </p>
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)]/70 p-4">
              <Layers className="h-5 w-5 text-[#92400E] dark:text-amber-400" />
              <div className="mt-3">
                <p className="font-heading text-2xl font-bold text-[var(--fg)]">
                  {categoriesCount}
                </p>
                <p className="text-xs font-medium text-[var(--fg-muted)]">
                  Kategori Keilmuan
                </p>
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)]/70 p-4">
              <Feather className="h-5 w-5 text-[#92400E] dark:text-amber-400" />
              <div className="mt-3">
                <p className="font-heading text-2xl font-bold text-[var(--fg)]">
                  {authorsCount}
                </p>
                <p className="text-xs font-medium text-[var(--fg-muted)]">
                  Penulis Nusantara & Dunia
                </p>
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)]/70 p-4">
              <Library className="h-5 w-5 text-[#92400E] dark:text-amber-400" />
              <div className="mt-3">
                <p className="font-heading text-2xl font-bold text-[var(--fg)]">
                  {collectionsCount}
                </p>
                <p className="text-xs font-medium text-[var(--fg-muted)]">
                  Koleksi Kurasi Tematik
                </p>
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)]/70 p-4">
              <Calendar className="h-5 w-5 text-[#92400E] dark:text-amber-400" />
              <div className="mt-3">
                <p className="font-heading text-2xl font-bold text-[var(--fg)]">
                  {eventsCount}
                </p>
                <p className="text-xs font-medium text-[var(--fg-muted)]">
                  Agenda Kegiatan Literasi
                </p>
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)]/70 p-4">
              <Users className="h-5 w-5 text-[#92400E] dark:text-amber-400" />
              <div className="mt-3">
                <p className="font-heading text-2xl font-bold text-[var(--fg)]">
                  {usersCount}
                </p>
                <p className="text-xs font-medium text-[var(--fg-muted)]">
                  Anggota Terdaftar
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div>
            <h2 className="font-heading text-2xl font-bold text-[var(--fg)]">
              Tim Pengembang Charvlibrary
            </h2>
            <p className="mt-1 text-sm text-[var(--fg-muted)]">
              Kolaborasi tim dalam menghadirkan pengalaman eksplorasi katalog, sirkulasi peminjaman, dan layanan perpustakaan kampus.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {TEAM_MEMBERS.map((item) => (
              <div
                key={item.fullName}
                className="flex flex-col justify-between rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white shadow-sm"
                      style={{ backgroundColor: item.accentBg }}
                    >
                      {item.fullName
                        .split(" ")
                        .slice(0, 2)
                        .map((w) => w[0])
                        .join("")
                        .toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-heading text-lg font-bold text-[var(--fg)]">
                        {item.fullName}
                      </h3>
                      <p className="text-xs font-medium text-[var(--fg-muted)]">
                        {item.roleTitle}
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 text-xs font-bold tracking-wider uppercase text-[#92400E] dark:text-amber-300">
                    {item.focusTitle}
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-[var(--fg-muted)]">
                    {item.summary}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
