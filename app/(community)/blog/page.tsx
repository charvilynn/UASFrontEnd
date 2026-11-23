import React from "react";
import Link from "next/link";
import {
  Newspaper,
  Clock,
  MessageSquare,
  Search,
  Sparkles,
  ArrowRight,
  UserCheck,
  BookOpen,
  Calendar,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";

interface BlogPageProps {
  searchParams: Promise<{
    category?: string;
    q?: string;
  }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const resolvedParams = await searchParams;
  const activeCategory = (resolvedParams.category || "").trim();
  const query = (resolvedParams.q || "").trim();

  const allPosts = await prisma.blogPost.findMany({
    include: {
      _count: {
        select: { comments: true },
      },
    },
    orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }],
  });

  const categories = Array.from(
    new Set(allPosts.map((post) => post.category).filter(Boolean))
  );

  const filteredPosts = allPosts.filter((post) => {
    const matchCategory =
      !activeCategory ||
      post.category.toLowerCase() === activeCategory.toLowerCase();
    const matchQuery =
      !query ||
      post.title.toLowerCase().includes(query.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(query.toLowerCase()) ||
      post.authorName.toLowerCase().includes(query.toLowerCase()) ||
      post.category.toLowerCase().includes(query.toLowerCase());
    return matchCategory && matchQuery;
  });

  const featuredPost =
    filteredPosts.find((p) => p.isFeatured) ||
    allPosts.find((p) => p.isFeatured) ||
    allPosts[0] ||
    null;

  const totalComments = allPosts.reduce(
    (acc, item) => acc + item._count.comments,
    0
  );

  return (
    <div className="min-h-screen pb-16">
      <PageHeader
        title="Jurnal & Artikel Literasi"
        subtitle="Esai sastra, resensi buku akademik, dan catatan kuratorial dari redaksi pustakawan serta sivitas Charvlibrary."
        fallbackHref="/"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/events"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#92400E] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#78350F]"
            >
              <Calendar className="h-3.5 w-3.5" />
              Agenda Literasi
            </Link>
          </div>
        }
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <section
          aria-label="Statistik Jurnal Literasi"
          className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3"
        >
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider uppercase text-[var(--fg-muted)]">
                Total Artikel Terbit
              </span>
              <Newspaper className="h-4 w-4 text-[#92400E]" />
            </div>
            <p className="font-heading mt-2 text-2xl font-bold text-[var(--fg)]">
              {allPosts.length} Edisi
            </p>
            <p className="mt-0.5 text-xs text-[var(--fg-muted)]">
              Kurasi esai, ulasan mendalam, dan panduan riset
            </p>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider uppercase text-[var(--fg-muted)]">
                Topik & Rubrik
              </span>
              <BookOpen className="h-4 w-4 text-[#D97706]" />
            </div>
            <p className="font-heading mt-2 text-2xl font-bold text-[var(--fg)]">
              {categories.length} Kategori
            </p>
            <p className="mt-0.5 text-xs text-[var(--fg-muted)]">
              {categories.join(", ") || "Sastra, Akademik & Budaya"}
            </p>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider uppercase text-[var(--fg-muted)]">
                Tanggapan Pembaca
              </span>
              <MessageSquare className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
            </div>
            <p className="font-heading mt-2 text-2xl font-bold text-[var(--fg)]">
              {totalComments} Diskusi
            </p>
            <p className="mt-0.5 text-xs text-[var(--fg-muted)]">
              Komentar aktif dari anggota perpustakaan
            </p>
          </div>
        </section>

        {featuredPost && !query && !activeCategory && (
          <section aria-label="Artikel Unggulan" className="mb-10">
            <div className="relative overflow-hidden rounded-2xl border border-[#92400E]/30 bg-gradient-to-br from-[#251A13] via-[#3D2B1F] to-[#1C1410] p-6 text-[#FFFBEB] shadow-md sm:p-8">
              <div className="flex flex-wrap items-center gap-2.5 text-xs">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 font-semibold text-amber-300">
                  <Sparkles className="h-3.5 w-3.5" />
                  Sorotan Utama Redaksi
                </span>
                <span className="rounded-full border border-amber-200/25 bg-black/25 px-3 py-1 font-medium text-amber-100">
                  {featuredPost.category}
                </span>
                <span className="inline-flex items-center gap-1 text-amber-200/80">
                  <Clock className="h-3.5 w-3.5" />
                  {featuredPost.readTimeMinutes} menit baca
                </span>
                <span className="inline-flex items-center gap-1 text-amber-200/80">
                  <MessageSquare className="h-3.5 w-3.5" />
                  {featuredPost._count.comments} komentar
                </span>
              </div>

              <h2 className="font-heading mt-4 max-w-3xl text-2xl font-bold tracking-tight text-[#FFFBEB] sm:text-3xl">
                <Link
                  href={`/blog/${featuredPost.slug}`}
                  className="hover:text-amber-300 hover:underline"
                >
                  {featuredPost.title}
                </Link>
              </h2>

              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-amber-100/90 sm:text-base">
                {featuredPost.excerpt}
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-amber-100/15 pt-4">
                <div className="flex items-center gap-2.5 text-xs text-amber-100/90">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#92400E] font-bold text-white">
                    {featuredPost.authorName.charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <p className="font-semibold text-white">
                      {featuredPost.authorName}
                    </p>
                    <p className="text-amber-200/75">{featuredPost.authorRole}</p>
                  </div>
                </div>

                <Link
                  href={`/blog/${featuredPost.slug}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-[#1C1410] transition-colors hover:bg-amber-400"
                >
                  Baca Artikel Lengkap
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>
        )}

        <section
          aria-label="Filter dan Pencarian Artikel"
          className="mb-8 rounded-xl border border-[var(--border)] bg-[var(--surface)]/80 p-4"
        >
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={query ? `/blog?q=${encodeURIComponent(query)}` : "/blog"}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  !activeCategory
                    ? "bg-[#92400E] text-white"
                    : "border border-[var(--border)] bg-[var(--card)] text-[var(--fg-muted)] hover:border-[#92400E] hover:text-[var(--fg)]"
                }`}
              >
                Semua Rubrik ({allPosts.length})
              </Link>
              {categories.map((cat) => {
                const count = allPosts.filter((p) => p.category === cat).length;
                const isSelected =
                  activeCategory.toLowerCase() === cat.toLowerCase();
                const targetHref = query
                  ? `/blog?category=${encodeURIComponent(cat)}&q=${encodeURIComponent(query)}`
                  : `/blog?category=${encodeURIComponent(cat)}`;
                return (
                  <Link
                    key={cat}
                    href={targetHref}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                      isSelected
                        ? "bg-[#92400E] text-white"
                        : "border border-[var(--border)] bg-[var(--card)] text-[var(--fg-muted)] hover:border-[#92400E] hover:text-[var(--fg)]"
                    }`}
                  >
                    {cat} ({count})
                  </Link>
                );
              })}
            </div>

            <form
              action="/blog"
              method="get"
              className="flex w-full items-center gap-2 lg:w-80"
            >
              {activeCategory && (
                <input type="hidden" name="category" value={activeCategory} />
              )}
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[var(--fg-muted)]" />
                <input
                  type="search"
                  name="q"
                  defaultValue={query}
                  placeholder="Cari judul, topik, atau penulis..."
                  aria-label="Cari artikel jurnal"
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] py-2 pr-3 pl-9 text-xs text-[var(--fg)] placeholder:text-[var(--fg-muted)] focus:border-[#92400E]"
                />
              </div>
              <button
                type="submit"
                className="rounded-lg bg-[#92400E] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#78350F]"
              >
                Cari
              </button>
              {(query || activeCategory) && (
                <Link
                  href="/blog"
                  className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-2.5 py-2 text-xs font-medium text-[var(--fg-muted)] hover:text-[var(--fg)]"
                >
                  Reset
                </Link>
              )}
            </form>
          </div>
        </section>

        {filteredPosts.length === 0 ? (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-10 text-center">
            <Newspaper className="mx-auto h-10 w-10 text-[var(--fg-muted)]" />
            <h2 className="font-heading mt-3 text-lg font-bold text-[var(--fg)]">
              Artikel Tidak Ditemukan
            </h2>
            <p className="mt-1 text-sm text-[var(--fg-muted)]">
              Tidak ada artikel jurnal yang cocok dengan kata kunci atau filter
              kategori saat ini.
            </p>
            <Link
              href="/blog"
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#92400E] px-4 py-2 text-xs font-semibold text-white hover:bg-[#78350F]"
            >
              Tampilkan Semua Artikel
            </Link>
          </div>
        ) : (
          <section
            aria-label="Daftar Artikel Jurnal"
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {filteredPosts.map((post) => {
              const formattedDate = new Date(
                post.publishedAt
              ).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });

              return (
                <article
                  key={post.id}
                  className="book-card-3d flex flex-col justify-between rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-xs"
                >
                  <div>
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="rounded-full bg-[#92400E]/15 px-2.5 py-0.5 font-semibold text-[#92400E] dark:text-amber-300">
                        {post.category}
                      </span>
                      <div className="flex items-center gap-3 text-[var(--fg-muted)]">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {post.readTimeMinutes} mnt
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MessageSquare className="h-3.5 w-3.5" />
                          {post._count.comments}
                        </span>
                      </div>
                    </div>

                    <h2 className="font-heading line-clamp-2 text-lg leading-snug font-bold text-[var(--fg)]">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="hover:text-[#92400E] dark:hover:text-amber-400"
                      >
                        {post.title}
                      </Link>
                    </h2>

                    <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-[var(--fg-muted)]">
                      {post.excerpt}
                    </p>
                  </div>

                  <div className="mt-5 border-t border-[var(--border)] pt-3.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs">
                        <UserCheck className="h-4 w-4 text-[#92400E]" />
                        <div>
                          <p className="font-semibold text-[var(--fg)]">
                            {post.authorName}
                          </p>
                          <p className="text-[11px] text-[var(--fg-muted)]">
                            {post.authorRole} &bull; {formattedDate}
                          </p>
                        </div>
                      </div>

                      <Link
                        href={`/blog/${post.slug}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-[var(--fg)] transition-colors hover:border-[#92400E] hover:bg-[#92400E] hover:text-white"
                      >
                        Baca
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
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