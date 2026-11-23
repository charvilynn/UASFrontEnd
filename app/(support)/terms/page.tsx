import React from "react";
import Link from "next/link";
import {
  Scale,
  BookCheck,
  Clock,
  Receipt,
  MessageSquareQuote,
  Shield,
  HelpCircle,
  Mail,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";

export default function TermsPage() {
  return (
    <div className="pb-16">
      <PageHeader
        title="Syarat, Ketentuan & Tata Tertib Sirkulasi"
        subtitle="Pedoman resmi keanggotaan, hak dan kewajiban peminjaman koleksi, etika ulasan komunitas, serta pelindungan privasi akun Charvlibrary."
        fallbackHref="/about"
        actions={
          <>
            <Link
              href="/help"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3.5 py-2 text-xs font-semibold text-[var(--fg)] hover:border-[#92400E]"
            >
              <HelpCircle className="h-4 w-4 text-[#92400E] dark:text-amber-400" />
              <span>Pusat Bantuan</span>
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

      <div className="mx-auto max-w-5xl space-y-6 px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-[#92400E]/30 bg-[var(--surface)] p-5 text-sm text-[var(--fg)]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-2 font-bold text-[#92400E] dark:text-amber-300">
              <Scale className="h-4 w-4" />
              <span>Dokumen Tata Tertib Akademik Charvlibrary v2.4 (Edisi 2026)</span>
            </span>
            <span className="text-xs text-[var(--fg-muted)]">
              Berlaku bagi seluruh Mahasiswa, Dosen, & Pustakawan
            </span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-[var(--fg-muted)]">
            Dengan mendaftarkan akun di{" "}
            <Link href="/register" className="font-semibold underline">
              Halaman Pendaftaran
            </Link>{" "}
            atau melakukan transaksi peminjaman buku, setiap pengguna menyetujui seluruh butir tata tertib di bawah ini demi menjaga kelestarian koleksi ilmu pengetahuan bersama.
          </p>
        </div>

        <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
          <div className="flex items-center gap-3 border-b border-[var(--border)] pb-3.5">
            <BookCheck className="h-5 w-5 text-[#92400E] dark:text-amber-400" />
            <h2 className="font-heading text-lg font-bold text-[var(--fg)]">
              Pasal 1: Hak & Kewajiban Anggota Perpustakaan
            </h2>
          </div>

          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-[var(--fg-muted)]">
            <li>
              Setiap anggota terdaftar memperoleh <strong>Kartu Anggota Digital</strong> dengan nomor identitas unik (format <code>CLB-2026-XXXX</code>) yang dapat dilihat di halaman{" "}
              <Link href="/account/profile" className="font-semibold text-[var(--fg)] underline">
                Profil & Kartu Anggota
              </Link>
              .
            </li>
            <li>
              Anggota berhak meminjam koleksi buku, menyimpan buku incaran di{" "}
              <Link href="/wishlist" className="font-semibold text-[var(--fg)] underline">
                Daftar Keinginan
              </Link>
              , mendaftar kegiatan literasi di{" "}
              <Link href="/events" className="font-semibold text-[var(--fg)] underline">
                Acara & Kegiatan
              </Link>
              , serta berdiskusi di{" "}
              <Link href="/blog" className="font-semibold text-[var(--fg)] underline">
                Jurnal Literasi
              </Link>
              .
            </li>
            <li>
              Anggota wajib menjaga keutuhan fisik maupun integritas metadata koleksi buku serta tidak memindahtangankan akun kepada pihak lain.
            </li>
          </ul>
        </section>

        <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
          <div className="flex items-center gap-3 border-b border-[var(--border)] pb-3.5">
            <Clock className="h-5 w-5 text-[#92400E] dark:text-amber-400" />
            <h2 className="font-heading text-lg font-bold text-[var(--fg)]">
              Pasal 2: Kuota Pinjam, Tenggat Waktu & Perpanjangan
            </h2>
          </div>

          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-[var(--fg-muted)]">
            <li>
              Batas maksimal peminjaman aktif pada saat bersamaan adalah <strong>5 (lima) eksemplar buku</strong> untuk setiap anggota.
            </li>
            <li>
              Durasi peminjaman standar dapat dipilih saat checkout di{" "}
              <Link href="/cart" className="font-semibold text-[var(--fg)] underline">
                Keranjang Pinjam
              </Link>
              : <strong>7 hari</strong>, <strong>14 hari (standar)</strong>, atau <strong>21 hari</strong> untuk referensi tugas akhir.
            </li>
            <li>
              Perpanjangan masa pinjam dapat dilakukan secara mandiri melalui{" "}
              <Link href="/borrow/returns" className="font-semibold text-[var(--fg)] underline">
                Pengembalian & Perpanjangan
              </Link>{" "}
              sebanyak maksimal <strong>2 kali</strong> (@ 7 hari per perpanjangan) sebelum tanggal jatuh tempo terlewati.
            </li>
          </ul>
        </section>

        <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
          <div className="flex items-center gap-3 border-b border-[var(--border)] pb-3.5">
            <Receipt className="h-5 w-5 text-[#92400E] dark:text-amber-400" />
            <h2 className="font-heading text-lg font-bold text-[var(--fg)]">
              Pasal 3: Pemeliharaan Koleksi & Ketepatan Pengembalian
            </h2>
          </div>

          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-[var(--fg-muted)]">
            <li>
              Setiap anggota wajib mengembalikan buku yang dipinjam tepat waktu agar dapat segera digunakan oleh anggota sivitas akademika lainnya.
            </li>
            <li>
              Selama sebuah buku sedang dipinjam, status buku di katalog akan berubah menjadi <strong>Tidak Tersedia</strong> hingga buku tersebut dikembalikan.
            </li>
            <li>
              Status peminjaman aktif dan tenggat waktu pengembalian dapat dipantau setiap saat melalui halaman{" "}
              <Link href="/account/borrowed" className="font-semibold text-[var(--fg)] underline">
                Buku yang Sedang Dipinjam
              </Link>
              .
            </li>
          </ul>
        </section>

        <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
          <div className="flex items-center gap-3 border-b border-[var(--border)] pb-3.5">
            <MessageSquareQuote className="h-5 w-5 text-[#92400E] dark:text-amber-400" />
            <h2 className="font-heading text-lg font-bold text-[var(--fg)]">
              Pasal 4: Etika Ulasan Komunitas & Penambahan Katalog
            </h2>
          </div>

          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-[var(--fg-muted)]">
            <li>
              Ulasan buku di halaman{" "}
              <Link href="/reviews" className="font-semibold text-[var(--fg)] underline">
                Ulasan & Rating
              </Link>{" "}
              serta diskusi di{" "}
              <Link href="/blog" className="font-semibold text-[var(--fg)] underline">
                Jurnal & Artikel
              </Link>{" "}
              wajib menggunakan bahasa yang santun, objektif, dan menghargai karya ilmiah maupun fiksi.
            </li>
            <li>
              Jika ulasan mengandung bocoran alur cerita penting, pengulas wajib mencentang penanda <strong>Spoiler</strong> agar kenyamanan pembaca lain terjaga.
            </li>
            <li>
              Usulan pengadaan koleksi baru melalui{" "}
              <Link href="/contact" className="font-semibold text-[var(--fg)] underline">
                Hubungi Pustakawan
              </Link>{" "}
              akan ditinjau oleh tim kurasi berdasarkan kebutuhan akademik semester berjalan.
            </li>
          </ul>
        </section>

        <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
          <div className="flex items-center gap-3 border-b border-[var(--border)] pb-3.5">
            <Shield className="h-5 w-5 text-[#92400E] dark:text-amber-400" />
            <h2 className="font-heading text-lg font-bold text-[var(--fg)]">
              Pasal 5: Keamanan Sesi & Privasi Data Akun
            </h2>
          </div>

          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-[var(--fg-muted)]">
            <li>
              Kata sandi pengguna disimpan dalam bentuk terenkripsi satu arah dan tidak pernah ditampilkan dalam bentuk teks terbuka.
            </li>
            <li>
              Anggota dapat memantau perangkat yang sedang masuk serta mencabut sesi aktif kapan saja melalui halaman{" "}
              <Link href="/account/security" className="font-semibold text-[var(--fg)] underline">
                Keamanan & Sesi
              </Link>{" "}
              dan{" "}
              <Link href="/account/login-history" className="font-semibold text-[var(--fg)] underline">
                Riwayat Login
              </Link>
              .
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}