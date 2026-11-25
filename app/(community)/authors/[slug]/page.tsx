import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Feather,
  Globe,
  BookOpen,
  Calendar,
  Star,
  ArrowRight,
  Users,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { BookCard, BookCardData } from "@/components/books/BookCard";

interface AuthorDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function AuthorDetailPage({
  params,
}: AuthorDetailPageProps) {
  const { slug } = await params;
  const sessionUser = await getSessionUser();

  const includeConfig = {
    books: {
      include: {
        book: {
          include: {
            authors: {
              include: { author: true },
            },
            categories: {
              include: { category: true },
            },
            wishlists: sessionUser
              ? {
                  where: { userId: sessionUser.id },
                }
              : false,
          },
        },
      },
    },
  } as const;

  let author = await prisma.author.findUnique({
    where: { slug },
    include: includeConfig,
  });

  if (!author) {
    author = await prisma.author.findFirst({
      orderBy: { id: "asc" },
      include: includeConfig,
    });
  }

  if (!author) {
    notFound();
  }

  const bookCards: BookCardData[] = author.books.map((ba) => {
    const b = ba.book;
    const primaryCategory = b.categories[0]?.category;
    const wishlistsArr = Array.isArray(b.wishlists) ? b.wishlists : [];

    return {
      id: b.id,
      title: b.title,
      subtitle: b.subtitle,
      publishYear: b.publishYear,
      pages: b.pages,
      isbn: b.isbn,
      coverPath: b.coverPath,
      stockAvailable: b.stockAvailable,
      stockTotal: b.stockTotal,
      ratingAvg: b.ratingAvg,
      ratingCount: b.ratingCount,
      authorName: author.name,
      authorSlug: author.slug,
      categoryName: primaryCategory?.name || "Literatur Umum",
      categorySlug: primaryCategory?.slug,
      accentColor: primaryCategory?.accentColor || "#92400E",
      inWishlist: wishlistsArr.length > 0,
    };
  });

  const totalPages = bookCards.reduce((acc, item) => acc + item.pages, 0);
  const avgRating =
    bookCards.length > 0
      ? bookCards.reduce((acc, item) => acc + item.ratingAvg, 0) /
        bookCards.length
      : 4.6;

  const initials = author.name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen pb-16">
      <PageHeader
        title={author.name}
        subtitle={`Profil biografi, perjalanan kepengarangan, dan koleksi karya ${author.name} di katalog Charvlibrary.`}
        fallbackHref="/authors"
        breadcrumbLabel={author.name}
        actions={
          <Link
            href="/authors"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3.5 py-2 text-xs font-semibold text-[var(--fg)] transition-colors hover:border-[#92400E] hover:text-[#92400E]"
          >
            <Users className="h-3.5 w-3.5" />
            Direktori Penulis
          </Link>
        }
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <section
          aria-label="Biografi Lengkap Penulis"
          className="mb-10 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-xs sm:p-8"
        >
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
            <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center lg:col-span-8">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#92400E] via-[#78350F] to-[#1C1410] font-heading text-3xl font-bold text-[#FFFBEB] shadow-md">
                {initials}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#92400E]/15 px-3 py-1 font-semibold text-[#92400E] dark:text-amber-300">
                    <Globe className="h-3.5 w-3.5" />
                    Kewarganegaraan: {author.nationality}
                  </span>
                  {author.birthYear && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 font-medium text-[var(--fg-muted)]">
                      <Calendar className="h-3.5 w-3.5" />
                      Tahun Lahir: {author.birthYear}
                    </span>
                  )}
                </div>

                <h2 className="font-heading mt-3 text-2xl font-bold text-[var(--fg)]">
                  Biografi & Jejak Literasi
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-[var(--fg-muted)] sm:text-base">
                  {author.bio}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)]/80 p-4 lg:col-span-4">
              <div className="text-center">
                <BookOpen className="mx-auto h-4 w-4 text-[#92400E]" />
                <p className="font-heading mt-1.5 text-xl font-bold text-[var(--fg)]">
                  {bookCards.length}
                </p>
                <p className="text-[11px] text-[var(--fg-muted)]">
                  Karya Katalog
                </p>
              </div>
              <div className="border-x border-[var(--border)] px-2 text-center">
                <Star className="mx-auto h-4 w-4 text-amber-500" />
                <p className="font-heading mt-1.5 text-xl font-bold text-[var(--fg)]">
                  {avgRating.toFixed(1)}
                </p>
                <p className="text-[11px] text-[var(--fg-muted)]">
                  Rating Rata-rata
                </p>
              </div>
              <div className="text-center">
                <Feather className="mx-auto h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                <p className="font-heading mt-1.5 text-xl font-bold text-[var(--fg)]">
                  {totalPages.toLocaleString("id-ID")}
                </p>
                <p className="text-[11px] text-[var(--fg-muted)]">
                  Total Halaman
                </p>
              </div>
            </div>
          </div>
        </section>

        <section aria-label="Daftar Buku Karya Penulis" className="mb-12">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-heading text-xl font-bold text-[var(--fg)] sm:text-2xl">
                Bibliografi Karya {author.name} ({bookCards.length} Buku)
              </h2>
              <p className="mt-1 text-sm text-[var(--fg-muted)]">
                Seluruh buku karya {author.name} yang dapat dipinjam langsung
                atau disimpan ke Daftar Keinginan.
              </p>
            </div>

            <Link
              href={`/search?q=${encodeURIComponent(author.name)}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3.5 py-2 text-xs font-semibold text-[var(--fg)] hover:border-[#92400E] hover:text-[#92400E]"
            >
              Cari di Pencarian Lanjutan
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {bookCards.length === 0 ? (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-8 text-center">
              <p className="text-sm text-[var(--fg-muted)]">
                Belum ada buku karya {author.name} yang terdaftar di katalog
                aktif saat ini.
              </p>
              <Link
                href="/explore"
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#92400E] px-4 py-2 text-xs font-semibold text-white hover:bg-[#78350F]"
              >
                Jelajahi Katalog Utama
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {bookCards.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  isAdmin={sessionUser?.role === "admin"}
                />
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}