import Link from "next/link";
import {
  Newspaper,
  Clock,
  MessageSquare,
  Sparkles,
  ArrowRight,
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

      </div>
    </div>
  );
}