import Link from "next/link";
import {
  Calendar,
  UserCheck,
  FileText,
  ArrowLeft,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { GeneratedBookCover } from "@/components/books/GeneratedBookCover";
import { EmptyState } from "@/components/ui/EmptyState";
import { confirmCheckoutAction } from "@/features/borrowing/actions";

function formatFullDate(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default async function BorrowCheckoutPage() {
  const user = await requireAuth("/borrow/checkout");

  const [cartItems, activeLoansCount] = await Promise.all([
    prisma.borrowCartItem.findMany({
      where: { userId: user.id },
      include: {
        book: {
          include: {
            publisher: true,
            authors: { include: { author: true } },
            categories: { include: { category: true } },
          },
        },
      },
      orderBy: { addedAt: "asc" },
    }),
    prisma.loan.count({
      where: {
        userId: user.id,
        status: { in: ["borrowed", "overdue"] },
      },
    }),
  ]);

  const maxQuota = 5;
  const remainingQuota = Math.max(0, maxQuota - activeLoansCount);
  const eligibleItems = cartItems
    .filter((item) => item.book.stockAvailable > 0)
    .slice(0, remainingQuota);

  const now = new Date();

  return (
    <div className="min-h-screen pb-16">
      <PageHeader
        title="Checkout Peminjaman Buku"
        subtitle="Verifikasi daftar buku yang akan dipinjam, tinjau perhitungan tanggal jatuh tempo otomatis, dan konfirmasi transaksi sirkulasi Anda."
        fallbackHref="/cart"
        actions={
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3.5 py-2 text-xs font-semibold text-[var(--fg)] transition-colors hover:border-[#92400E]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali ke Keranjang</span>
          </Link>
        }
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {eligibleItems.length === 0 ? (
          <EmptyState
            title="Tidak Ada Buku Siap Checkout"
            description="Keranjang pinjam Anda masih kosong atau kuota peminjaman aktif Anda (maksimal 5 buku) telah penuh."
            actionLabel="Periksa Keranjang Pinjam"
            actionHref="/cart"
            secondaryActionLabel="Jelajahi Katalog Buku"
            secondaryActionHref="/explore"
          />
        ) : (
          <form
            action={confirmCheckoutAction}
            className="grid grid-cols-1 gap-8 lg:grid-cols-3"
          >
            <div className="space-y-6 lg:col-span-2">
              <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-xs">
                <div className="flex items-center gap-2.5">
                  <UserCheck className="h-5 w-5 text-[#92400E]" />
                  <h2 className="font-heading text-lg font-bold text-[var(--fg)]">
                    Identitas Anggota Peminjam
                  </h2>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)]/60 p-4 text-xs sm:grid-cols-3">
                  <div>
                    <span className="text-[var(--fg-muted)]">Nama Lengkap</span>
                    <p className="mt-0.5 font-semibold text-[var(--fg)]">
                      {user.name}
                    </p>
                  </div>
                  <div>
                    <span className="text-[var(--fg-muted)]">Nomor Anggota</span>
                    <p className="mt-0.5 font-mono font-semibold text-[#92400E] dark:text-amber-400">
                      {user.memberCode}
                    </p>
                  </div>
                  <div>
                    <span className="text-[var(--fg-muted)]">
                      Fakultas / Surel
                    </span>
                    <p className="mt-0.5 font-semibold text-[var(--fg)]">
                      {user.faculty || user.email}
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-xs">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <Calendar className="h-5 w-5 text-[#92400E]" />
                    <h2 className="font-heading text-lg font-bold text-[var(--fg)]">
                      Rincian Buku & Perhitungan Jatuh Tempo ({eligibleItems.length}{" "}
                      Judul)
                    </h2>
                  </div>
                  <span className="text-xs font-medium text-[var(--fg-muted)]">
                    Tanggal Pinjam: {formatFullDate(now)}
                  </span>
                </div>

                <div className="mt-4 divide-y divide-[var(--border)]">
                  {eligibleItems.map((item, idx) => {
                    const primaryAuthor =
                      item.book.authors[0]?.author.name || "Penulis Koleksi";
                    const primaryCategory =
                      item.book.categories[0]?.category.name || "Literatur";
                    const accentColor =
                      item.book.categories[0]?.category.accentColor || "#92400E";
                    const dueDate = new Date(
                      now.getTime() + item.durationDays * 24 * 60 * 60 * 1000
                    );

                    return (
                      <div
                        key={item.id}
                        className="flex flex-col gap-4 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center"
                      >
                        <div className="w-20 shrink-0">
                          <GeneratedBookCover
                            title={item.book.title}
                            author={primaryAuthor}
                            category={primaryCategory}
                            accentColor={accentColor}
                            coverPath={item.book.coverPath}
                            publishYear={item.book.publishYear}
                            className="w-full aspect-[2/3]"
                          />
                        </div>

                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded bg-[#92400E]/15 px-2 py-0.5 text-[11px] font-semibold text-[#92400E] dark:text-amber-300">
                              Buku #{idx + 1}
                            </span>
                            <span className="text-xs text-[var(--fg-muted)]">
                              ISBN: {item.book.isbn}
                            </span>
                          </div>

                          <h3 className="mt-1 font-heading text-base font-bold text-[var(--fg)]">
                            <Link
                              href={`/books/${item.book.id}`}
                              className="hover:underline"
                            >
                              {item.book.title}
                            </Link>
                          </h3>
                          <p className="text-xs text-[var(--fg-muted)]">
                            {primaryAuthor} &bull; {item.book.publisher.name} (
                            {item.book.publishYear})
                          </p>
                        </div>

                        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs sm:w-64 dark:border-amber-900/60 dark:bg-amber-950/40">
                          <div className="flex items-center justify-between">
                            <span className="text-[var(--fg-muted)]">
                              Durasi Pinjam:
                            </span>
                            <strong className="text-[#92400E] dark:text-amber-300">
                              {item.durationDays} Hari
                            </strong>
                          </div>
                          <div className="mt-1.5 border-t border-amber-200/80 pt-1.5 dark:border-amber-800/60">
                            <span className="block text-[11px] text-[var(--fg-muted)]">
                              Wajib Kembali Sebelum:
                            </span>
                            <strong className="text-[var(--fg)]">
                              {formatFullDate(dueDate)}
                            </strong>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-xs">
                <div className="flex items-center gap-2.5">
                  <FileText className="h-5 w-5 text-[#92400E]" />
                  <h2 className="font-heading text-lg font-bold text-[var(--fg)]">
                    Catatan Peminjaman (Opsional)
                  </h2>
                </div>
                <p className="mt-1 text-xs text-[var(--fg-muted)]">
                  Tambahkan catatan keperluan akademik (misal: referensi skripsi,
                  tugas kelompok, atau bacaan mandiri). Catatan ini akan tercetak
                  pada tiket resi digital Anda.
                </p>
                <textarea
                  name="notes"
                  rows={3}
                  placeholder="Contoh: Digunakan untuk referensi mata kuliah Metode Penelitian..."
                  className="mt-3 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-xs text-[var(--fg)]"
                />
              </section>
            </div>

          </form>
        )}
      </div>
    </div>
  );
}