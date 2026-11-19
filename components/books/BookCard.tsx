import React from "react";
import Link from "next/link";
import { GeneratedBookCover } from "./GeneratedBookCover";

export interface BookCardData {
  id: number;
  title: string;
  subtitle?: string | null;
  isbn?: string | null;
  authorName: string;
  authorSlug?: string;
  categoryName: string;
  categorySlug?: string;
  accentColor: string;
  publishYear: number;
  pages: number;
  ratingAvg: number;
  ratingCount: number;
  stockAvailable: number;
  stockTotal: number;
  coverPath: string | null;
  inWishlist?: boolean;
  isWishlisted?: boolean;
}

interface BookCardProps {
  book: BookCardData;
  isAdmin?: boolean;
  showEditButton?: boolean;
}

export function BookCard({ book }: BookCardProps) {
  const isAvailable = book.stockAvailable > 0;

  return (
    <article
      data-testid={`book-card-${book.id}`}
      className="group flex flex-col"
    >
      <Link
        href={`/books/${book.id}`}
        data-cursor="cover"
        className="relative block aspect-[2/3] w-full overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-xs transition-all duration-300 group-hover:-translate-y-1 group-hover:border-[var(--border-strong)] group-hover:shadow-md"
      >
        <GeneratedBookCover
          title={book.title}
          author={book.authorName}
          category={book.categoryName}
          accentColor={book.accentColor}
          coverPath={book.coverPath}
          publishYear={book.publishYear}
          className="h-full w-full"
        />

        <span
          className={`pointer-events-none absolute top-2 right-2 rounded-full px-2 py-0.5 text-[10px] font-semibold text-white shadow-xs backdrop-blur-xs ${
            isAvailable ? "bg-emerald-700/90" : "bg-rose-700/95"
          }`}
        >
          {isAvailable ? "Tersedia" : "Tidak Tersedia"}
        </span>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-black/80 via-black/45 to-transparent p-3 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
          <div className="flex items-center justify-between text-[11px] font-medium text-[#FBF8F2]">
            <span className="truncate">{book.categoryName}</span>
            <span>{isAvailable ? "Tersedia" : "Tidak Tersedia"}</span>
          </div>
        </div>
      </Link>

      <div className="mt-2.5 flex flex-col">
        <Link
          href={`/books/${book.id}`}
          className="font-serif line-clamp-2 text-sm font-semibold leading-snug text-[var(--fg)] transition-colors group-hover:text-[var(--primary)]"
        >
          {book.title}
        </Link>
        <p className="mt-0.5 truncate text-xs text-[var(--fg-muted)]">
          {book.authorName}
        </p>
      </div>
    </article>
  );
}