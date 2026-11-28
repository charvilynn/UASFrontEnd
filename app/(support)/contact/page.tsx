// Halaman: Hubungi Pustakawan & Usulan Pengadaan Buku | Pemilik: Olivian | Pilar 6: Manajemen Buku, Dukungan & Admin

import React from "react";
import Link from "next/link";
import {
  Send,
  CheckCircle2,
  MapPin,
  Clock,
  Phone,
  HelpCircle,
  MessageSquare,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { submitContactMessageAction } from "@/features/support/actions";

interface ContactPageProps {
  searchParams: Promise<{
    ticket?: string;
    error?: string;
  }>;
}

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const resolvedParams = await searchParams;
  const createdTicketNumber = resolvedParams.ticket;
  const errorMessage = resolvedParams.error;

  const [user, recentTickets] = await Promise.all([
    getSessionUser(),
    prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  return (
    <div className="pb-16">
      <PageHeader
        title="Hubungi Pustakawan & Usulan Buku"
        subtitle="Sampaikan pertanyaan layanan sirkulasi, usulan pengadaan literatur baru, atau laporan teknis langsung kepada tim pustakawan."
        fallbackHref="/help"
        actions={
          <Link
            href="/faq"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3.5 py-2 text-xs font-semibold text-[var(--fg)] hover:border-[#92400E]"
          >
            <HelpCircle className="h-4 w-4 text-[#92400E] dark:text-amber-400" />
            <span>Lihat FAQ</span>
          </Link>
        }
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {createdTicketNumber && (
          <div className="mb-8 flex items-start gap-3 rounded-2xl border border-emerald-300 bg-emerald-50 p-5 text-emerald-950 shadow-sm dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-200">
            <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600" />
            <div>
              <h2 className="font-heading text-base font-bold">
                Tiket Pesan Berhasil Diterbitkan: {createdTicketNumber}
              </h2>
              <p className="mt-1 text-sm">
                Terima kasih! Pesan Anda telah diterima dengan nomor resi{" "}
                <strong className="font-mono">{createdTicketNumber}</strong>. Pustakawan akan meninjau dan membalas tiket Anda melalui halaman ini.
              </p>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 rounded-xl border border-red-300 bg-red-50 p-4 text-sm font-medium text-red-900 dark:border-red-800/60 dark:bg-red-950/50 dark:text-red-200">
            {errorMessage}
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Kolom Kiri: Formulir Kirim Tiket (7 Kolom) */}
          <div className="lg:col-span-7">
            <form
              action={submitContactMessageAction}
              className="space-y-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm sm:p-8"
            >
              <div className="border-b border-[var(--border)] pb-4">
                <h2 className="font-heading text-xl font-bold text-[var(--fg)]">
                  Formulir Tiket Bantuan & Usulan Koleksi
                </h2>
                <p className="mt-1 text-xs text-[var(--fg-muted)]">
                  Setiap pengiriman akan memperoleh kode tiket unik berformat TCK-2026-XXXX.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block text-sm font-semibold text-[var(--fg)]"
                  >
                    Nama Lengkap <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    required
                    minLength={2}
                    defaultValue={user?.name || ""}
                    placeholder="Nama mahasiswa / dosen"
                    className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--fg)]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-email"
                    className="block text-sm font-semibold text-[var(--fg)]"
                  >
                    Alamat Email Akademik <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    required
                    defaultValue={user?.email || ""}
                    placeholder="nama@charvlibrary.ac.id"
                    className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--fg)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="contact-category"
                    className="block text-sm font-semibold text-[var(--fg)]"
                  >
                    Kategori Layanan
                  </label>
                  <select
                    id="contact-category"
                    name="category"
                    defaultValue="Usulan Pengadaan Buku"
                    className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--fg)]"
                  >
                    <option value="Usulan Pengadaan Buku">
                      Usulan Pengadaan Buku Baru
                    </option>
                    <option value="Sirkulasi & Peminjaman">
                      Sirkulasi & Peminjaman
                    </option>
                    <option value="Perpanjangan & Pengembalian">
                      Perpanjangan & Pengembalian Buku
                    </option>
                    <option value="Kendala Akun & OTP">
                      Kendala Akun & Verifikasi OTP
                    </option>
                    <option value="Pertanyaan Umum">Pertanyaan Umum</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="contact-subject"
                    className="block text-sm font-semibold text-[var(--fg)]"
                  >
                    Subjek Pesan <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="contact-subject"
                    name="subject"
                    type="text"
                    required
                    minLength={4}
                    placeholder="Mis. Usulan Buku Sistem Terdistribusi"
                    className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--fg)]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="block text-sm font-semibold text-[var(--fg)]"
                >
                  Rincian Pesan / Detail Buku yang Diusulkan (Minimal 15 karakter){" "}
                  <span className="text-red-600">*</span>
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={5}
                  required
                  minLength={15}
                  placeholder="Tuliskan judul buku, nama penulis, ISBN, atau rincian pertanyaan Anda secara jelas..."
                  className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--fg)]"
                />
              </div>

              <div className="flex items-center justify-between border-t border-[var(--border)] pt-4">
                <p className="text-xs text-[var(--fg-muted)]">
                  Waktu respons rata-rata: 1x24 jam hari kerja akademik.
                </p>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#92400E] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#78350F]"
                >
                  <Send className="h-4 w-4" />
                  <span>Kirim Tiket ke Pustakawan</span>
                </button>
              </div>
            </form>
          </div>

          {/* Kolom Kanan: Info Meja Layanan & Daftar Tiket Terbaru (5 Kolom) */}
          <div className="space-y-6 lg:col-span-5">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
              <h2 className="font-heading text-lg font-bold text-[var(--fg)]">
                Meja Layanan Sirkulasi Charvlibrary
              </h2>
              <p className="mt-1 text-xs text-[var(--fg-muted)]">
                Kunjungi langsung ruang baca utama atau hubungi saluran resmi berikut:
              </p>

              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#92400E] dark:text-amber-400" />
                  <div>
                    <p className="font-semibold text-[var(--fg)]">
                      Gedung Pusat Literasi & Riset Kampus Utama, Lantai 2
                    </p>
                    <p className="text-xs text-[var(--fg-muted)]">
                      Jl. Akademika Raya No. 45, Jakarta Barat
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#92400E] dark:text-amber-400" />
                  <div>
                    <p className="font-semibold text-[var(--fg)]">
                      Jam Operasional Layanan Tatap Muka
                    </p>
                    <p className="text-xs text-[var(--fg-muted)]">
                      Senin - Jumat: 08.00 - 20.00 WIB | Sabtu: 09.00 - 16.00 WIB
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#92400E] dark:text-amber-400" />
                  <div>
                    <p className="font-semibold text-[var(--fg)]">
                      Telepon & Saluran Sirkulasi
                    </p>
                    <p className="text-xs text-[var(--fg-muted)]">
                      (021) 5589-2026 ext. 104 • pustakawan@charvlibrary.ac.id
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Daftar Tiket Terbaru & Balasan Pustakawan */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-[#92400E] dark:text-amber-400" />
                  <h2 className="font-heading text-base font-bold text-[var(--fg)]">
                    Riwayat Tiket & Balasan Terbaru
                  </h2>
                </div>
                <span className="text-xs text-[var(--fg-muted)]">
                  {recentTickets.length} Tiket
                </span>
              </div>

              <div className="space-y-3.5">
                {recentTickets.map((t) => {
                  const isReplied = Boolean(t.adminReply);
                  return (
                    <div
                      key={t.id}
                      className="rounded-xl border border-[var(--border)] bg-[var(--surface)]/70 p-3.5 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono font-bold text-[#92400E] dark:text-amber-300">
                          {t.ticketNumber}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${isReplied
                            ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
                            : "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200"
                            }`}
                        >
                          {isReplied ? "Telah Dibalas" : "Dalam Antrean"}
                        </span>
                      </div>

                      <p className="mt-1.5 font-semibold text-[var(--fg)]">
                        {t.subject}
                      </p>
                      <p className="mt-0.5 text-[var(--fg-muted)]">
                        Oleh {t.name} • {t.category}
                      </p>
                      <p className="mt-1.5 line-clamp-2 text-[var(--fg)]">
                        {t.message}
                      </p>

                      {t.adminReply && (
                        <div className="mt-2.5 rounded-lg border border-emerald-300/70 bg-[var(--card)] p-2.5 text-emerald-950 dark:border-emerald-800/50 dark:text-emerald-200">
                          <span className="font-bold">Balasan Pustakawan: </span>
                          <span>{t.adminReply}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
