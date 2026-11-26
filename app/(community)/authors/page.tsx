import React from "react";
import Link from "next/link";
import {
  Feather,
  Globe,
  BookOpen,
  Search,
  ArrowRight,
  MapPin,
  Sparkles,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";

interface AuthorsPageProps {
  searchParams: Promise<{
    nationality?: string;
    q?: string;
  }>;
}

export default async function AuthorsPage({ searchParams }: AuthorsPageProps) {
  const resolvedParams = await searchParams;
  const nationalityFilter = (resolvedParams.nationality || "").trim();
  const query = (resolvedParams.q || "").trim();

  const allAuthors = await prisma.author.findMany({
    include: {
      books: {
        include: {
          book: {
            select: {
              id: true,
              title: true,
              publishYear: true,
              ratingAvg: true,
            },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  const indonesiaCount = allAuthors.filter(
    (a) => a.nationality.toLowerCase() === "indonesia"
  ).length;
  const internationalCount = allAuthors.length - indonesiaCount;

  const filteredAuthors = allAuthors.filter((author) => {
    const isIndo = author.nationality.toLowerCase() === "indonesia";
    const matchNationality =
      !nationalityFilter ||
      (nationalityFilter.toLowerCase() === "indonesia" && isIndo) ||
      (nationalityFilter.toLowerCase() === "internasional" && !isIndo) ||
      author.nationality.toLowerCase() === nationalityFilter.toLowerCase();

    const matchQuery =
      !query ||
      author.name.toLowerCase().includes(query.toLowerCase()) ||
      author.bio.toLowerCase().includes(query.toLowerCase()) ||
      author.nationality.toLowerCase().includes(query.toLowerCase()) ||
      author.books.some((ba) =>
        ba.book.title.toLowerCase().includes(query.toLowerCase())
      );

    return matchNationality && matchQuery;
  });

  const totalCatalogWorks = allAuthors.reduce(
    (sum, a) => sum + a.books.length,
    0
  );

  return (
    <div className="min-h-screen pb-16">
      <PageHeader
        title="Direktori Penulis Nusantara & Dunia"
        subtitle="Kenali biografi intelektual, latar belakang sastra, dan bibliografi lengkap para penulis yang karyanya tersimpan di katalog Charvlibrary."
        fallbackHref="/explore"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/explore"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3.5 py-2 text-xs font-semibold text-[var(--fg)] transition-colors hover:border-[#92400E] hover:text-[#92400E]"
            >
              <BookOpen className="h-3.5 w-3.5" />
              Eksplorasi Buku
            </Link>
            <Link
              href="/collections"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#92400E] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#78350F]"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Koleksi Kurasi
            </Link>
          </div>
        }
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <section
          aria-label="Statistik Direktori Penulis"
          className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3"
        >
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider uppercase text-[var(--fg-muted)]">
                Total Tokoh Penulis
              </span>
              <Feather className="h-4 w-4 text-[#92400E]" />
            </div>
            <p className="font-heading mt-2 text-2xl font-bold text-[var(--fg)]">
              {allAuthors.length} Penulis
            </p>
            <p className="mt-0.5 text-xs text-[var(--fg-muted)]">
              Terindeks bersama {totalCatalogWorks} relasi buku katalog
            </p>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider uppercase text-[var(--fg-muted)]">
                Penulis Nusantara
              </span>
              <MapPin className="h-4 w-4 text-[#D97706]" />
            </div>
            <p className="font-heading mt-2 text-2xl font-bold text-[var(--fg)]">
              {indonesiaCount} Tokoh Indonesia
            </p>
            <p className="mt-0.5 text-xs text-[var(--fg-muted)]">
              Sastrawan klasik, kontemporer, dan akademisi nasional
            </p>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider uppercase text-[var(--fg-muted)]">
                Penulis Internasional
              </span>
              <Globe className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
            </div>
            <p className="font-heading mt-2 text-2xl font-bold text-[var(--fg)]">
              {internationalCount} Tokoh Dunia
            </p>
            <p className="mt-0.5 text-xs text-[var(--fg-muted)]">
              Pemikir global, ilmuwan komputer, dan novelis dunia
            </p>
          </div>
        </section>

        <section
          aria-label="Filter Kewarganegaraan dan Pencarian Penulis"
          className="mb-8 rounded-xl border border-[var(--border)] bg-[var(--surface)]/80 p-4"
        >
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={query ? `/authors?q=${encodeURIComponent(query)}` : "/authors"}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  !nationalityFilter
                    ? "bg-[#92400E] text-white"
                    : "border border-[var(--border)] bg-[var(--card)] text-[var(--fg-muted)] hover:border-[#92400E] hover:text-[var(--fg)]"
                }`}
              >
                Semua Penulis ({allAuthors.length})
              </Link>
              <Link
                href={
                  query
                    ? `/authors?nationality=Indonesia&q=${encodeURIComponent(query)}`
                    : "/authors?nationality=Indonesia"
                }
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  nationalityFilter.toLowerCase() === "indonesia"
                    ? "bg-[#92400E] text-white"
                    : "border border-[var(--border)] bg-[var(--card)] text-[var(--fg-muted)] hover:border-[#92400E] hover:text-[var(--fg)]"
                }`}
              >
                Indonesia ({indonesiaCount})
              </Link>
              <Link
                href={
                  query
                    ? `/authors?nationality=Internasional&q=${encodeURIComponent(query)}`
                    : "/authors?nationality=Internasional"
                }
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  nationalityFilter.toLowerCase() === "internasional"
                    ? "bg-[#92400E] text-white"
                    : "border border-[var(--border)] bg-[var(--card)] text-[var(--fg-muted)] hover:border-[#92400E] hover:text-[var(--fg)]"
                }`}
              >
                Internasional ({internationalCount})
              </Link>
            </div>

            <form
              action="/authors"
              method="get"
              className="flex w-full items-center gap-2 lg:w-80"
            >
              {nationalityFilter && (
                <input
                  type="hidden"
                  name="nationality"
                  value={nationalityFilter}
                />
              )}
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[var(--fg-muted)]" />
                <input
                  type="search"
                  name="q"
                  defaultValue={query}
                  placeholder="Cari nama penulis atau karya..."
                  aria-label="Cari nama penulis"
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] py-2 pr-3 pl-9 text-xs text-[var(--fg)] placeholder:text-[var(--fg-muted)] focus:border-[#92400E]"
                />
              </div>
              <button
                type="submit"
                className="rounded-lg bg-[#92400E] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#78350F]"
              >
                Cari
              </button>
              {(query || nationalityFilter) && (
                <Link
                  href="/authors"
                  className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-2.5 py-2 text-xs font-medium text-[var(--fg-muted)] hover:text-[var(--fg)]"
                >
                  Reset
                </Link>
              )}
            </form>
          </div>
        </section>

        {filteredAuthors.length === 0 ? (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-10 text-center">
            <Feather className="mx-auto h-10 w-10 text-[var(--fg-muted)]" />
            <h2 className="font-heading mt-3 text-lg font-bold text-[var(--fg)]">
              Penulis Tidak Ditemukan
            </h2>
            <p className="mt-1 text-sm text-[var(--fg-muted)]">
              Tidak ada profil penulis yang sesuai dengan filter kewarganegaraan
              atau kata kunci pencarian.
            </p>
            <Link
              href="/authors"
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#92400E] px-4 py-2 text-xs font-semibold text-white hover:bg-[#78350F]"
            >
              Tampilkan Semua Penulis
            </Link>
          </div>
        ) : (
          <section
            aria-label="Daftar Profil Penulis"
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {filteredAuthors.map((author) => {
              const initials = author.name
                .split(" ")
                .map((part) => part.charAt(0))
                .join("")
                .slice(0, 2)
                .toUpperCase();
              const isIndo = author.nationality.toLowerCase() === "indonesia";
              const topBooks = author.books.slice(0, 2).map((ba) => ba.book);

              return (
                <article
                  key={author.id}
                  className="book-card-3d flex flex-col justify-between rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-xs"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3.5">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#92400E] to-[#3D2B1F] font-heading text-base font-bold text-[#FFFBEB] shadow-xs">
                          {initials}
                        </div>
                        <div>
                          <h2 className="font-heading text-lg font-bold text-[var(--fg)]">
                            <Link
                              href={`/authors/${author.slug}`}
                              className="hover:text-[#92400E] dark:hover:text-amber-400"
                            >
                              {author.name}
                            </Link>
                          </h2>
                          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-[var(--fg-muted)]">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                isIndo
                                  ? "bg-[#92400E]/15 text-[#92400E] dark:text-amber-300"
                                  : "bg-blue-900/15 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                              }`}
                            >
                              {author.nationality}
                            </span>
                            {author.birthYear && (
                              <span>Lahir {author.birthYear}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <span className="shrink-0 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 text-xs font-bold text-[var(--fg)]">
                        {author.books.length} Buku
                      </span>
                    </div>

                    <p className="mt-3.5 line-clamp-3 text-sm leading-relaxed text-[var(--fg-muted)]">
                      {author.bio}
                    </p>

                    {topBooks.length > 0 && (
                      <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--surface)]/60 p-3">
                        <p className="text-[11px] font-semibold tracking-wider uppercase text-[var(--fg-muted)]">
                          Karya di Katalog:
                        </p>
                        <ul className="mt-1.5 space-y-1">
                          {topBooks.map((b) => (
                            <li
                              key={b.id}
                              className="flex items-center justify-between gap-2 text-xs"
                            >
                              <Link
                                href={`/books/${b.id}`}
                                className="truncate font-medium text-[var(--fg)] hover:text-[#92400E] hover:underline"
                              >
                                {b.title}
                              </Link>
                              <span className="shrink-0 text-[11px] text-[var(--fg-muted)]">
                                {b.publishYear}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-[var(--border)] pt-3.5">
                    <span className="text-xs text-[var(--fg-muted)]">
                      Bibliografi & Profil Lengkap
                    </span>
                    <Link
                      href={`/authors/${author.slug}`}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#92400E] px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#78350F]"
                    >
                      Lihat Profil
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </div>
  );
}