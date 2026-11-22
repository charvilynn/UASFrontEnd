"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { SlidersHorizontal, X } from "lucide-react";

interface CategoryOption {
  id: number;
  name: string;
  slug: string;
}

interface ExploreFilterDrawerProps {
  q: string;
  categorySlug: string;
  language: string;
  onlyAvailable: boolean;
  sort: string;
  categories: CategoryOption[];
  activeFilterCount: number;
}

export function ExploreFilterDrawerClient({
  q,
  categorySlug,
  language,
  onlyAvailable,
  sort,
  categories,
  activeFilterCount,
}: ExploreFilterDrawerProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        data-testid="explore-filter-drawer-button"
        className="inline-flex h-10 items-center gap-2 rounded-xl border border-[var(--border-strong)] bg-[var(--card)] px-4 text-xs font-semibold text-[var(--fg)] transition-colors hover:border-[var(--primary)]"
      >
        <SlidersHorizontal className="h-3.5 w-3.5 text-[var(--primary)]" />
        <span>Filter</span>
        {activeFilterCount > 0 && (
          <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--primary)] px-1 text-[10px] font-bold text-white">
            {activeFilterCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Filter Katalog Buku"
          data-testid="explore-filter-drawer"
          className="fixed inset-0 flex justify-end bg-black/45 backdrop-blur-xs"
          style={{ zIndex: "var(--z-overlay, 40)" }}
          onClick={() => setOpen(false)}
        >
          <div
            className="flex h-full w-full max-w-md flex-col border-l border-[var(--border)] bg-[var(--bg)] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
              <div>
                <h2 className="font-serif text-lg font-semibold text-[var(--fg)]">
                  Filter Katalog
                </h2>
                <p className="text-xs text-[var(--fg-muted)]">
                  Saring berdasarkan kategori, bahasa, dan ketersediaan.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Tutup laci filter"
                className="rounded-lg p-1.5 text-[var(--fg-muted)] hover:bg-[var(--muted)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              action="/explore"
              method="get"
              className="mt-6 flex flex-1 flex-col justify-between space-y-6 overflow-y-auto"
            >
              <div className="space-y-5">
                {q && <input type="hidden" name="q" value={q} />}
                {sort && <input type="hidden" name="sort" value={sort} />}

                <div>
                  <label
                    htmlFor="drawer-category"
                    className="mb-1.5 block text-xs font-semibold text-[var(--fg)]"
                  >
                    Kategori Literatur
                  </label>
                  <select
                    id="drawer-category"
                    name="category"
                    defaultValue={categorySlug}
                    className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--fg)] focus:border-[var(--primary)] focus:outline-none"
                  >
                    <option value="">Semua Kategori ({categories.length})</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.slug}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="drawer-language"
                    className="mb-1.5 block text-xs font-semibold text-[var(--fg)]"
                  >
                    Bahasa Pengantar
                  </label>
                  <select
                    id="drawer-language"
                    name="lang"
                    defaultValue={language}
                    className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--fg)] focus:border-[var(--primary)] focus:outline-none"
                  >
                    <option value="">Semua Bahasa</option>
                    <option value="Indonesia">Bahasa Indonesia</option>
                    <option value="English">Bahasa Inggris (English)</option>
                  </select>
                </div>

                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-3.5 text-xs font-medium text-[var(--fg)]">
                  <input
                    type="checkbox"
                    name="available"
                    value="1"
                    defaultChecked={onlyAvailable}
                    className="h-4 w-4 rounded accent-[var(--primary)]"
                  />
                  <span>Hanya tampilkan buku yang stoknya tersedia</span>
                </label>
              </div>

              <div className="flex items-center gap-3 border-t border-[var(--border)] pt-4">
                <Link
                  href="/explore"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] py-2.5 text-center text-xs font-semibold text-[var(--fg)] hover:border-[var(--primary)]"
                >
                  Atur Ulang
                </Link>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-[var(--primary)] py-2.5 text-xs font-semibold text-[var(--primary-fg)] hover:bg-[var(--primary-hover)]"
                >
                  Terapkan Filter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}