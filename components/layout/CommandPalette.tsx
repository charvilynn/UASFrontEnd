"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, BookOpen, Search, X } from "lucide-react";

interface BookHit {
  id: number;
  title: string;
  isbn: string;
  publishYear: number;
  coverPath: string | null;
  stockAvailable: number;
  authorName: string;
  categoryName: string;
  accentColor: string;
  href: string;
}

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [bookHits, setBookHits] = useState<BookHit[]>([]);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    }

    function handleCustomOpen() {
      setOpen(true);
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("charv:open-command-palette", handleCustomOpen);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("charv:open-command-palette", handleCustomOpen);
    };
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      const t = window.setTimeout(() => inputRef.current?.focus(), 40);
      return () => {
        window.clearTimeout(t);
        document.body.style.overflow = "";
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const trimmed = query.trim();

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoadingBooks(true);
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal }
        );
        if (res.ok) {
          const data = await res.json();
          setBookHits(Array.isArray(data.books) ? data.books : []);
        }
      } catch {
      } finally {
        setLoadingBooks(false);
      }
    }, 120);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query, open]);

  if (!open) return null;

  function navigateTo(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      navigateTo(`/search?q=${encodeURIComponent(trimmed)}`);
    } else {
      navigateTo("/explore");
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Pencarian Buku Katalog"
      data-testid="command-palette-dialog"
      className="fixed inset-0 flex items-start justify-center bg-black/50 px-4 pt-20 backdrop-blur-xs"
      style={{ zIndex: "var(--z-modal, 50)" }}
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <form
          onSubmit={handleFormSubmit}
          className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-3.5"
        >
          <Search className="h-4 w-4 shrink-0 text-[var(--primary)]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari judul buku, penulis, kategori, atau ISBN..."
            aria-label="Cari judul buku, penulis, kategori, atau ISBN"
            className="w-full bg-transparent text-sm text-[var(--fg)] placeholder:text-[var(--fg-subtle)] focus:outline-none"
          />
          {query.trim().length > 0 && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="rounded-lg px-2 py-1 text-xs text-[var(--fg-muted)] hover:bg-[var(--muted)]"
            >
              Hapus
            </button>
          )}
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Tutup pencarian buku"
            className="rounded-lg p-1 text-[var(--fg-muted)] hover:bg-[var(--muted)]"
          >
            <X className="h-4 w-4" />
          </button>
        </form>

        <div className="max-h-[60vh] overflow-y-auto p-3">
          <div className="mb-2 flex items-center justify-between px-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--fg-subtle)]">
            <span>
              {query.trim()
                ? `Hasil Pencarian Buku (${bookHits.length})`
                : "Koleksi Buku Pilihan"}
            </span>
            {loadingBooks && <span>Mencari...</span>}
          </div>

          {bookHits.length === 0 && !loadingBooks ? (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)]/60 px-4 py-6 text-center">
              <p className="text-sm font-semibold text-[var(--fg)]">
                Buku tidak ditemukan
              </p>
              <p className="mt-1 text-xs text-[var(--fg-muted)]">
                Tidak ada judul buku, penulis, atau ISBN yang cocok dengan &ldquo;{query.trim()}&rdquo;.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {bookHits.map((b) => {
                const isAvailable = b.stockAvailable > 0;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => navigateTo(`/books/${b.id}`)}
                    className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-[var(--muted)]"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-8 shrink-0 items-center justify-center overflow-hidden rounded border border-[var(--border)] bg-[var(--surface)]">
                        {b.coverPath ? (
                          <img
                            src={b.coverPath}
                            alt={b.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <BookOpen className="h-4 w-4 text-[var(--primary)]" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-xs font-semibold text-[var(--fg)]">
                          {b.title}
                        </div>
                        <div className="truncate text-[11px] text-[var(--fg-muted)]">
                          {b.authorName} · {b.categoryName} · {b.publishYear}
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          isAvailable
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                            : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200"
                        }`}
                      >
                        {isAvailable ? "Tersedia" : "Tidak Tersedia"}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-[var(--fg-subtle)]" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-[var(--border)] bg-[var(--surface)]/60 px-4 py-2.5 text-xs">
          <span className="text-[var(--fg-muted)]">
            Tekan Enter untuk melihat hasil lengkap
          </span>
          <button
            type="button"
            onClick={() =>
              navigateTo(
                query.trim()
                  ? `/search?q=${encodeURIComponent(query.trim())}`
                  : "/search"
              )
            }
            className="inline-flex items-center gap-1 font-semibold text-[var(--primary)] hover:underline"
          >
            <span>Pencarian Lanjutan</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}