import React from "react";
import Link from "next/link";
import {
  BookOpen,
  PlusCircle,
  Search,
  Clock,
  HelpCircle,
  Mail,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";

export default async function HelpCenterPage() {
  const [topFaqs, totalBooks, totalCategories] = await Promise.all([
    prisma.faq.findMany({
      orderBy: [{ helpfulYes: "desc" }, { sortOrder: "asc" }],
      take: 4,
    }),
    prisma.book.count(),
    prisma.category.count(),
  ]);

  return (
    <div className="pb-16">
      <PageHeader
        title="Pusat Bantuan Terpadu"
        subtitle={`Panduan lengkap penggunaan layanan sirkulasi, usulan pengadaan buku baru, pencarian cepat katalog, dan ketentuan peminjaman di Charvlibrary (${totalBooks} buku dalam ${totalCategories} kategori).`}
        fallbackHref="/"
        actions={
          <>
            <Link
              href="/faq"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3.5 py-2 text-xs font-semibold text-[var(--fg)] hover:border-[#92400E]"
            >
              <HelpCircle className="h-4 w-4 text-[#92400E] dark:text-amber-400" />
              <span>Tanya Jawab (FAQ)</span>
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-lg bg-[#92400E] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#78350F]"
            >
              <Mail className="h-4 w-4" />
              <span>Hubungi Pustakawan</span>
            </Link>
          </>
        }
      />

      <div className="mx-auto max-w-7xl space-y-10 px-4 sm:px-6 lg:px-8">
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="flex flex-col justify-between rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#92400E]/15 text-[#92400E] dark:text-amber-300">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold tracking-wider uppercase text-[#92400E] dark:text-amber-300">
                    Panduan Sirkulasi #1
                  </span>
                  <h2 className="font-heading text-lg font-bold text-[var(--fg)]">
                    Cara Meminjam & Mengembalikan Buku
                  </h2>
                </div>
              </div>

              <ol className="space-y-2.5 text-sm text-[var(--fg-muted)]">
                <li className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--surface)] text-xs font-bold text-[#92400E] dark:text-amber-300">
                    1
                  </span>
                  <span>
                    Masuk ke akun anggota melalui halaman{" "}
                    <Link
                      href="/login"
                      className="font-semibold text-[var(--fg)] underline"
                    >
                      Masuk Akun
                    </Link>{" "}
                    atau daftar sebagai anggota baru terlebih dahulu.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--surface)] text-xs font-bold text-[#92400E] dark:text-amber-300">
                    2
                  </span>
                  <span>
                    Pilih buku di{" "}
                    <Link
                      href="/explore"
                      className="font-semibold text-[var(--fg)] underline"
                    >
                      Eksplorasi Katalog
                    </Link>{" "}
                    lalu klik tombol masukkan ke{" "}
                    <Link
                      href="/cart"
                      className="font-semibold text-[var(--fg)] underline"
                    >
                      Keranjang Pinjam
                    </Link>
                    .
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--surface)] text-xs font-bold text-[#92400E] dark:text-amber-300">
                    3
                  </span>
                  <span>
                    Tentukan durasi pinjam (7, 14, atau 21 hari) dan selesaikan konfirmasi di{" "}
                    <Link
                      href="/borrow/checkout"
                      className="font-semibold text-[var(--fg)] underline"
                    >
                      Checkout Peminjaman
                    </Link>{" "}
                    untuk mendapatkan resi digital.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--surface)] text-xs font-bold text-[#92400E] dark:text-amber-300">
                    4
                  </span>
                  <span>
                    Kembalikan buku atau perpanjang masa pinjam 7 hari secara mandiri di halaman{" "}
                    <Link
                      href="/borrow/returns"
                      className="font-semibold text-[var(--fg)] underline"
                    >
                      Pengembalian & Perpanjangan
                    </Link>
                    .
                  </span>
                </li>
              </ol>
            </div>

            <div className="mt-5 flex flex-wrap gap-2 border-t border-[var(--border)] pt-4">
              <Link
                href="/explore"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#92400E] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#78350F]"
              >
                <span>Mulai Pinjam Buku</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/borrow/returns"
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 text-xs font-semibold text-[var(--fg)] hover:border-[#92400E]"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Halaman Pengembalian</span>
              </Link>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#92400E]/15 text-[#92400E] dark:text-amber-300">
                  <PlusCircle className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold tracking-wider uppercase text-[#92400E] dark:text-amber-300">
                    Panduan Koleksi #2
                  </span>
                  <h2 className="font-heading text-lg font-bold text-[var(--fg)]">
                    Cara Mengusulkan Pengadaan Buku Baru
                  </h2>
                </div>
              </div>

              <ol className="space-y-2.5 text-sm text-[var(--fg-muted)]">
                <li className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--surface)] text-xs font-bold text-[#92400E] dark:text-amber-300">
                    1
                  </span>
                  <span>
                    Buka halaman{" "}
                    <Link
                      href="/contact"
                      className="font-semibold text-[var(--fg)] underline"
                    >
                      Hubungi Pustakawan
                    </Link>{" "}
                    dan pilih kategori layanan Usulan Pengadaan Buku.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--surface)] text-xs font-bold text-[#92400E] dark:text-amber-300">
                    2
                  </span>
                  <span>
                    Sertakan judul buku, nama penulis, penerbit, atau nomor ISBN referensi mata kuliah yang Anda butuhkan.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--surface)] text-xs font-bold text-[#92400E] dark:text-amber-300">
                    3
                  </span>
                  <span>
                    Tim kurasi akan meninjau usulan Anda dan menambahkan koleksi terpilih ke katalog perpustakaan.
                  </span>
                </li>
              </ol>
            </div>

            <div className="mt-5 flex flex-wrap gap-2 border-t border-[var(--border)] pt-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#92400E] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#78350F]"
              >
                <Mail className="h-3.5 w-3.5" />
                <span>Kirim Usulan Buku</span>
              </Link>
              <Link
                href="/collections"
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 text-xs font-semibold text-[var(--fg)] hover:border-[#92400E]"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Lihat Koleksi Kurasi</span>
              </Link>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#92400E]/15 text-[#92400E] dark:text-amber-300">
                  <Search className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold tracking-wider uppercase text-[#92400E] dark:text-amber-300">
                    Panduan Navigasi #3
                  </span>
                  <h2 className="font-heading text-lg font-bold text-[var(--fg)]">
                    Pintasan Command Palette (Ctrl+K)
                  </h2>
                </div>
              </div>

              <p className="text-sm text-[var(--fg-muted)]">
                Charvlibrary dilengkapi fitur pencarian instan koleksi buku:
              </p>

              <ul className="mt-3 space-y-2 text-sm text-[var(--fg-muted)]">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#92400E] dark:text-amber-400" />
                  <span>
                    Tekan kombinasi tombol{" "}
                    <kbd className="rounded border border-[var(--border)] bg-[var(--surface)] px-1.5 py-0.5 font-mono text-xs font-bold text-[var(--fg)]">
                      Ctrl + K
                    </kbd>{" "}
                    (atau{" "}
                    <kbd className="rounded border border-[var(--border)] bg-[var(--surface)] px-1.5 py-0.5 font-mono text-xs font-bold text-[var(--fg)]">
                      Cmd + K
                    </kbd>
                    ) dari halaman mana saja.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#92400E] dark:text-amber-400" />
                  <span>
                    Ketik judul buku, nama penulis, atau nomor ISBN untuk mencari koleksi buku secara langsung.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#92400E] dark:text-amber-400" />
                  <span>
                    Klik salah satu buku dari daftar hasil pencarian untuk membuka halaman detail buku tersebut.
                  </span>
                </li>
              </ul>
            </div>

            <div className="mt-5 flex flex-wrap gap-2 border-t border-[var(--border)] pt-4">
              <Link
                href="/search"
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 text-xs font-semibold text-[var(--fg)] hover:border-[#92400E]"
              >
                <Search className="h-3.5 w-3.5" />
                <span>Buka Pencarian Lanjutan</span>
              </Link>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#92400E]/15 text-[#92400E] dark:text-amber-300">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold tracking-wider uppercase text-[#92400E] dark:text-amber-300">
                    Panduan Ketertiban #4
                  </span>
                  <h2 className="font-heading text-lg font-bold text-[var(--fg)]">
                    Ketentuan Kuota & Tenggat Peminjaman
                  </h2>
                </div>
              </div>

              <ul className="space-y-2.5 text-sm text-[var(--fg-muted)]">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#92400E] dark:text-amber-400" />
                  <span>
                    Setiap anggota dapat meminjam hingga <strong>5 buku aktif</strong> secara bersamaan.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#92400E] dark:text-amber-400" />
                  <span>
                    Perpanjangan mandiri dapat dilakukan <strong>maksimal 2 kali</strong> (@ 7 hari tambahan) selama buku belum melewati tenggat waktu.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#92400E] dark:text-amber-400" />
                  <span>
                    Buku yang sedang dipinjam otomatis berstatus <strong>Tidak Tersedia</strong> di katalog hingga dikembalikan.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#92400E] dark:text-amber-400" />
                  <span>
                    Harap menjaga kerapian fisik buku dan mengembalikannya tepat waktu demi kenyamanan bersama.
                  </span>
                </li>
              </ul>
            </div>

            <div className="mt-5 flex flex-wrap gap-2 border-t border-[var(--border)] pt-4">
              <Link
                href="/account/borrowed"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#92400E] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#78350F]"
              >
                <Clock className="h-3.5 w-3.5" />
                <span>Pantau Pinjaman Aktif</span>
              </Link>
              <Link
                href="/terms"
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 text-xs font-semibold text-[var(--fg)] hover:border-[#92400E]"
              >
                <span>Baca Tata Tertib Lengkap</span>
              </Link>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm sm:p-8">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-heading text-xl font-bold text-[var(--fg)]">
                Pertanyaan yang Paling Sering Diajukan
              </h2>
              <p className="text-xs text-[var(--fg-muted)]">
                Diambil dari basis pengetahuan Tanya Jawab (FAQ) Charvlibrary
              </p>
            </div>
            <Link
              href="/faq"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#92400E] hover:underline dark:text-amber-300"
            >
              <span>Buka Halaman FAQ Interaktif</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {topFaqs.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface)]/70 p-4"
              >
                <span className="inline-block rounded bg-[var(--card)] px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase text-[#92400E] dark:text-amber-300">
                  {item.category}
                </span>
                <h3 className="font-heading mt-2 text-sm font-bold text-[var(--fg)]">
                  {item.question}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-[var(--fg-muted)]">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}