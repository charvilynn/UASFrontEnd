"use client";

import React, { useState, useTransition } from "react";
import { Save, Upload, AlertCircle } from "lucide-react";
import { GeneratedBookCover } from "@/components/books/GeneratedBookCover";
import {
  updateBookAction,
} from "@/features/discovery/actions";

interface OptionItem {
  id: number;
  name: string;
  accentColor?: string;
}

interface EditBookFormProps {
  book: {
    id: number;
    title: string;
    subtitle: string | null;
    isbn: string;
    language: string;
    publishYear: number;
    pages: number;
    stockTotal: number;
    stockAvailable: number;
    description: string;
    sampleExcerpt: string | null;
    coverPath: string | null;
    isFeatured: boolean;
    authorId: number;
    categoryId: number;
    publisherId: number;
  };
  authors: OptionItem[];
  categories: OptionItem[];
  publishers: OptionItem[];
}

export function EditBookForm({
  book,
  authors,
  categories,
  publishers,
}: EditBookFormProps) {
  const [title, setTitle] = useState(book.title);
  const [authorId, setAuthorId] = useState(book.authorId);
  const [categoryId, setCategoryId] = useState(book.categoryId);
  const [publishYear, setPublishYear] = useState(book.publishYear);
  const [previewUrl, setPreviewUrl] = useState<string | null>(book.coverPath);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedAuthor =
    authors.find((a) => a.id === Number(authorId))?.name || "Penulis Katalog";
  const selectedCategory = categories.find((c) => c.id === Number(categoryId));

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setPreviewUrl(book.coverPath);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await updateBookAction(book.id, formData);
      if (res && !res.ok && res.error) {
        setErrorMsg(res.error);
      }
    });
  }
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <div className="sticky top-24 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-xs">
          <h2 className="font-heading mb-4 text-lg font-bold text-[var(--fg)]">
            Pratinjau Sampul Buku
          </h2>
          <div className="mx-auto max-w-[220px]">
            <GeneratedBookCover
              title={title || "Judul Buku"}
              author={selectedAuthor}
              category={selectedCategory?.name || "Literatur"}
              accentColor={selectedCategory?.accentColor}
              coverPath={previewUrl}
              publishYear={publishYear}
            />
          </div>
          <p className="mt-4 text-center text-xs text-[var(--fg-muted)]">
            Jika Anda mengunggah gambar baru (JPG, PNG, WebP maks 3 MB), sampul
            lama akan otomatis diperbarui di katalog.
          </p>

        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-xs sm:p-8 lg:col-span-2"
      >
        {errorMsg && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-xl border border-red-300 bg-red-50 p-4 text-xs font-medium text-red-900 dark:border-red-900 dark:bg-red-950/70 dark:text-red-200"
          >
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label
              htmlFor="edit-title"
              className="block text-xs font-bold text-[var(--fg)]"
            >
              Judul Buku *
            </label>
            <input
              id="edit-title"
              name="title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--fg)]"
            />
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="edit-subtitle"
              className="block text-xs font-bold text-[var(--fg)]"
            >
              Subjudul / Edisi
            </label>
            <input
              id="edit-subtitle"
              name="subtitle"
              type="text"
              defaultValue={book.subtitle || ""}
              className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--fg)]"
            />
          </div>

          <div>
            <label
              htmlFor="edit-author"
              className="block text-xs font-bold text-[var(--fg)]"
            >
              Penulis Utama *
            </label>
            <select
              id="edit-author"
              name="authorId"
              value={authorId}
              onChange={(e) => setAuthorId(Number(e.target.value))}
              className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--fg)]"
            >
              {authors.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="edit-category"
              className="block text-xs font-bold text-[var(--fg)]"
            >
              Kategori Utama *
            </label>
            <select
              id="edit-category"
              name="categoryId"
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--fg)]"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="edit-publisher"
              className="block text-xs font-bold text-[var(--fg)]"
            >
              Penerbit *
            </label>
            <select
              id="edit-publisher"
              name="publisherId"
              defaultValue={book.publisherId}
              className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--fg)]"
            >
              {publishers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="edit-isbn"
              className="block text-xs font-bold text-[var(--fg)]"
            >
              Nomor ISBN *
            </label>
            <input
              id="edit-isbn"
              name="isbn"
              type="text"
              required
              defaultValue={book.isbn}
              className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--fg)]"
            />
          </div>
          <div className="sm:col-span-2">
            <label
              htmlFor="edit-cover"
              className="block text-xs font-bold text-[var(--fg)]"
            >
              Ganti Gambar Sampul (Opsional: JPG, PNG, WebP maks 3 MB)
            </label>
            <div className="mt-1.5 flex items-center gap-3 rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-3">
              <Upload className="h-5 w-5 text-[#92400E]" />
              <input
                id="edit-cover"
                name="coverFile"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="w-full text-xs text-[var(--fg-muted)] file:mr-3 file:rounded-lg file:border-0 file:bg-[#92400E] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end border-t border-[var(--border)] pt-5">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-[#92400E] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#78350F] disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            <span>{isPending ? "Menyimpan..." : "Simpan Perubahan Buku"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}