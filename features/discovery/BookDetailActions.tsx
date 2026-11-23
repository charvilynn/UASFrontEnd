"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Heart,
  Copy,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  addToCartQuickAction,
  toggleWishlistQuickAction,
} from "@/features/shared/actions";

interface BookDetailActionsProps {
  bookId: number;
  title: string;
  authorName: string;
  publisherName: string;
  publishYear: number;
  isbn: string;
  pages: number;
  stockAvailable: number;
  inWishlistInitial: boolean;
  sampleExcerpt: string;
  description: string;
}

export function BookDetailActions({
  bookId,
  title,
  authorName,
  publisherName,
  publishYear,
  isbn,
  pages,
  stockAvailable,
  inWishlistInitial,
  sampleExcerpt,
  description,
}: BookDetailActionsProps) {
  const router = useRouter();
  const [inWishlist, setInWishlist] = useState(inWishlistInitial);
  const [synopsisExpanded, setSynopsisExpanded] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [spreadIndex, setSpreadIndex] = useState(0);
  const [copiedCitation, setCopiedCitation] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const spreads = [
    {
      leftTitle: "Halaman Judul & Bibliografi",
      leftBody: `${title}\nKarya: ${authorName}\nPenerbit: ${publisherName} (${publishYear})\nISBN: ${isbn}\nTebal: ${pages} Halaman`,
      rightTitle: "Pengantar Kurator Charvlibrary",
      rightBody: description,
    },
    {
      leftTitle: "Bab I: Kutipan Pembuka",
      leftBody: sampleExcerpt,
      rightTitle: "Catatan Studi & Refleksi",
      rightBody: `Buku "${title}" tersedia di katalog akademik Charvlibrary. Gunakan fitur Keranjang Pinjam untuk meminjam buku fisik atau simpan ke Daftar Keinginan Anda sebagai referensi mata kuliah.`,
    },
  ];

  function handleBorrow() {
    startTransition(async () => {
      const res = await addToCartQuickAction(bookId, 14);
      if (res.needLogin) {
        router.push(`/login?next=${encodeURIComponent(`/books/${bookId}`)}`);
        return;
      }
      setMessage(res.message);
      if (res.ok) {
        router.push("/borrow/checkout");
      }
    });
  }

  function handleWishlist() {
    startTransition(async () => {
      const res = await toggleWishlistQuickAction(bookId);
      if (res.ok) {
        setInWishlist(res.inWishlist);
      }
      setMessage(res.message);
    });
  }

  function handleCopyCitation() {
    const apaCitation = `${authorName}. (${publishYear}). ${title}. ${publisherName}. (ISBN: ${isbn})`;
    navigator.clipboard?.writeText(apaCitation);
    setCopiedCitation(true);
    setTimeout(() => setCopiedCitation(false), 2500);
  }

  return (
    <div className="space-y-6">
      <div className="max-w-[65ch]">
        <p
          className={`text-[15px] leading-[1.7] text-[var(--fg-muted)] ${synopsisExpanded ? "" : "line-clamp-3"
            }`}
        >
          {description}
        </p>
        {description.length > 160 && (
          <button
            type="button"
            onClick={() => setSynopsisExpanded((prev) => !prev)}
            className="mt-1.5 text-xs font-medium text-[var(--primary)] hover:underline"
          >
            {synopsisExpanded ? "Sembunyikan" : "Selengkapnya"}
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-1">
        {stockAvailable > 0 ? (
          <button
            type="button"
            onClick={handleBorrow}
            disabled={isPending}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-[var(--primary)] px-6 text-sm font-medium text-[var(--primary-fg)] transition-colors hover:bg-[var(--primary-hover)] disabled:opacity-60"
          >
            {isPending ? "Memproses..." : "Pinjam Buku"}
          </button>
        ) : (
          <button
            type="button"
            disabled
            className="inline-flex h-11 cursor-not-allowed items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 text-sm font-medium text-[var(--fg-muted)] opacity-75"
          >
            Tidak Tersedia
          </button>
        )}

        <button
          type="button"
          onClick={handleWishlist}
          disabled={isPending}
          aria-label={inWishlist ? "Hapus dari Wishlist" : "Simpan ke Wishlist"}
          title={inWishlist ? "Tersimpan di Wishlist" : "Simpan ke Wishlist"}
          className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border transition-colors ${inWishlist
              ? "border-rose-500/40 bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300"
              : "border-[var(--border)] bg-[var(--card)] text-[var(--fg)] hover:border-[var(--fg-muted)]"
            }`}
        >
          <Heart className={`h-4 w-4 ${inWishlist ? "fill-current" : ""}`} />
        </button>

        <button
          type="button"
          onClick={() => setPreviewOpen(true)}
          data-testid="open-3d-book-preview"
          className="inline-flex h-11 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 text-xs font-medium text-[var(--fg-muted)] transition-colors hover:border-[var(--fg-muted)] hover:text-[var(--fg)]"
        >
          <BookOpen className="h-4 w-4 text-[var(--primary)]" />
          <span>Pratinjau Halaman</span>
        </button>

        <button
          type="button"
          onClick={handleCopyCitation}
          className="inline-flex h-11 items-center gap-1.5 rounded-xl px-3 text-xs font-medium text-[var(--fg-muted)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--fg)]"
        >
          {copiedCitation ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-600" />
              <span>Sitasi Disalin</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Salin Sitasi</span>
            </>
          )}
        </button>
      </div>

      {message && (
        <p
          role="status"
          className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-xs font-medium text-[var(--fg)]"
        >
          {message}
        </p>
      )}

      {previewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-label={`Pratinjau halaman buku ${title}`}
          onClick={() => setPreviewOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-xl sm:p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[var(--primary)]" />
                <span className="font-heading text-sm font-semibold text-[var(--fg)] sm:text-base">
                  Pratinjau Lembar Buku: {title}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                aria-label="Tutup Pratinjau"
                className="rounded-lg p-1.5 text-[var(--fg-muted)] hover:bg-[var(--surface)] hover:text-[var(--fg)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--fg)] md:grid-cols-2">
              <div className="flex flex-col justify-between border-b border-[var(--border)] p-6 sm:p-8 md:border-r md:border-b-0">
                <div>
                  <p className="text-[11px] font-medium tracking-wider uppercase text-[var(--primary)]">
                    {spreads[spreadIndex].leftTitle}
                  </p>
                  <p className="font-heading mt-4 whitespace-pre-line text-sm leading-relaxed text-[var(--fg)] sm:text-base">
                    {spreads[spreadIndex].leftBody}
                  </p>
                </div>
                <p className="mt-6 text-xs text-[var(--fg-muted)]">
                  Halaman {spreadIndex * 2 + 1}
                </p>
              </div>

              <div className="flex flex-col justify-between bg-[var(--surface)]/50 p-6 sm:p-8">
                <div>
                  <p className="text-[11px] font-medium tracking-wider uppercase text-[var(--primary)]">
                    {spreads[spreadIndex].rightTitle}
                  </p>
                  <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-[var(--fg)] sm:text-base">
                    {spreads[spreadIndex].rightBody}
                  </p>
                </div>
                <p className="mt-6 text-right text-xs text-[var(--fg-muted)]">
                  Halaman {spreadIndex * 2 + 2}
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-[var(--fg-muted)]">
              <button
                type="button"
                disabled={spreadIndex === 0}
                onClick={() => setSpreadIndex((i) => Math.max(0, i - 1))}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 font-medium text-[var(--fg)] hover:border-[var(--fg-muted)] disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Lembar Sebelumnya</span>
              </button>
              <span>
                Lembar {spreadIndex + 1} dari {spreads.length}
              </span>
              <button
                type="button"
                disabled={spreadIndex === spreads.length - 1}
                onClick={() =>
                  setSpreadIndex((i) => Math.min(spreads.length - 1, i + 1))
                }
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 font-medium text-[var(--fg)] hover:border-[var(--fg-muted)] disabled:opacity-40"
              >
                <span>Lembar Berikutnya</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}