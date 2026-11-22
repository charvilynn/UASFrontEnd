"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookPlus,
  Upload,
  RefreshCw,
  CheckCircle2,
  UserPlus,
  Building2,
  Layers,
  Image as ImageIcon,
  FileText,
  Info,
} from "lucide-react";
import { GeneratedBookCover } from "@/components/books/GeneratedBookCover";
import { createBookAction } from "./actions";

export interface AuthorOption {
  id: number;
  name: string;
  nationality: string;
}

export interface CategoryOption {
  id: number;
  name: string;
  slug: string;
  accentColor: string;
}

export interface PublisherOption {
  id: number;
  name: string;
  city: string | null;
}

interface NewBookFormClientProps {
  authors: AuthorOption[];
  categories: CategoryOption[];
  publishers: PublisherOption[];
  errorMessage?: string;
}

function generateUniqueIsbn13(): string {
  const block1 = Math.floor(1000 + Math.random() * 9000);
  const block2 = Math.floor(10 + Math.random() * 89);
  const check = Math.floor(Math.random() * 10);
  return `978-602-${block1}-${block2}-${check}`;
}

export function NewBookFormClient({
  authors,
  categories,
  publishers,
  errorMessage,
}: NewBookFormClientProps) {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [useNewAuthor, setUseNewAuthor] = useState(false);
  const [selectedAuthorId, setSelectedAuthorId] = useState<number>(
    authors[0]?.id ?? 0
  );
  const [newAuthorName, setNewAuthorName] = useState("");
  const [newAuthorNationality, setNewAuthorNationality] = useState("Indonesia");

  const [useNewPublisher, setUseNewPublisher] = useState(false);
  const [selectedPublisherId, setSelectedPublisherId] = useState<number>(
    publishers[0]?.id ?? 0
  );
  const [newPublisherName, setNewPublisherName] = useState("");
  const [newPublisherCity, setNewPublisherCity] = useState("Jakarta");

  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>(
    categories[0] ? [categories[0].id] : []
  );

  const [publishYear, setPublishYear] = useState<number>(2025);
  const [isbn, setIsbn] = useState<string>("978-602-8421-55-3");
  const [language, setLanguage] = useState<string>("Indonesia");
  const [pages, setPages] = useState<number>(264);
  const [stockTotal, setStockTotal] = useState<number>(4);
  const [description, setDescription] = useState<string>("");
  const [sampleExcerpt, setSampleExcerpt] = useState<string>("");
  const [isFeatured, setIsFeatured] = useState<boolean>(false);

  const [previewObjectUrl, setPreviewObjectUrl] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    return () => {
      if (previewObjectUrl) {
        URL.revokeObjectURL(previewObjectUrl);
      }
    };
  }, [previewObjectUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (previewObjectUrl) {
      URL.revokeObjectURL(previewObjectUrl);
    }
    if (file && file.size > 0) {
      const url = URL.createObjectURL(file);
      setPreviewObjectUrl(url);
      setSelectedFileName(`${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
    } else {
      setPreviewObjectUrl(null);
      setSelectedFileName(null);
    }
  };

  const toggleCategory = (catId: number) => {
    setSelectedCategoryIds((prev) => {
      if (prev.includes(catId)) {
        if (prev.length === 1) return prev;
        return prev.filter((id) => id !== catId);
      }
      return [...prev, catId];
    });
  };

  const activeAuthorName = useNewAuthor
    ? newAuthorName.trim() || "Penulis Baru"
    : authors.find((a) => a.id === Number(selectedAuthorId))?.name ||
      "Penulis Charvlibrary";

  const primaryCategory =
    categories.find((c) => c.id === selectedCategoryIds[0]) || categories[0];

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      <div className="lg:col-span-8">
        {errorMessage && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-300 bg-red-50/90 p-4 text-sm text-red-900 dark:border-red-800/60 dark:bg-red-950/50 dark:text-red-200"
          >
            <p className="font-semibold">Gagal Menyimpan Buku:</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        )}

        <form
          action={createBookAction}
          onSubmit={() => setIsSubmitting(true)}
          className="space-y-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm sm:p-8"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
            <div>
              <h2 className="font-heading text-xl font-bold text-[var(--fg)]">
                Metadata Bibliografi & Eksemplar
              </h2>
              <p className="text-xs text-[var(--fg-muted)]">
                Data buku akan langsung terindeks di seluruh halaman katalog perpustakaan.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label
                htmlFor="book-title"
                className="block text-sm font-semibold text-[var(--fg)]"
              >
                Judul Buku <span className="text-red-600">*</span>
              </label>
              <input
                id="book-title"
                name="title"
                type="text"
                required
                minLength={2}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Pengantar Algoritma dan Struktur Data Modern"
                className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--fg)] placeholder:text-[var(--fg-muted)]/60"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="book-subtitle"
                className="block text-sm font-semibold text-[var(--fg)]"
              >
                Subjudul / Edisi (Opsional)
              </label>
              <input
                id="book-subtitle"
                name="subtitle"
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Contoh: Edisi Revisi Ketiga dengan Studi Kasus Komputasi"
                className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 text-sm text-[var(--fg)] placeholder:text-[var(--fg-muted)]/60"
              />
            </div>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)]/60 p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-[var(--fg)]">
                <UserPlus className="h-4 w-4 text-[#92400E] dark:text-amber-400" />
                <span>Penulis Utama <span className="text-red-600">*</span></span>
              </label>

              <button
                type="button"
                onClick={() => {
                  setUseNewAuthor((prev) => !prev);
                  if (useNewAuthor) setNewAuthorName("");
                }}
                className="text-xs font-semibold text-[#92400E] underline-offset-2 hover:underline dark:text-amber-300"
              >
                {useNewAuthor
                  ? "Pilih dari Daftar Penulis Terdaftar"
                  : "+ Ketik Nama Penulis Baru"}
              </button>
            </div>

            {!useNewAuthor ? (
              <div>
                <select
                  name="authorId"
                  value={selectedAuthorId}
                  onChange={(e) => setSelectedAuthorId(Number(e.target.value))}
                  aria-label="Pilih Penulis Terdaftar"
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3.5 py-2.5 text-sm text-[var(--fg)]"
                >
                  {authors.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.nationality})
                    </option>
                  ))}
                </select>
                <input type="hidden" name="newAuthorName" value="" />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="new-author-name"
                    className="block text-xs font-medium text-[var(--fg-muted)]"
                  >
                    Nama Penulis Baru (Otomatis dibuat di tabel Author)
                  </label>
                  <input
                    id="new-author-name"
                    name="newAuthorName"
                    type="text"
                    required={useNewAuthor}
                    minLength={2}
                    value={newAuthorName}
                    onChange={(e) => setNewAuthorName(e.target.value)}
                    placeholder="Mis. Prof. Dr. Hendra Wijaya"
                    className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--fg)]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="new-author-nat"
                    className="block text-xs font-medium text-[var(--fg-muted)]"
                  >
                    Kewarganegaraan
                  </label>
                  <input
                    id="new-author-nat"
                    name="newAuthorNationality"
                    type="text"
                    value={newAuthorNationality}
                    onChange={(e) => setNewAuthorNationality(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--fg)]"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)]/60 p-4">
            <div className="mb-2.5 flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-semibold text-[var(--fg)]">
                <Layers className="h-4 w-4 text-[#92400E] dark:text-amber-400" />
                <span>
                  Kategori Literatur (Pilih minimal 1){" "}
                  <span className="text-red-600">*</span>
                </span>
              </span>
              <span className="text-xs text-[var(--fg-muted)]">
                {selectedCategoryIds.length} kategori dipilih
              </span>
            </div>

            <input
              type="hidden"
              name="categoryId"
              value={selectedCategoryIds[0] || ""}
            />

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {categories.map((cat) => {
                const isSelected = selectedCategoryIds.includes(cat.id);
                return (
                  <label
                    key={cat.id}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                      isSelected
                        ? "border-[#92400E] bg-[#92400E]/15 font-semibold text-[#92400E] dark:border-amber-500 dark:bg-amber-950/60 dark:text-amber-200"
                        : "border-[var(--border)] bg-[var(--card)] text-[var(--fg-muted)] hover:border-[#92400E]/50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      name="categoryIds"
                      value={cat.id}
                      checked={isSelected}
                      onChange={() => toggleCategory(cat.id)}
                      className="h-3.5 w-3.5 accent-[#92400E]"
                    />
                    <span className="truncate">{cat.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)]/60 p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-[var(--fg)]">
                <Building2 className="h-4 w-4 text-[#92400E] dark:text-amber-400" />
                <span>Penerbit <span className="text-red-600">*</span></span>
              </label>

              <button
                type="button"
                onClick={() => {
                  setUseNewPublisher((prev) => !prev);
                  if (useNewPublisher) setNewPublisherName("");
                }}
                className="text-xs font-semibold text-[#92400E] underline-offset-2 hover:underline dark:text-amber-300"
              >
                {useNewPublisher
                  ? "Pilih dari Penerbit Terdaftar"
                  : "+ Ketik Nama Penerbit Baru"}
              </button>
            </div>

            {!useNewPublisher ? (
              <div>
                <select
                  name="publisherId"
                  value={selectedPublisherId}
                  onChange={(e) =>
                    setSelectedPublisherId(Number(e.target.value))
                  }
                  aria-label="Pilih Penerbit Terdaftar"
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3.5 py-2.5 text-sm text-[var(--fg)]"
                >
                  {publishers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.city ? `- ${p.city}` : ""}
                    </option>
                  ))}
                </select>
                <input type="hidden" name="newPublisherName" value="" />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="new-publisher-name"
                    className="block text-xs font-medium text-[var(--fg-muted)]"
                  >
                    Nama Penerbit Baru (Otomatis dibuat di tabel Publisher)
                  </label>
                  <input
                    id="new-publisher-name"
                    name="newPublisherName"
                    type="text"
                    required={useNewPublisher}
                    minLength={2}
                    value={newPublisherName}
                    onChange={(e) => setNewPublisherName(e.target.value)}
                    placeholder="Mis. Charvlibrary University Press"
                    className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--fg)]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="new-publisher-city"
                    className="block text-xs font-medium text-[var(--fg-muted)]"
                  >
                    Kota Terbit
                  </label>
                  <input
                    id="new-publisher-city"
                    name="newPublisherCity"
                    type="text"
                    value={newPublisherCity}
                    onChange={(e) => setNewPublisherCity(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--fg)]"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            <div className="sm:col-span-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="book-isbn"
                  className="block text-sm font-semibold text-[var(--fg)]"
                >
                  Nomor ISBN (Unik) <span className="text-red-600">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsbn(generateUniqueIsbn13())}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#92400E] hover:underline dark:text-amber-300"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Generate ISBN Unik</span>
                </button>
              </div>
              <input
                id="book-isbn"
                name="isbn"
                type="text"
                required
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 text-sm font-mono text-[var(--fg)]"
              />
            </div>

            <div>
              <label
                htmlFor="book-year"
                className="block text-sm font-semibold text-[var(--fg)]"
              >
                Tahun Terbit <span className="text-red-600">*</span>
              </label>
              <input
                id="book-year"
                name="publishYear"
                type="number"
                min={1450}
                max={2026}
                required
                value={publishYear}
                onChange={(e) => setPublishYear(Number(e.target.value))}
                className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 text-sm text-[var(--fg)]"
              />
            </div>

            <div>
              <label
                htmlFor="book-language"
                className="block text-sm font-semibold text-[var(--fg)]"
              >
                Bahasa Pengantar
              </label>
              <select
                id="book-language"
                name="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 text-sm text-[var(--fg)]"
              >
                <option value="Indonesia">Indonesia</option>
                <option value="Inggris">Inggris</option>
                <option value="Dwibahasa (Indonesia-Inggris)">
                  Dwibahasa (Indonesia-Inggris)
                </option>
                <option value="Jepang">Jepang</option>
                <option value="Jerman">Jerman</option>
                <option value="Arab">Arab</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="book-pages"
                className="block text-sm font-semibold text-[var(--fg)]"
              >
                Jumlah Halaman <span className="text-red-600">*</span>
              </label>
              <input
                id="book-pages"
                name="pages"
                type="number"
                min={1}
                max={5000}
                required
                value={pages}
                onChange={(e) => setPages(Number(e.target.value))}
                className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 text-sm text-[var(--fg)]"
              />
            </div>

            <div>
              <label
                htmlFor="book-stock"
                className="block text-sm font-semibold text-[var(--fg)]"
              >
                Jumlah Eksemplar Stok <span className="text-red-600">*</span>
              </label>
              <input
                id="book-stock"
                name="stockTotal"
                type="number"
                min={1}
                max={100}
                required
                value={stockTotal}
                onChange={(e) => setStockTotal(Number(e.target.value))}
                className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 text-sm text-[var(--fg)]"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="book-description"
              className="block text-sm font-semibold text-[var(--fg)]"
            >
              Sinopsis & Ringkasan Akademik (Minimal 20 karakter){" "}
              <span className="text-red-600">*</span>
            </label>
            <textarea
              id="book-description"
              name="description"
              rows={4}
              required
              minLength={20}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tuliskan gambaran isi buku, kontribusi keilmuan, dan manfaatnya bagi pembaca..."
              className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--fg)]"
            />
          </div>

          <div>
            <label
              htmlFor="book-excerpt"
              className="flex items-center gap-1.5 text-sm font-semibold text-[var(--fg)]"
            >
              <FileText className="h-4 w-4 text-[#92400E] dark:text-amber-400" />
              <span>Kutipan Isi Buku / Sample Excerpt (Opsional)</span>
            </label>
            <textarea
              id="book-excerpt"
              name="sampleExcerpt"
              rows={2}
              value={sampleExcerpt}
              onChange={(e) => setSampleExcerpt(e.target.value)}
              placeholder="Paragraf pembuka yang akan ditampilkan pada fitur Pratinjau Halaman di detail buku..."
              className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 text-sm text-[var(--fg)]"
            />
          </div>

          <div className="rounded-xl border border-dashed border-[#92400E]/50 bg-[var(--surface)]/70 p-4">
            <label
              htmlFor="book-cover-file"
              className="flex items-center gap-2 text-sm font-semibold text-[var(--fg)]"
            >
              <ImageIcon className="h-4 w-4 text-[#92400E] dark:text-amber-400" />
              <span>Unggah Gambar Sampul Buku (JPG, PNG, atau WebP - Maks. 3 MB)</span>
            </label>
            <p className="mt-1 text-xs text-[var(--fg-muted)]">
              Jika tidak memilih file gambar, sistem otomatis membuat sampul tipografis berbasis judul dan kategori buku.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <input
                id="book-cover-file"
                name="coverFile"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="block w-full text-xs text-[var(--fg-muted)] file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-[#92400E] file:px-3.5 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-[#78350F] sm:w-auto"
              />
              {selectedFileName && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>{selectedFileName}</span>
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <input
              id="book-featured"
              name="isFeatured"
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="h-4 w-4 accent-[#92400E]"
            />
            <label
              htmlFor="book-featured"
              className="text-sm font-medium text-[var(--fg)]"
            >
              Tampilkan buku ini pada bagian Sorotan Pilihan Pustakawan di Beranda
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[var(--border)] pt-5">
            <Link
              href="/explore"
              className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-xs font-semibold text-[var(--fg)] transition-colors hover:border-[#92400E]"
            >
              Batal & Kembali ke Katalog
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-[#92400E] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#78350F] disabled:opacity-60"
            >
              <BookPlus className="h-4 w-4" />
              <span>
                {isSubmitting
                  ? "Menyimpan Buku..."
                  : "Simpan & Terbitkan Buku"}
              </span>
            </button>
          </div>
        </form>
      </div>

      <div className="lg:col-span-4">
        <div className="sticky top-24 space-y-5">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider uppercase text-[#92400E] dark:text-amber-300">
                Pratinjau Langsung (Live Preview)
              </span>
              <span className="rounded-full bg-[var(--surface)] px-2.5 py-0.5 text-[11px] font-medium text-[var(--fg-muted)]">
                {previewObjectUrl ? "Sampul Unggahan" : "Sampul Otomatis"}
              </span>
            </div>

            <div className="mx-auto w-52 sm:w-56">
              <GeneratedBookCover
                title={title.trim() || "Judul Buku Baru"}
                author={activeAuthorName}
                category={primaryCategory?.name || "Literatur"}
                accentColor={primaryCategory?.accentColor}
                coverPath={previewObjectUrl}
                publishYear={publishYear}
                className="w-full aspect-[2/3] shadow-md"
              />
            </div>

            <div className="mt-4 space-y-2 border-t border-[var(--border)] pt-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[var(--fg-muted)]">Sumber Data:</span>
                <span className="font-semibold text-[var(--fg)]">
                  Input Pustakawan
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--fg-muted)]">Stok Tersedia:</span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                  {stockTotal} dari {stockTotal} Eksemplar
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--fg-muted)]">ISBN:</span>
                <span className="font-mono text-[var(--fg)]">{isbn}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/80 p-4 text-xs text-[var(--fg-muted)]">
            <div className="mb-1.5 flex items-center gap-2 font-semibold text-[var(--fg)]">
              <Info className="h-4 w-4 text-[#92400E] dark:text-amber-400" />
              <span>Integrasi Katalog Otomatis</span>
            </div>
            <p>
              Begitu buku disimpan, halaman detail buku akan langsung dibuat, dapat ditemukan lewat pencarian katalog, dan siap dipinjam oleh anggota.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href="/admin/books"
                className="inline-flex items-center gap-1 font-semibold text-[#92400E] hover:underline dark:text-amber-300"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Buka Tabel Manajemen Buku</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}